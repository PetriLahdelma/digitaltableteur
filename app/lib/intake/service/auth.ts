import { and, eq, gt, inArray, isNull, lt, or, sql } from "drizzle-orm";

import { RETENTION } from "../data-policy";
import { auditLog, clients, invites, loginCodes, sessions } from "../db/schema";
import { codeDigest, emailLookupKey, generateCode, generateToken, hashToken, verifyCode } from "../security/tokens";
import type { IntakeLocale } from "../types";
import { HOUR, MINUTE, type IntakeContext, type IntakeMail } from "./context";
import { openContact } from "./invites";
import { getQuestionnaire } from "../index";
import { codeMail } from "./mail";
import { ownerFirstSignInMail } from "./owner-mail";
import { hit, isOver } from "./rate-limit";

/** `__Host-` pins the cookie to this host, HTTPS and path `/` (no Domain attribute). */
export const PREAUTH_COOKIE = "__Host-intake-pre";
export const SESSION_COOKIE = "__Host-intake";

export const MAX_CODE_ATTEMPTS = 5;

export type CodeRequest =
  | Readonly<{ status: "sent"; preauthToken: string; mail: IntakeMail | null; locale: IntakeLocale }>
  | Readonly<{ status: "invalid_invite" }>
  | Readonly<{ status: "rate_limited" }>;

/**
 * The returning-client answer. The lookup and the code are deferred to run
 * after the response, so the request does the same work whether or not the
 * address is known (STRIDE I3).
 */
export type DeferredCodeRequest =
  | Readonly<{ status: "sent"; preauthToken: string; issue: () => Promise<IntakeMail | null> }>
  | Readonly<{ status: "rate_limited" }>;

function codeBinding(clientId: string, preauthHash: string): string {
  return `${clientId}:${preauthHash}`;
}

async function issueCode(
  ctx: IntakeContext,
  client: { id: string; contactSealed: unknown },
  inviteId: string | null,
  locale: IntakeLocale,
  preauthToken: string,
  networkKey: string,
): Promise<IntakeMail | null> {
  // Over a send limit: the caller answers exactly as if a code went out.
  if (!(await hit(ctx, "codesPerClientNetwork", `${client.id}:${networkKey}`))) return null;
  if (!(await hit(ctx, "codesPerClient", client.id))) return null;
  const preauthHash = hashToken(preauthToken);
  const code = generateCode();
  const now = ctx.now();
  await ctx.db.insert(loginCodes).values({
    preauthHash,
    clientId: client.id,
    inviteId,
    digest: codeDigest(code, codeBinding(client.id, preauthHash), ctx.hmacKey),
    attempts: 0,
    expiresAt: new Date(now.getTime() + RETENTION.loginCodeMinutes * MINUTE),
    createdAt: now,
  });
  await ctx.db.insert(auditLog).values({ actor: "client", action: "code.sent", clientId: client.id, inviteId });
  const contact = openContact(ctx, client);
  return codeMail({ to: contact.email, locale, code });
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
  const preauthToken = generateToken();
  const mail = await issueCode(ctx, row.client, row.invite.id, locale, preauthToken, networkKey);
  return { status: "sent", locale, preauthToken, mail };
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
 * and a pre-auth cookie either way (STRIDE I3): the request only counts the
 * network limit and makes a token; `issue` looks the address up and creates
 * the code after the response has been sent.
 */
export async function requestCodeForEmail(
  ctx: IntakeContext,
  email: string,
  locale: IntakeLocale,
  networkKey: string,
): Promise<DeferredCodeRequest> {
  if (!(await hit(ctx, "codeRequestsPerIp", networkKey))) return { status: "rate_limited" };
  const preauthToken = generateToken();
  return {
    status: "sent",
    preauthToken,
    issue: async () => {
      const [client] = await ctx.db.select().from(clients).where(eq(clients.emailLookup, emailLookupKey(email, ctx.hmacKey)));
      if (!client) return null;
      const open = await ctx.db.select({ id: invites.id }).from(invites).where(accessibleInvites(ctx, client.id)).limit(1);
      if (open.length === 0) return null;
      return issueCode(ctx, client, null, locale, preauthToken, networkKey);
    },
  };
}

export type CodeCheck =
  | Readonly<{ status: "ok"; sessionToken: string; expiresAt: Date; ownerMails: IntakeMail[] }>
  | Readonly<{ status: "wrong" | "expired" | "locked" }>;

/**
 * Step 3: redeem the code. The attempt is spent before the comparison, in
 * one conditional update, so parallel guesses cannot exceed the 5 per code.
 * Success spends every pending code and invite link of the client and
 * starts a fresh session.
 */
export async function verifyLoginCode(
  ctx: IntakeContext,
  preauthToken: string,
  code: string,
  networkKey: string,
  onSecurityAlert?: (message: string) => void,
): Promise<CodeCheck> {
  const preauthHash = hashToken(preauthToken);
  const now = ctx.now();
  const [pending] = await ctx.db
    .update(loginCodes)
    .set({ attempts: sql`${loginCodes.attempts} + 1` })
    .where(and(eq(loginCodes.preauthHash, preauthHash), lt(loginCodes.attempts, MAX_CODE_ATTEMPTS), gt(loginCodes.expiresAt, now)))
    .returning();
  if (!pending) {
    const [spent] = await ctx.db.select({ attempts: loginCodes.attempts }).from(loginCodes).where(eq(loginCodes.preauthHash, preauthHash));
    return { status: spent && spent.attempts >= MAX_CODE_ATTEMPTS ? "locked" : "expired" };
  }
  // Daily failure cap for this network across all codes, checked before the comparison.
  const clientNetwork = `${pending.clientId}:${networkKey}`;
  if (await isOver(ctx, "codeFailuresPerClientNetwork", clientNetwork)) return { status: "locked" };

  if (!verifyCode(code, codeBinding(pending.clientId, preauthHash), ctx.hmacKey, pending.digest)) {
    await hit(ctx, "codeFailuresPerClientNetwork", clientNetwork);
    await ctx.db.insert(auditLog).values({ actor: "client", action: "code.failed", clientId: pending.clientId });
    // Many failures from many networks: tell the owner, never lock the client out.
    if (!(await hit(ctx, "codeFailuresPerClient", pending.clientId)) && !(await isOver(ctx, "codeFailureAlerts", pending.clientId))) {
      await hit(ctx, "codeFailureAlerts", pending.clientId);
      await ctx.db.insert(auditLog).values({ actor: "system", action: "code.failures.alert", clientId: pending.clientId });
      onSecurityAlert?.(`intake: wrong-code threshold reached for client ${pending.clientId}`);
    }
    return { status: pending.attempts >= MAX_CODE_ATTEMPTS ? "locked" : "wrong" };
  }

  const sessionToken = generateToken();
  const expiresAt = new Date(now.getTime() + RETENTION.sessionAbsoluteHours * HOUR);
  let started: { id: string; questionnaireId: string; questionnaireVersion: string }[] = [];
  await ctx.db.transaction(async (tx) => {
    // Delete first and check the row count: two parallel redemptions of one code cannot both win.
    const consumed = await tx.delete(loginCodes).where(eq(loginCodes.preauthHash, preauthHash)).returning({ id: loginCodes.clientId });
    if (consumed.length !== 1) throw new CodeRaceError();
    await tx.delete(loginCodes).where(eq(loginCodes.clientId, pending.clientId));
    // Every link the client could still use is spent once they are in; the
    // invites opened for the first time tell the owner (README 6a).
    started = await tx
      .update(invites)
      .set({ status: "active", tokenHash: null, firstSignedInAt: now })
      .where(and(accessibleInvites(ctx, pending.clientId), eq(invites.status, "invited")))
      .returning({ id: invites.id, questionnaireId: invites.questionnaireId, questionnaireVersion: invites.questionnaireVersion });
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
  let ownerMails: IntakeMail[] = [];
  if (started.length > 0) {
    const [client] = await ctx.db.select().from(clients).where(eq(clients.id, pending.clientId));
    const name = client ? openContact(ctx, client).name : "A client";
    ownerMails = started.map((invite) =>
      ownerFirstSignInMail({
        name,
        questionnaire: getQuestionnaire(invite.questionnaireId, invite.questionnaireVersion)?.title.en ?? invite.questionnaireId,
        at: now,
        adminLink: `${ctx.origin}/intake/admin/intakes/${invite.id}`,
      }),
    );
  }
  return { status: "ok", sessionToken, expiresAt, ownerMails };
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
