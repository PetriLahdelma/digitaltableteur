import type { IntakeMail } from "./context";
import { renderMailHtml, type MailBlock } from "./mail-html";
import { formatIntakeDate } from "./mail";

/**
 * Notices to the owner (README 6a): a name, a status and a link to admin,
 * never answers. They go to the contact form inbox unless the sandbox points
 * them elsewhere (INTAKE_OWNER_EMAIL).
 */
export function ownerAddress(): string {
  return process.env.INTAKE_OWNER_EMAIL || process.env.CONTACT_EMAIL_TO || "mail@digitaltableteur.com";
}

const FOOTER = "Sent by the Digitaltableteur client intake. Answers never travel by email; open admin to read them.";

function ownerMail(subject: string, heading: string, lines: string[], button: { label: string; href: string }): IntakeMail {
  const blocks: MailBlock[] = [
    { kind: "heading", text: heading },
    ...lines.map((text) => ({ kind: "paragraph", text }) as const),
    { kind: "button", label: button.label, href: button.href, fallback: "If the button does not work, copy this link into your browser:" },
  ];
  return {
    to: ownerAddress(),
    subject,
    text: [heading, ...lines, `${button.label}:\n${button.href}`, "--", FOOTER].join("\n\n"),
    html: renderMailHtml({ locale: "en", title: subject, preheader: lines[0] ?? heading, brand: "Digitaltableteur", blocks, footer: [FOOTER] }),
  };
}

/**
 * The subject names the client by the name the owner typed on the invite,
 * never by an answer such as the company: answers stay out of mail (README
 * 6a), and the client cannot write into the owner's inbox.
 */
export function ownerSubmittedMail(input: {
  name: string;
  questionnaire: string;
  version: number;
  submittedAt: Date;
  adminLink: string;
}): IntakeMail {
  const resubmitted = input.version > 1;
  return ownerMail(
    `${resubmitted ? "Intake resubmitted" : "Intake submitted"}: ${input.name}`,
    resubmitted ? `${input.name} resubmitted their intake` : `${input.name} submitted their intake`,
    [
      `${input.questionnaire}${resubmitted ? `, version ${input.version}` : ""}, ${formatIntakeDate(input.submittedAt, "en")}.`,
      "The answers and the PDF are in admin.",
    ],
    { label: "Open in admin", href: input.adminLink },
  );
}

export function ownerFirstSignInMail(input: { name: string; questionnaire: string; at: Date; adminLink: string }): IntakeMail {
  return ownerMail(
    `Intake started: ${input.name}`,
    `${input.name} opened their intake`,
    [`${input.questionnaire}, first signed in ${formatIntakeDate(input.at, "en")}.`],
    { label: "Open in admin", href: input.adminLink },
  );
}

export function ownerExpiringMail(input: { name: string; questionnaire: string; expiresAt: Date; adminLink: string }): IntakeMail {
  return ownerMail(
    `Invite expires soon: ${input.name}`,
    `${input.name} has not opened their invite yet`,
    [
      `The link to ${input.questionnaire} expires ${formatIntakeDate(input.expiresAt, "en")}.`,
      "Resend it from admin to give them a fresh 72 hours.",
    ],
    { label: "Open in admin", href: input.adminLink },
  );
}

/**
 * Every passkey change and enrolment-link sign-in, so a change the owner did
 * not make is noticed (a stolen session or a leaked enrolment link).
 */
export function ownerPasskeyMail(input: {
  change: "added" | "removed";
  label: string;
  via: "link" | "admin";
  at: Date;
  adminLink: string;
}): IntakeMail {
  const added = input.change === "added";
  return ownerMail(
    added ? `Passkey added: ${input.label}` : `Passkey removed: ${input.label}`,
    added ? "A passkey was added to intake admin" : "A passkey was removed from intake admin",
    [
      `${input.label}, ${formatIntakeDate(input.at, "en")}${added && input.via === "link" ? ", through an enrolment link" : ""}.`,
      !added
        ? "Other admin sessions were signed out. If this was not you, run npm run intake:admin-enrol to get back in."
        : input.via === "admin"
          ? "If this was not you, remove this passkey in admin; that also signs out every other session. Run npm run intake:admin-enrol if you are locked out."
          : "Other admin sessions were signed out. If this was not you, run npm run intake:admin-enrol to get back in, then remove this passkey.",
    ],
    { label: "Open passkeys", href: input.adminLink },
  );
}
