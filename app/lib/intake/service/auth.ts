import { and, eq, gt, inArray, isNull, or, sql } from "drizzle-orm";

import { RETENTION } from "../data-policy";
import { auditLog, clients, invites, loginCodes, sessions } from "../db/schema";
import { codeDigest, emailLookupKey, generateCode, generateToken, hashToken, verifyCode } from "../security/tokens";
import type { IntakeLocale } from "../types";
import { HOUR, MINUTE, type IntakeContext, type IntakeMail } from "./context";
import { openContact } from "./invites";
import { codeMail } from "./mail";
import { hit, isOver } from "./rate-limit";

/** `__Host-` pins the cookie to this host, HTTPS and path `/` (no Domain attribute). */
export const PREAUTH_COOKIE = "__Host-intake-pre";
export const SESSION_COOKIE = "__Host-intake";

export const MAX_CODE_ATTEMPTS = 5;

export type CodeRequest =
  | Readonly<{ status: "sent"; preauthToken: string; mail: IntakeMail | null; locale: IntakeLocale }>
  | Readonly<{ status: "invalid_invite" }>
  | Readonly<{ status: "rate_limited" }>;

function codeBinding(clientId: string, preauthHash: string): string {
  return `${clientId}:${preauthHash}`;
}

async function issueCode(
  ctx: IntakeContext,
  client: { id: string; contactSealed: unknown },
  inviteId: string | null,
  locale: IntakeLocale,
): Promise<{ preauthToken: string; mail: IntakeMail | null }> {
  const preauthToken = generateToken();
  const preauthHash = hashToken(preauthToken);
  // Over the per-client send limit: answer exactly as if a code went out.
  if (!(await hit(ctx, "codesPerClient", client.id))) return { preauthToken, mail: null };
  const code = generateCode();
  const now = ctx.now();
  const values = {
    clientId: client.id,
    inviteId,
    preauthHash,
    digest: codeDigest(code, codeBinding(client.id, preauthHash), ctx.hmacKey),
    attempts: 0,
    expiresAt: new Date(now.getTime() + RETENTION.loginCodeMinutes * MINUTE),
    createdAt: now,
  };
  // One live code per client: a new request replaces the old one.
  await ctx.db.insert(loginCodes).values(values).onConflictDoUpdate({ target: loginCodes.clientId, set: values });
  await ctx.db.insert(auditLog).values({ actor: "client", action: "code.sent", clientId: client.id, inviteId });
  const contact = openContact(ctx, client);
  return { preauthToken, mail: codeMail({ to: contact.email, locale, code }) };
}

/**
 * Step 2 of the invite flow: the POST behind the Continue button. A GET of
 * the landing page consumes nothing, so mail scanners that prefetch links do
 * no harm (STRIDE S2). The token stays valid until a code is redeemed.
 */
export async function requestCodeForInvite(ctx: IntakeContext, token: string, networkKey: string): Promise<CodeRequest> {
  if (!(await hit(ctx, "codeRequestsPerIp", networkKey))) return { status: "rate_limited" };
  const [row] = await ctx.db
    .select({ invite: invites, client: clients })
    .from(invites)
    .innerJoin(clients, eq(clients.id, invites.clientId))
    .where(and(eq(invites.tokenHash, hashToken(token)), eq(invites.status, "invited"), gt(invites.tokenExpiresAt, ctx.now())));
  if (!row) return { status: "invalid_invite" };
  const locale = row.invite.locale as IntakeLocale;
  const issued = await issueCode(ctx, row.client, row.invite.id, locale);
  return { status: "sent", locale, ...issued };
}

/** Invites a returning client may open: redeemed ones, plus links still inside their 72 hours. */
function accessibleInvites(ctx: IntakeContext, clientId: string) {
  return and(
    eq(invites.clientId, clientId),
    or(inArray(invites.status, ["active", "submitted"]), and(eq(invites.status, "invited"), gt(invites.tokenExpiresAt, ctx.now()))),
  );
}

/**
 * The returning-client flow. Known and unknown addresses get the same answer
 * and a pre-auth cookie either way (STRIDE I3); mail is sent after the
 * response, so its latency does not reveal anything either.
 */
export async function requestCodeForEmail(ctx: IntakeContext, email: string, locale: IntakeLocale, networkKey: string): Promise<CodeRequest> {
  if (!(await hit(ctx, "codeRequestsPerIp", networkKey))) return { status: "rate_limited" };
  const [client] = await ctx.db.select().from(clients).where(eq(clients.emailLookup, emailLookupKey(email, ctx.hmacKey)));
  const open = client ? await ctx.db.select({ id: invites.id }).from(invites).where(accessibleInvites(ctx, client.id)).limit(1) : [];
  if (!client || open.length === 0) return { status: "sent", preauthToken: generateToken(), mail: null, locale };
  const issued = await issueCode(ctx, client, null, locale);
  return { status: "sent", locale, ...issued };
}

export type CodeCheck =
  | Readonly<{ status: "ok"; sessionToken: string; expiresAt: Date }>
  | Readonly<{ status: "wrong" | "expired" | "locked" }>;

/** Step 3: redeem the code. Success consumes the invite token and starts a fresh session. */
export async function verifyLoginCode(ctx: IntakeContext, preauthToken: string, code: string): Promise<CodeCheck> {
  const preauthHash = hashToken(preauthToken);
  const now = ctx.now();
  const [pending] = await ctx.db.select().from(loginCodes).where(eq(loginCodes.preauthHash, preauthHash));
  if (!pending || pending.expiresAt <= now) return { status: "expired" };
  if (pending.attempts >= MAX_CODE_ATTEMPTS || (await isOver(ctx, "codeFailuresPerClient", pending.clientId))) {
    await ctx.db.delete(loginCodes).where(eq(loginCodes.clientId, pending.clientId));
    return { status: "locked" };
  }

  if (!verifyCode(code, codeBinding(pending.clientId, preauthHash), ctx.hmacKey, pending.digest)) {
    await ctx.db
      .update(loginCodes)
      .set({ attempts: sql`${loginCodes.attempts} + 1` })
      .where(eq(loginCodes.clientId, pending.clientId));
    await hit(ctx, "codeFailuresPerClient", pending.clientId);
    await ctx.db.insert(auditLog).values({ actor: "client", action: "code.failed", clientId: pending.clientId });
    return { status: pending.attempts + 1 >= MAX_CODE_ATTEMPTS ? "locked" : "wrong" };
  }

  const sessionToken = generateToken();
  const expiresAt = new Date(now.getTime() + RETENTION.sessionAbsoluteHours * HOUR);
  await ctx.db.transaction(async (tx) => {
    // Delete first and check the row count: two parallel redemptions of one code cannot both win.
    const consumed = await tx
      .delete(loginCodes)
      .where(and(eq(loginCodes.clientId, pending.clientId), eq(loginCodes.preauthHash, preauthHash)))
      .returning({ id: loginCodes.clientId });
    if (consumed.length !== 1) throw new CodeRaceError();
    // Every link the client could still use is spent once they are in.
    await tx
      .update(invites)
      .set({ status: "active", tokenHash: null })
      .where(and(accessibleInvites(ctx, pending.clientId), eq(invites.status, "invited")));
    await tx.insert(sessions).values({
      idHash: hashToken(sessionToken),
      kind: "client",
      clientId: pending.clientId,
      createdAt: now,
      lastSeenAt: now,
      expiresAt,
    });
    await tx.insert(auditLog).values({ actor: "client", action: "session.start", clientId: pending.clientId, inviteId: pending.inviteId });
  });
  return { status: "ok", sessionToken, expiresAt };
}

export class CodeRaceError extends Error {
  constructor() {
    super("Login code already redeemed");
  }
}

export type ClientSession = Readonly<{ clientId: string; idHash: string; expiresAt: Date }>;

/** Resolves the session cookie; idle (30 min) and absolute (12 h) limits both apply. */
export async function readSession(ctx: IntakeContext, sessionToken: string | undefined): Promise<ClientSession | null> {
  if (!sessionToken) return null;
  const now = ctx.now();
  const idleCutoff = new Date(now.getTime() - RETENTION.sessionIdleMinutes * MINUTE);
  const idHash = hashToken(sessionToken);
  const [row] = await ctx.db
    .select()
    .from(sessions)
    .where(
      and(
        eq(sessions.idHash, idHash),
        eq(sessions.kind, "client"),
        isNull(sessions.revokedAt),
        gt(sessions.expiresAt, now),
        gt(sessions.lastSeenAt, idleCutoff),
      ),
    );
  if (!row?.clientId) return null;
  // Touch at most once a minute to keep autosave from writing twice per save.
  if (now.getTime() - row.lastSeenAt.getTime() > MINUTE) {
    await ctx.db.update(sessions).set({ lastSeenAt: now }).where(eq(sessions.idHash, idHash));
  }
  return { clientId: row.clientId, idHash, expiresAt: row.expiresAt };
}

export async function endSession(ctx: IntakeContext, sessionToken: string | undefined): Promise<void> {
  if (!sessionToken) return;
  const [row] = await ctx.db
    .update(sessions)
    .set({ revokedAt: ctx.now() })
    .where(and(eq(sessions.idHash, hashToken(sessionToken)), isNull(sessions.revokedAt)))
    .returning({ clientId: sessions.clientId });
  if (row) await ctx.db.insert(auditLog).values({ actor: "client", action: "session.end", clientId: row.clientId });
}
