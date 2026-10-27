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
import { and, asc, eq, gt, isNull, lte, ne, or } from "drizzle-orm";

import { RETENTION } from "../data-policy";
import { adminChallenges, adminCredentials, adminEnrolments, auditLog, sessions, type AdminChallengePurpose } from "../db/schema";
import { generateToken, hashToken } from "../security/tokens";
import { HOUR, MINUTE, type IntakeContext, type IntakeMail } from "./context";
import { ownerPasskeyMail } from "./owner-mail";

/**
 * Owner sign-in to the intake admin area: passkeys only (README 6a). There is
 * no admin sign-up; the first passkey needs a one-time enrolment token from
 * `npm run intake:admin-enrol`, later ones an admin session.
 */
export const ADMIN_COOKIE = "__Host-intake-admin";
export const ADMIN_PREAUTH_COOKIE = "__Host-intake-admin-pre";

const CHALLENGE_MINUTES = 5;
export const ENROLMENT_MINUTES = 15;
/**
 * Adding or removing a passkey from inside admin needs a sign-in this
 * recent, so a stolen session cookie alone cannot swap the owner's passkeys
 * for the attacker's (step-up).
 */
export const STEP_UP_MINUTES = 10;
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

/** Short, non-reversible tag for audit entries: which passkey, without storing its id twice. */
const credentialTag = (id: string) => id.slice(0, 12);

const passkeysLink = (ctx: Pick<IntakeContext, "origin">) => `${ctx.origin}/intake/admin/passkeys`;

/** True when the session was started recently enough to change passkeys. */
export function isFreshAdminSession(ctx: Pick<IntakeContext, "now">, session: AdminSession): boolean {
  return ctx.now().getTime() - session.createdAt.getTime() <= STEP_UP_MINUTES * MINUTE;
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
  | Readonly<{ status: "forbidden" | "reauth" }>;

/**
 * Who may register: an enrolment token wins when one is given (and is then
 * spent, even by a signed-in owner); otherwise a freshly signed-in session.
 */
async function registrationAccess(
  ctx: IntakeContext,
  access: { enrolmentToken?: string; adminSession?: AdminSession | null },
): Promise<"link" | "admin" | "forbidden" | "reauth"> {
  if (access.enrolmentToken) return (await enrolmentIsValid(ctx, access.enrolmentToken)) ? "link" : "forbidden";
  if (!access.adminSession) return "forbidden";
  return isFreshAdminSession(ctx, access.adminSession) ? "admin" : "reauth";
}

/** Passkey creation options, for an enrolment token or a freshly signed-in owner. */
export async function startRegistration(
  ctx: IntakeContext,
  access: { enrolmentToken?: string; adminSession?: AdminSession | null },
): Promise<RegistrationStart> {
  const via = await registrationAccess(ctx, access);
  if (via === "forbidden" || via === "reauth") return { status: via };
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
  | Readonly<{ status: "ok"; session: { sessionToken: string; expiresAt: Date } | null; ownerMail: IntakeMail }>
  | Readonly<{ status: "forbidden" | "invalid" | "reauth" }>;

/**
 * Stores the new passkey and tells the owner by email. Through an enrolment
 * link the token is spent, every other admin session ends and the owner is
 * signed in with a new one; from a fresh admin session it simply continues.
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
  const via = await registrationAccess(ctx, input);
  if (via === "forbidden" || via === "reauth") return { status: via };
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
  const label = input.label.trim().slice(0, 60) || "Passkey";
  const stored = await ctx.db.transaction(async (tx) => {
    // The enrolment token is spent first, in one conditional update: of two
    // registrations racing with the same link, only one gets the row.
    if (via === "link" && input.enrolmentToken) {
      const spent = await tx
        .update(adminEnrolments)
        .set({ usedAt: now })
        .where(
          and(
            eq(adminEnrolments.tokenHash, hashToken(input.enrolmentToken)),
            isNull(adminEnrolments.usedAt),
            gt(adminEnrolments.expiresAt, now),
          ),
        )
        .returning({ tokenHash: adminEnrolments.tokenHash });
      if (spent.length !== 1) return false;
    }
    await tx.insert(adminCredentials).values({
      id: credential.id,
      publicKey: toBase64Url(credential.publicKey),
      counter: credential.counter,
      transports: credential.transports ?? [],
      label,
      createdAt: now,
    });
    if (via === "link") {
      // Whoever held a session before the link was used is signed out.
      await tx.update(sessions).set({ revokedAt: now }).where(and(eq(sessions.kind, "admin"), isNull(sessions.revokedAt)));
    }
    await tx.insert(auditLog).values({ actor: "owner", action: "admin.passkey.add", detail: { via, label, credential: credentialTag(credential.id) } });
    return true;
  });
  if (!stored) return { status: "forbidden" };
  const session = via === "link" ? await startAdminSession(ctx) : null;
  if (session) await ctx.db.insert(auditLog).values({ actor: "owner", action: "admin.session.start", detail: { via: "enrolment", credential: credentialTag(credential.id) } });
  return {
    status: "ok",
    session,
    ownerMail: ownerPasskeyMail({ change: "added", label, via, at: now, adminLink: passkeysLink(ctx) }),
  };
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
  const { newCounter } = verification.authenticationInfo;
  // Never write an older counter over a newer one from a parallel sign-in.
  await ctx.db
    .update(adminCredentials)
    .set({ counter: newCounter, lastUsedAt: ctx.now() })
    .where(and(eq(adminCredentials.id, row.id), or(eq(adminCredentials.counter, 0), lte(adminCredentials.counter, newCounter))));
  const session = await startAdminSession(ctx);
  await ctx.db.insert(auditLog).values({ actor: "owner", action: "admin.session.start", detail: { via: "passkey", label: row.label, credential: credentialTag(row.id) } });
  return { status: "ok", ...session };
}

export type AdminSession = Readonly<{ idHash: string; createdAt: Date; expiresAt: Date }>;

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
  return { idHash, createdAt: row.createdAt, expiresAt: row.expiresAt };
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

/**
 * Removes a passkey, never the last one: the owner would be locked out. A
 * removed passkey is usually a lost device, so every other admin session ends
 * with it; the session doing the removal stays signed in. Needs a fresh
 * sign-in, and the owner is told by email.
 */
export async function removePasskey(
  ctx: IntakeContext,
  id: string,
  session: AdminSession,
): Promise<{ status: "removed"; ownerMail: IntakeMail } | { status: "last" | "not_found" | "reauth" }> {
  if (!isFreshAdminSession(ctx, session)) return { status: "reauth" };
  const now = ctx.now();
  return ctx.db.transaction(async (tx) => {
    // Every credential row is locked, so two removals at once cannot both
    // see two passkeys and leave none.
    const all = await tx.select({ id: adminCredentials.id, label: adminCredentials.label }).from(adminCredentials).for("update");
    const target = all.find((row) => row.id === id);
    if (!target) return { status: "not_found" } as const;
    if (all.length <= 1) return { status: "last" } as const;
    await tx.delete(adminCredentials).where(eq(adminCredentials.id, id));
    await tx
      .update(sessions)
      .set({ revokedAt: now })
      .where(and(eq(sessions.kind, "admin"), isNull(sessions.revokedAt), ne(sessions.idHash, session.idHash)));
    await tx.insert(auditLog).values({ actor: "owner", action: "admin.passkey.remove", detail: { label: target.label, credential: credentialTag(id) } });
    return {
      status: "removed",
      ownerMail: ownerPasskeyMail({ change: "removed", label: target.label, via: "admin", at: now, adminLink: passkeysLink(ctx) }),
    } as const;
  });
}

/** True once at least one passkey exists (the sign-in page says how to enrol otherwise). */
export async function hasPasskeys(ctx: IntakeContext): Promise<boolean> {
  const [row] = await ctx.db.select({ id: adminCredentials.id }).from(adminCredentials).limit(1);
  return Boolean(row);
}
