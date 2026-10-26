import { randomUUID } from "node:crypto";

import { eq } from "drizzle-orm";

import { RETENTION } from "../data-policy";
import { auditLog, clients, invites } from "../db/schema";
import { getQuestionnaire } from "../index";
import { openJson, sealJson } from "../security/envelope";
import { emailLookupKey, generateToken, hashToken, normaliseEmail } from "../security/tokens";
import type { IntakeLocale } from "../types";
import { HOUR, type IntakeContext, type IntakeMail } from "./context";
import { inviteMail } from "./mail";

export type ClientContact = Readonly<{ email: string; name: string }>;

export function clientAad(clientId: string): string {
  return `client:${clientId}`;
}

export function openContact(ctx: Pick<IntakeContext, "ring">, row: { id: string; contactSealed: unknown }): ClientContact {
  return openJson<ClientContact>(row.contactSealed as never, ctx.ring, clientAad(row.id));
}

/** Link in the invite email. The token rides in the fragment, which never reaches a server, log or analytics beacon. */
export function inviteLink(origin: string, token: string, locale: IntakeLocale): string {
  return `${origin}/intake/start?lang=${locale}#t=${token}`;
}

/**
 * Creates (or reuses) the client and a fresh invite. Owner only: called from
 * the admin area, never from a public route. Returns the email to send.
 */
export async function createInvite(
  ctx: IntakeContext,
  input: { email: string; name: string; questionnaireId: string; locale: IntakeLocale },
): Promise<{ inviteId: string; clientId: string; token: string; mail: IntakeMail }> {
  const questionnaire = getQuestionnaire(input.questionnaireId);
  if (!questionnaire) throw new Error(`Unknown questionnaire ${input.questionnaireId}`);
  const email = normaliseEmail(input.email);
  const lookup = emailLookupKey(email, ctx.hmacKey);
  const now = ctx.now();
  const token = generateToken();
  const expires = new Date(now.getTime() + RETENTION.inviteLinkHours * HOUR);

  const result = await ctx.db.transaction(async (tx) => {
    const [existing] = await tx.select().from(clients).where(eq(clients.emailLookup, lookup));
    let clientId = existing?.id;
    if (!clientId) {
      clientId = randomUUID();
      await tx.insert(clients).values({
        id: clientId,
        emailLookup: lookup,
        contactSealed: sealJson({ email, name: input.name.trim() }, ctx.ring, clientAad(clientId)),
      });
    }
    const inviteId = randomUUID();
    await tx.insert(invites).values({
      id: inviteId,
      clientId,
      questionnaireId: questionnaire.id,
      questionnaireVersion: questionnaire.version,
      locale: input.locale,
      tokenHash: hashToken(token),
      tokenExpiresAt: expires,
    });
    await tx.insert(auditLog).values({ actor: "owner", action: "invite.create", clientId, inviteId });
    return { inviteId, clientId };
  });

  return {
    ...result,
    token,
    mail: inviteMail({
      to: email,
      name: input.name.trim(),
      locale: input.locale,
      questionnaire: questionnaire.title[input.locale],
      link: inviteLink(ctx.origin, token, input.locale),
      expires,
    }),
  };
}
