import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
  type AuthenticationResponseJSON,
  type PublicKeyCredentialCreationOptionsJSON,
  type PublicKeyCredentialRequestOptionsJSON,
  type RegistrationResponseJSON,
} from "@simplewebauthn/server";
import { and, asc, count, eq, gt, isNull } from "drizzle-orm";

import { RETENTION } from "../data-policy";
import { adminChallenges, adminCredentials, adminEnrolments, auditLog, sessions, type AdminChallengePurpose } from "../db/schema";
import { generateToken, hashToken } from "../security/tokens";
import { HOUR, MINUTE, type IntakeContext } from "./context";

/**
 * Owner sign-in to the intake admin area: passkeys only (README 6a). There is
 * no admin sign-up; the first passkey needs a one-time enrolment token from
 * `npm run intake:admin-enrol`, later ones an admin session.
 */
export const ADMIN_COOKIE = "__Host-intake-admin";
export const ADMIN_PREAUTH_COOKIE = "__Host-intake-admin-pre";

const CHALLENGE_MINUTES = 5;
export const ENROLMENT_MINUTES = 15;
const RP_NAME = "Digitaltableteur intake admin";
/** One owner, so one fixed WebAuthn user handle. */
const OWNER_USER_ID = new TextEncoder().encode("digitaltableteur-owner");

const toBase64Url = (bytes: Uint8Array) => Buffer.from(bytes).toString("base64url");
const fromBase64Url = (text: string) => new Uint8Array(Buffer.from(text, "base64url"));

function relyingParty(ctx: Pick<IntakeContext, "origin">) {
  return { rpID: new URL(ctx.origin).hostname, origin: ctx.origin };
}

/** A one-time enrolment link token (CLI and sandbox only). */
export async function createEnrolment(ctx: IntakeContext): Promise<{ token: string; expiresAt: Date }> {
  const token = generateToken();
  const expiresAt = new Date(ctx.now().getTime() + ENROLMENT_MINUTES * MINUTE);
  await ctx.db.insert(adminEnrolments).values({ tokenHash: hashToken(token), expiresAt, createdAt: ctx.now() });
  await ctx.db.insert(auditLog).values({ actor: "system", action: "admin.enrolment.create" });
  return { token, expiresAt };
}

async function enrolmentIsValid(ctx: IntakeContext, token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const [row] = await ctx.db
    .select()
    .from(adminEnrolments)
    .where(and(eq(adminEnrolments.tokenHash, hashToken(token)), isNull(adminEnrolments.usedAt), gt(adminEnrolments.expiresAt, ctx.now())));
  return Boolean(row);
}

async function storeChallenge(ctx: IntakeContext, purpose: AdminChallengePurpose, challenge: string): Promise<string> {
  const preauthToken = generateToken();
  await ctx.db.insert(adminChallenges).values({
    preauthHash: hashToken(preauthToken),
    purpose,
    challenge,
    expiresAt: new Date(ctx.now().getTime() + CHALLENGE_MINUTES * MINUTE),
  });
  return preauthToken;
}

/** Spends the challenge whatever the outcome, so an assertion can be tried once. */
async function takeChallenge(ctx: IntakeContext, preauthToken: string | undefined, purpose: AdminChallengePurpose): Promise<string | null> {
  if (!preauthToken) return null;
  const [row] = await ctx.db
    .delete(adminChallenges)
    .where(and(eq(adminChallenges.preauthHash, hashToken(preauthToken)), eq(adminChallenges.purpose, purpose)))
    .returning();
  return row && row.expiresAt > ctx.now() ? row.challenge : null;
}

async function startAdminSession(ctx: IntakeContext): Promise<{ sessionToken: string; expiresAt: Date }> {
  const sessionToken = generateToken();
  const now = ctx.now();
  const expiresAt = new Date(now.getTime() + RETENTION.sessionAbsoluteHours * HOUR);
  await ctx.db.insert(sessions).values({ idHash: hashToken(sessionToken), kind: "admin", clientId: null, createdAt: now, lastSeenAt: now, expiresAt });
  return { sessionToken, expiresAt };
}

export type RegistrationStart =
  | Readonly<{ status: "ok"; options: PublicKeyCredentialCreationOptionsJSON; preauthToken: string }>
  | Readonly<{ status: "forbidden" }>;

/** Passkey creation options, for an enrolment token or a signed-in owner. */
export async function startRegistration(
  ctx: IntakeContext,
  access: { enrolmentToken?: string; adminSession?: AdminSession | null },
): Promise<RegistrationStart> {
  if (!access.adminSession && !(await enrolmentIsValid(ctx, access.enrolmentToken))) return { status: "forbidden" };
  const existing = await ctx.db.select({ id: adminCredentials.id, transports: adminCredentials.transports }).from(adminCredentials);
  const options = await generateRegistrationOptions({
    rpName: RP_NAME,
    rpID: relyingParty(ctx).rpID,
    userName: "owner",
    userDisplayName: "Digitaltableteur",
    userID: OWNER_USER_ID,
    attestationType: "none",
    excludeCredentials: existing.map((row) => ({ id: row.id, transports: row.transports })),
    authenticatorSelection: { residentKey: "required", userVerification: "required" },
  });
  return { status: "ok", options, preauthToken: await storeChallenge(ctx, "register", options.challenge) };
}

export type RegistrationFinish =
  | Readonly<{ status: "ok"; session: { sessionToken: string; expiresAt: Date } | null }>
  | Readonly<{ status: "forbidden" | "invalid" }>;

/**
 * Stores the new passkey. Through an enrolment token the token is spent and
 * the owner is signed in; from an admin session the session simply continues.
 */
export async function finishRegistration(
  ctx: IntakeContext,
  input: {
    preauthToken: string | undefined;
    response: RegistrationResponseJSON;
    label: string;
    enrolmentToken?: string;
    adminSession?: AdminSession | null;
  },
): Promise<RegistrationFinish> {
  const challenge = await takeChallenge(ctx, input.preauthToken, "register");
  if (!challenge) return { status: "invalid" };
  if (!input.adminSession && !(await enrolmentIsValid(ctx, input.enrolmentToken))) return { status: "forbidden" };
  const { rpID, origin } = relyingParty(ctx);
  let verification;
  try {
    verification = await verifyRegistrationResponse({
      response: input.response,
      expectedChallenge: challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      requireUserVerification: true,
    });
  } catch {
    return { status: "invalid" };
  }
  if (!verification.verified) return { status: "invalid" };
  const { credential } = verification.registrationInfo;
  const now = ctx.now();
  await ctx.db.transaction(async (tx) => {
    await tx.insert(adminCredentials).values({
      id: credential.id,
      publicKey: toBase64Url(credential.publicKey),
      counter: credential.counter,
      transports: credential.transports ?? [],
      label: input.label.trim().slice(0, 60) || "Passkey",
      createdAt: now,
    });
    if (!input.adminSession && input.enrolmentToken) {
      await tx.update(adminEnrolments).set({ usedAt: now }).where(eq(adminEnrolments.tokenHash, hashToken(input.enrolmentToken)));
    }
    await tx.insert(auditLog).values({ actor: "owner", action: "admin.passkey.add" });
  });
  return { status: "ok", session: input.adminSession ? null : await startAdminSession(ctx) };
}

/** Sign-in options. No allow list: the passkey is discoverable. */
export async function startAuthentication(ctx: IntakeContext): Promise<{ options: PublicKeyCredentialRequestOptionsJSON; preauthToken: string }> {
  const options = await generateAuthenticationOptions({ rpID: relyingParty(ctx).rpID, userVerification: "required" });
  return { options, preauthToken: await storeChallenge(ctx, "authenticate", options.challenge) };
}

export type AuthenticationFinish =
  | Readonly<{ status: "ok"; sessionToken: string; expiresAt: Date }>
  | Readonly<{ status: "invalid" }>;

export async function finishAuthentication(
  ctx: IntakeContext,
  preauthToken: string | undefined,
  response: AuthenticationResponseJSON,
): Promise<AuthenticationFinish> {
  const challenge = await takeChallenge(ctx, preauthToken, "authenticate");
  if (!challenge) return { status: "invalid" };
  const [row] = await ctx.db.select().from(adminCredentials).where(eq(adminCredentials.id, response.id));
  if (!row) return { status: "invalid" };
  const { rpID, origin } = relyingParty(ctx);
  let verification;
  try {
    verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge: challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      requireUserVerification: true,
      credential: { id: row.id, publicKey: fromBase64Url(row.publicKey), counter: row.counter, transports: row.transports },
    });
  } catch {
    return { status: "invalid" };
  }
  if (!verification.verified) return { status: "invalid" };
  await ctx.db
    .update(adminCredentials)
    .set({ counter: verification.authenticationInfo.newCounter, lastUsedAt: ctx.now() })
    .where(eq(adminCredentials.id, row.id));
  const session = await startAdminSession(ctx);
  await ctx.db.insert(auditLog).values({ actor: "owner", action: "admin.session.start" });
  return { status: "ok", ...session };
}

export type AdminSession = Readonly<{ idHash: string; expiresAt: Date }>;

/** The owner's session, with the same idle and absolute limits as a client's. */
export async function readAdminSession(ctx: IntakeContext, sessionToken: string | undefined): Promise<AdminSession | null> {
  if (!sessionToken) return null;
  const now = ctx.now();
  const idHash = hashToken(sessionToken);
  const [row] = await ctx.db
    .select()
    .from(sessions)
    .where(
      and(
        eq(sessions.idHash, idHash),
        eq(sessions.kind, "admin"),
        isNull(sessions.revokedAt),
        gt(sessions.expiresAt, now),
        gt(sessions.lastSeenAt, new Date(now.getTime() - RETENTION.sessionIdleMinutes * MINUTE)),
      ),
    );
  if (!row) return null;
  if (now.getTime() - row.lastSeenAt.getTime() > MINUTE) {
    await ctx.db.update(sessions).set({ lastSeenAt: now }).where(eq(sessions.idHash, idHash));
  }
  return { idHash, expiresAt: row.expiresAt };
}

export async function endAdminSession(ctx: IntakeContext, sessionToken: string | undefined): Promise<void> {
  if (!sessionToken) return;
  await ctx.db.update(sessions).set({ revokedAt: ctx.now() }).where(and(eq(sessions.idHash, hashToken(sessionToken)), eq(sessions.kind, "admin")));
}

export type AdminPasskey = Readonly<{ id: string; label: string; createdAt: Date; lastUsedAt: Date | null }>;

export async function listPasskeys(ctx: IntakeContext): Promise<AdminPasskey[]> {
  return ctx.db
    .select({ id: adminCredentials.id, label: adminCredentials.label, createdAt: adminCredentials.createdAt, lastUsedAt: adminCredentials.lastUsedAt })
    .from(adminCredentials)
    .orderBy(asc(adminCredentials.createdAt));
}

/** Removes a passkey, never the last one: the owner would be locked out. */
export async function removePasskey(ctx: IntakeContext, id: string): Promise<"removed" | "last" | "not_found"> {
  return ctx.db.transaction(async (tx) => {
    const [target] = await tx.select({ id: adminCredentials.id }).from(adminCredentials).where(eq(adminCredentials.id, id));
    if (!target) return "not_found";
    const [{ total }] = await tx.select({ total: count() }).from(adminCredentials);
    if (total <= 1) return "last";
    await tx.delete(adminCredentials).where(eq(adminCredentials.id, id));
    await tx.insert(auditLog).values({ actor: "owner", action: "admin.passkey.remove" });
    return "removed";
  });
}

/** True once at least one passkey exists (the sign-in page says how to enrol otherwise). */
export async function hasPasskeys(ctx: IntakeContext): Promise<boolean> {
  const [{ total }] = await ctx.db.select({ total: count() }).from(adminCredentials);
  return total > 0;
}
