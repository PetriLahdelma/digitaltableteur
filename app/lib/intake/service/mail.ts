import { intakeCopy } from "../copy";
import type { IntakeLocale } from "../types";
import type { IntakeMail, Mailer } from "./context";
import { renderMailHtml, type MailBlock } from "./mail-html";
import { MAIL_LOGO } from "./mail-logo";

const DATE_LOCALE: Record<IntakeLocale, string> = { en: "en-GB", fi: "fi-FI", sv: "sv-SE" };

export function formatIntakeDate(date: Date, locale: IntakeLocale): string {
  return new Intl.DateTimeFormat(DATE_LOCALE[locale], { dateStyle: "long", timeStyle: "short", timeZone: "Europe/Helsinki" }).format(date);
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
    ...mail.blocks.map((item) => {
      switch (item.kind) {
        case "code":
          return `${item.label}: ${item.code}`;
        case "button":
          return `${item.label}:\n${item.href}`;
        default:
          return item.text;
      }
    }),
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
}): IntakeMail {
  const t = intakeCopy(input.locale);
  return compose(input.to, input.locale, {
    subject: t("mailInviteSubject"),
    preheader: t("mailInvitePreheader", { questionnaire: input.questionnaire }),
    blocks: [
      { kind: "heading", text: t("mailInviteHeading") },
      { kind: "paragraph", text: `${t("mailInviteGreeting", { name: input.name })}\n${t("mailInviteLead", { questionnaire: input.questionnaire })}` },
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
    console.info(`[intake mail] to ${mail.to}\nSubject: ${mail.subject}\n\n${mail.text}\n`);
  },
};
