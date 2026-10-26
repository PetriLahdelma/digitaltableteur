import { intakeCopy } from "../copy";
import type { IntakeLocale } from "../types";
import type { IntakeMail, Mailer } from "./context";

const DATE_LOCALE: Record<IntakeLocale, string> = { en: "en-GB", fi: "fi-FI", sv: "sv-SE" };

export function formatIntakeDate(date: Date, locale: IntakeLocale): string {
  return new Intl.DateTimeFormat(DATE_LOCALE[locale], { dateStyle: "long", timeStyle: "short", timeZone: "Europe/Helsinki" }).format(date);
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
  return {
    to: input.to,
    subject: t("mailInviteSubject"),
    text: t("mailInviteBody", {
      name: input.name,
      questionnaire: input.questionnaire,
      link: input.link,
      expires: formatIntakeDate(input.expires, input.locale),
    }),
  };
}

export function codeMail(input: { to: string; locale: IntakeLocale; code: string }): IntakeMail {
  const t = intakeCopy(input.locale);
  return { to: input.to, subject: t("mailCodeSubject", { code: input.code }), text: t("mailCodeBody", { code: input.code }) };
}

export function submittedMail(input: { to: string; locale: IntakeLocale; questionnaire: string; date: Date; link: string }): IntakeMail {
  const t = intakeCopy(input.locale);
  return {
    to: input.to,
    subject: t("mailSubmittedSubject"),
    text: t("mailSubmittedBody", {
      questionnaire: input.questionnaire,
      date: formatIntakeDate(input.date, input.locale),
      link: input.link,
    }),
  };
}

/**
 * Sends through Resend from the verified domain (SES eu-west-1). Plain text
 * only: no tracking pixels, no remote images, nothing for a mail client to
 * fetch. Throws on failure so the caller can log an id-only error.
 */
export function resendMailer(apiKey: string, from: string): Mailer {
  return {
    async send(mail) {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ from, to: [mail.to], subject: mail.subject, text: mail.text }),
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
