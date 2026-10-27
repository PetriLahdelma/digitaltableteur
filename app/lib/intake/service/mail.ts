import { intakeCopy } from "../copy";
import type { IntakeLocale } from "../types";
import type { IntakeMail, Mailer } from "./context";
import { mailBlockText, renderMailHtml, type MailBlock } from "./mail-html";
import { MAIL_LOGO } from "./mail-logo";
import { INTAKE_TIME_ZONE } from "../data-policy";

const DATE_LOCALE: Record<IntakeLocale, string> = { en: "en-GB", fi: "fi-FI", sv: "sv-SE" };

export function formatIntakeDate(date: Date, locale: IntakeLocale): string {
  return new Intl.DateTimeFormat(DATE_LOCALE[locale], { dateStyle: "long", timeStyle: "short", timeZone: INTAKE_TIME_ZONE }).format(date);
}

type Composed = Readonly<{
  subject: string;
  preheader: string;
  blocks: MailBlock[];
  footer: string[];
}>;

/** One message, two renderings: HTML for mail clients, plain text as the alternative. */
function compose(to: string, locale: IntakeLocale, mail: Composed): IntakeMail {
  const t = intakeCopy(locale);
  const text = [
    ...mail.blocks.map(mailBlockText),
    "--",
    ...mail.footer,
  ].join("\n\n");
  return {
    to,
    subject: mail.subject,
    text,
    html: renderMailHtml({
      locale,
      title: mail.subject,
      preheader: mail.preheader,
      brand: t("mailBrand"),
      blocks: mail.blocks,
      footer: mail.footer,
    }),
  };
}

export function inviteMail(input: {
  to: string;
  name: string;
  locale: IntakeLocale;
  questionnaire: string;
  link: string;
  expires: Date;
  /** The owner's optional personal line, shown under the greeting. */
  note?: string;
}): IntakeMail {
  const t = intakeCopy(input.locale);
  const note = input.note?.trim();
  return compose(input.to, input.locale, {
    subject: t("mailInviteSubject"),
    preheader: t("mailInvitePreheader", { questionnaire: input.questionnaire }),
    blocks: [
      { kind: "heading", text: t("mailInviteHeading") },
      { kind: "paragraph", text: `${t("mailInviteGreeting", { name: input.name })}\n${t("mailInviteLead", { questionnaire: input.questionnaire })}` },
      ...(note ? [{ kind: "paragraph", text: note } as const] : []),
      { kind: "button", label: t("mailInviteButton"), href: input.link, fallback: t("mailLinkFallback") },
      { kind: "note", text: t("mailInviteNote", { expires: formatIntakeDate(input.expires, input.locale) }) },
      { kind: "signature", text: t("mailSignature") },
    ],
    footer: [t("mailFooter")],
  });
}

export function codeMail(input: { to: string; locale: IntakeLocale; code: string }): IntakeMail {
  const t = intakeCopy(input.locale);
  return compose(input.to, input.locale, {
    subject: t("mailCodeSubject", { code: input.code }),
    preheader: t("mailCodePreheader", { code: input.code }),
    blocks: [
      { kind: "heading", text: t("mailCodeHeading") },
      { kind: "paragraph", text: t("mailCodeLead") },
      { kind: "code", label: t("mailCodeLabel"), code: input.code },
      { kind: "note", text: t("mailCodeNote") },
    ],
    footer: [t("mailCodeIgnore"), t("mailFooter")],
  });
}

export function reopenedMail(input: { to: string; locale: IntakeLocale; questionnaire: string; link: string }): IntakeMail {
  const t = intakeCopy(input.locale);
  return compose(input.to, input.locale, {
    subject: t("mailReopenedSubject"),
    preheader: t("mailReopenedLead", { questionnaire: input.questionnaire }),
    blocks: [
      { kind: "heading", text: t("mailReopenedHeading") },
      { kind: "paragraph", text: t("mailReopenedLead", { questionnaire: input.questionnaire }) },
      { kind: "button", label: t("mailReopenedButton"), href: input.link, fallback: t("mailLinkFallback") },
      { kind: "note", text: t("mailReopenedNote") },
      { kind: "signature", text: t("mailSignature") },
    ],
    footer: [t("mailFooter")],
  });
}

export function submittedMail(input: { to: string; locale: IntakeLocale; questionnaire: string; date: Date; link: string }): IntakeMail {
  const t = intakeCopy(input.locale);
  const date = formatIntakeDate(input.date, input.locale);
  return compose(input.to, input.locale, {
    subject: t("mailSubmittedSubject"),
    preheader: t("mailSubmittedPreheader", { date }),
    blocks: [
      { kind: "heading", text: t("mailSubmittedHeading") },
      { kind: "paragraph", text: t("mailSubmittedLead", { questionnaire: input.questionnaire, date }) },
      { kind: "button", label: t("mailSubmittedButton"), href: input.link, fallback: t("mailLinkFallback") },
      { kind: "note", text: t("mailSubmittedNote") },
      { kind: "signature", text: t("mailSignature") },
    ],
    footer: [t("mailFooter")],
  });
}

/**
 * Sends through Resend from the verified domain (SES eu-west-1). HTML with a
 * plain-text alternative; the only image is the brand mark, attached inline,
 * so there are no tracking pixels and nothing for a mail client to fetch.
 * Throws on failure so the caller can log an id-only error.
 */
export function resendMailer(apiKey: string, from: string): Mailer {
  return {
    async send(mail) {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          from,
          to: [mail.to],
          subject: mail.subject,
          html: mail.html,
          text: mail.text,
          attachments: [
            {
              content: MAIL_LOGO.base64,
              filename: MAIL_LOGO.filename,
              content_type: MAIL_LOGO.contentType,
              content_id: MAIL_LOGO.contentId,
            },
            ...(mail.attachments ?? []).map((file) => ({ content: file.base64, filename: file.filename, content_type: file.contentType })),
          ],
        }),
      });
      if (!response.ok) throw new Error(`Intake mail failed: ${response.status}`);
    },
  };
}

/** Development only: prints the mail so the flow can be walked locally. */
export const consoleMailer: Mailer = {
  async send(mail) {
    const files = (mail.attachments ?? []).map((file) => `\nAttached: ${file.filename} (${Math.round((file.base64.length * 3) / 4 / 1024)} KB)`).join("");
    console.info(`[intake mail] to ${mail.to}\nSubject: ${mail.subject}\n\n${mail.text}\n${files}`);
  },
};
