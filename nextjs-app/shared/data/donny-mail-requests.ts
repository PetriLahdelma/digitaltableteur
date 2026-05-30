export const DONNY_STUDIO_EMAIL = "mail@digitaltableteur.com";

export type DonnyMailRequestType = "cv" | "portfolio";

export interface DonnyMailRequestTemplate {
  subject: string;
  body: string;
}

export const DONNY_MAIL_REQUESTS: Record<
  DonnyMailRequestType,
  DonnyMailRequestTemplate
> = {
  cv: {
    subject: "CV request — Digitaltableteur",
    body: [
      "Hello Digitaltableteur,",
      "",
      "I would like to request Petri Lahdelma's CV.",
      "",
      "[Optional: brief context about the role, project, or timeline]",
      "",
      "Thank you,",
      "[Your name]",
    ].join("\n"),
  },
  portfolio: {
    subject: "Portfolio request — Digitaltableteur",
    body: [
      "Hello Digitaltableteur,",
      "",
      "I would like to request a curated portfolio or relevant case studies.",
      "",
      "[Optional: describe your project, timeline, or areas of interest]",
      "",
      "Thank you,",
      "[Your name]",
    ].join("\n"),
  },
};

export function buildDonnyMailtoUrl(
  requestType: DonnyMailRequestType,
  email: string = DONNY_STUDIO_EMAIL,
): string {
  const template = DONNY_MAIL_REQUESTS[requestType];
  const params = new URLSearchParams({
    subject: template.subject,
    body: template.body,
  });
  return `mailto:${email}?${params.toString()}`;
}

export function isAllowedDonnyMailtoUrl(url: string): boolean {
  return (
    url.startsWith(`mailto:${DONNY_STUDIO_EMAIL}?`) ||
    url === `mailto:${DONNY_STUDIO_EMAIL}`
  );
}

export function openDonnyMailtoUrl(url: string): boolean {
  if (typeof window === "undefined" || !isAllowedDonnyMailtoUrl(url)) {
    return false;
  }
  window.location.assign(url);
  return true;
}

const MAIL_REQUEST_PHRASE_PREFIX =
  /^(?:please\s+)?(?:(?:can you|could you|i(?:'d| would) like to)\s+)?(?:request|send|get|email|mail)\s+(?:me\s+)?(?:a\s+|an\s+|the\s+)?/i;

function normalizeMailRequestQuery(input: string): string {
  return input.trim().replace(MAIL_REQUEST_PHRASE_PREFIX, "").trim().toLowerCase();
}

/** Map natural-language queries to cv or portfolio mail requests. */
export function resolveDonnyMailRequestType(
  input: string,
): DonnyMailRequestType | null {
  const normalized = normalizeMailRequestQuery(input);
  if (!normalized) return null;

  if (
    normalized === "cv" ||
    normalized === "resume" ||
    normalized === "curriculum vitae" ||
    /\b(cv|resume|curriculum vitae)\b/.test(normalized)
  ) {
    return "cv";
  }

  if (
    normalized === "portfolio" ||
    normalized.includes("portfolio") ||
    normalized.includes("work samples") ||
    normalized.includes("case studies package")
  ) {
    return "portfolio";
  }

  return null;
}
