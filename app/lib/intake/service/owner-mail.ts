import type { AnswerOutline } from "../answer-text";
import type { IntakeMail } from "./context";
import { mailBlockText, renderMailHtml, type MailBlock } from "./mail-html";
import { formatIntakeDate } from "./mail";

/**
 * Mail to the owner (README 6a). The submit mail is the owner's copy of the
 * intake: every answer in the body and the PDF attached, because receiving
 * the form is what the intake is for. The other notices (first sign-in,
 * expiring invite, passkey changes) carry a name, a status and a link. They
 * go to the contact form inbox unless the sandbox points them elsewhere
 * (INTAKE_OWNER_EMAIL).
 */
export function ownerAddress(): string {
  return process.env.INTAKE_OWNER_EMAIL || process.env.CONTACT_EMAIL_TO || "mail@digitaltableteur.com";
}

const FOOTER = "Sent by the Digitaltableteur client intake to the owner's mailbox.";

function ownerMail(
  subject: string,
  heading: string,
  lines: string[],
  button: { label: string; href: string },
  extra: { blocks?: MailBlock[]; attachments?: IntakeMail["attachments"] } = {},
): IntakeMail {
  const blocks: MailBlock[] = [
    { kind: "heading", text: heading },
    ...lines.map((text) => ({ kind: "paragraph", text }) as const),
    { kind: "button", label: button.label, href: button.href, fallback: "If the button does not work, copy this link into your browser:" },
    ...(extra.blocks ?? []),
  ];
  return {
    to: ownerAddress(),
    subject,
    text: [...blocks.map(mailBlockText), "--", FOOTER].join("\n\n"),
    html: renderMailHtml({ locale: "en", title: subject, preheader: lines[0] ?? heading, brand: "Digitaltableteur", blocks, footer: [FOOTER] }),
    ...(extra.attachments?.length ? { attachments: extra.attachments } : {}),
  };
}

/**
 * The owner's copy of a submission: every answer, grouped by part and section
 * as on the submission page, and the PDF when it rendered. The subject names
 * the client by the name the owner typed on the invite, never by an answer,
 * so a client cannot write into the owner's subject line.
 */
export function ownerSubmittedMail(input: {
  name: string;
  email: string;
  questionnaire: string;
  version: number;
  submittedAt: Date;
  adminLink: string;
  answers: AnswerOutline;
  pdf?: { filename: string; bytes: Buffer } | null;
}): IntakeMail {
  const resubmitted = input.version > 1;
  return ownerMail(
    `${resubmitted ? "Intake resubmitted" : "Intake submitted"}: ${input.name}`,
    resubmitted ? `${input.name} resubmitted their intake` : `${input.name} submitted their intake`,
    [
      `${input.questionnaire}${resubmitted ? `, version ${input.version}` : ""}, ${formatIntakeDate(input.submittedAt, "en")}. Reply to ${input.email}.`,
      input.pdf
        ? "Every answer is below; questions left blank are omitted. The PDF of the full form is attached."
        : "Every answer is below; questions left blank are omitted. The PDF did not attach; download it in admin.",
    ],
    { label: "Open in admin", href: input.adminLink },
    {
      blocks: input.answers.map((page) => ({ kind: "answers", title: page.title, sections: page.sections }) as const),
      attachments: input.pdf ? [{ filename: input.pdf.filename, contentType: "application/pdf", base64: input.pdf.bytes.toString("base64") }] : undefined,
    },
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
