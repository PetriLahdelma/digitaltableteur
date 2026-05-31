/**
 * Site-wide booking configuration (Donny chat + /contact page).
 *
 * Nothing is inferred from the codebase — you must set env vars after creating
 * Cal.com or Calendly event types. Until then, `configured` is false and UI
 * falls back to the contact form / email.
 *
 * Setup (Cal.com — recommended):
 *   NEXT_PUBLIC_SITE_BOOKING_PROVIDER=calcom
 *   NEXT_PUBLIC_SITE_BOOKING_CALCOM_BASE=https://cal.eu/your-username/30min
 *   (Use cal.com or cal.eu — match the domain shown in your Cal.com dashboard.)
 *
 * Setup (Calendly):
 *   NEXT_PUBLIC_SITE_BOOKING_PROVIDER=calendly
 *   NEXT_PUBLIC_SITE_BOOKING_CALENDLY_URL=https://calendly.com/your-username/discovery
 *
 * Legacy aliases (still supported): NEXT_PUBLIC_DONNY_BOOKING_* / DONNY_BOOKING_*
 */
export type SiteBookingProvider = "calcom" | "calendly" | "none";

export type SiteMeetingType = "discovery" | "consultation";

export interface SiteBookingRequest {
  meetingType?: SiteMeetingType;
  packageId?: string;
  name?: string;
  email?: string;
  notes?: string;
}

export interface SiteBookingConfig {
  configured: boolean;
  provider: SiteBookingProvider;
  meetingLabel: string;
  embedUrl: string;
  fallbackUrl: string;
  prefillApplied: boolean;
  /** Cal.com path, e.g. digitaltableteur/30min — used by @calcom/embed-react */
  calLink?: string;
  /** Public Cal.com origin, e.g. https://cal.eu */
  calOrigin?: string;
  /** Embed script host, e.g. https://app.cal.eu/embed/embed.js */
  embedJsUrl?: string;
}

export interface SiteBookingSetupStatus {
  configured: boolean;
  provider: SiteBookingProvider;
  missing: string[];
  hints: string[];
}

const PACKAGE_EVENT_SLUGS: Record<string, string> = {
  "ux-sprint": "ux-sprint",
  "design-system-lift-off": "design-system-consultation",
  "ai-ready-designops": "ai-designops-discovery",
};

const MEETING_EVENT_SLUGS: Record<SiteMeetingType, string> = {
  discovery: "discovery",
  consultation: "consultation",
};

const ENV_KEYS = {
  provider: [
    "NEXT_PUBLIC_SITE_BOOKING_PROVIDER",
    "NEXT_PUBLIC_DONNY_BOOKING_PROVIDER",
    "DONNY_BOOKING_PROVIDER",
  ],
  calcomBase: [
    "NEXT_PUBLIC_SITE_BOOKING_CALCOM_BASE",
    "NEXT_PUBLIC_DONNY_BOOKING_CALCOM_BASE",
    "DONNY_BOOKING_CALCOM_BASE",
  ],
  calcomDefaultEvent: [
    "NEXT_PUBLIC_SITE_BOOKING_CALCOM_DEFAULT_EVENT",
    "NEXT_PUBLIC_DONNY_BOOKING_CALCOM_DEFAULT_EVENT",
    "DONNY_BOOKING_CALCOM_DEFAULT_EVENT",
  ],
  calendlyUrl: [
    "NEXT_PUBLIC_SITE_BOOKING_CALENDLY_URL",
    "NEXT_PUBLIC_DONNY_BOOKING_CALENDLY_URL",
    "DONNY_BOOKING_CALENDLY_URL",
  ],
} as const;

/**
 * Next.js only inlines NEXT_PUBLIC_* when accessed statically (process.env.FOO),
 * not via process.env[dynamicKey]. Each resolver must use literal property names.
 */
function readEnvValues(values: readonly (string | undefined)[]): string | undefined {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) return trimmed;
  }
  return undefined;
}

function resolveCalComBaseUrl(): string | undefined {
  return readEnvValues([
    process.env.NEXT_PUBLIC_SITE_BOOKING_CALCOM_BASE,
    process.env.NEXT_PUBLIC_DONNY_BOOKING_CALCOM_BASE,
    process.env.DONNY_BOOKING_CALCOM_BASE,
  ]);
}

function resolveCalendlyUrl(): string | undefined {
  return readEnvValues([
    process.env.NEXT_PUBLIC_SITE_BOOKING_CALENDLY_URL,
    process.env.NEXT_PUBLIC_DONNY_BOOKING_CALENDLY_URL,
    process.env.DONNY_BOOKING_CALENDLY_URL,
  ]);
}

function resolveExplicitProvider(): SiteBookingProvider | undefined {
  const raw = readEnvValues([
    process.env.NEXT_PUBLIC_SITE_BOOKING_PROVIDER,
    process.env.NEXT_PUBLIC_DONNY_BOOKING_PROVIDER,
    process.env.DONNY_BOOKING_PROVIDER,
  ])?.toLowerCase();
  if (raw === "calcom" || raw === "calendly" || raw === "none") {
    return raw;
  }
  return undefined;
}

export function resolveSiteBookingProvider(): SiteBookingProvider {
  const explicit = resolveExplicitProvider();
  if (explicit) return explicit;
  if (resolveCalComBaseUrl()) return "calcom";
  if (resolveCalendlyUrl()) return "calendly";
  return "none";
}

export function getSiteBookingSetupStatus(): SiteBookingSetupStatus {
  const provider = resolveSiteBookingProvider();
  const missing: string[] = [];
  const hints: string[] = [];

  if (provider === "none") {
    missing.push("NEXT_PUBLIC_SITE_BOOKING_PROVIDER");
    hints.push(
      "Set NEXT_PUBLIC_SITE_BOOKING_PROVIDER=calcom (or calendly) once your scheduler is ready.",
    );
  }

  if (provider === "calcom" && !resolveCalComBaseUrl()) {
    missing.push("NEXT_PUBLIC_SITE_BOOKING_CALCOM_BASE");
    hints.push(
      "Example: NEXT_PUBLIC_SITE_BOOKING_CALCOM_BASE=https://cal.eu/digitaltableteur/30min",
    );
  }

  if (provider === "calendly" && !resolveCalendlyUrl()) {
    missing.push("NEXT_PUBLIC_SITE_BOOKING_CALENDLY_URL");
    hints.push(
      "Example: NEXT_PUBLIC_SITE_BOOKING_CALENDLY_URL=https://calendly.com/digitaltableteur/discovery",
    );
  }

  const configured =
    provider === "calcom"
      ? Boolean(resolveCalComBaseUrl())
      : provider === "calendly"
        ? Boolean(resolveCalendlyUrl())
        : false;

  return { configured, provider, missing, hints };
}

function resolveEventSlugFromBase(): string | undefined {
  const base = resolveCalComBaseUrl();
  if (!base) return undefined;

  try {
    const segments = new URL(base).pathname.split("/").filter(Boolean);
    if (segments.length >= 2) {
      return segments[segments.length - 1];
    }
  } catch {
    /* ignore invalid base URL */
  }

  return undefined;
}

function resolveEventSlug(input: SiteBookingRequest): string {
  if (input.packageId && PACKAGE_EVENT_SLUGS[input.packageId]) {
    return PACKAGE_EVENT_SLUGS[input.packageId]!;
  }

  const fromBase = resolveEventSlugFromBase();
  if (fromBase) return fromBase;

  const envDefault = readEnvValues([
    process.env.NEXT_PUBLIC_SITE_BOOKING_CALCOM_DEFAULT_EVENT,
    process.env.NEXT_PUBLIC_DONNY_BOOKING_CALCOM_DEFAULT_EVENT,
    process.env.DONNY_BOOKING_CALCOM_DEFAULT_EVENT,
  ]);
  if (envDefault) return envDefault;

  if (input.meetingType && MEETING_EVENT_SLUGS[input.meetingType]) {
    return MEETING_EVENT_SLUGS[input.meetingType];
  }

  return "discovery";
}

function appendQueryParams(
  url: string,
  params: Record<string, string | undefined>,
): string {
  const parsed = new URL(url);
  for (const [key, value] of Object.entries(params)) {
    if (value) parsed.searchParams.set(key, value);
  }
  return parsed.toString();
}

function resolveCalComBookingPath(base: string, eventSlug: string): string {
  const parsed = new URL(base);
  const segments = parsed.pathname.split("/").filter(Boolean);

  // Username/team only — append the event slug from env or request.
  if (segments.length <= 1) {
    const host = segments[0] ?? "";
    return `${parsed.origin}/${host}/${eventSlug}`;
  }

  // Full event URL already provided in CALCOM_BASE.
  return `${parsed.origin}/${segments.join("/")}`;
}

function resolveCalComEmbedOrigin(bookingUrl: string): string {
  const parsed = new URL(bookingUrl);
  const host = parsed.hostname.toLowerCase();

  if (host === "cal.com" || host.endsWith(".cal.com")) {
    parsed.hostname = host === "cal.com" ? "app.cal.com" : `app.${host}`;
    return parsed.origin;
  }

  if (host === "cal.eu" || host.endsWith(".cal.eu")) {
    parsed.hostname = host === "cal.eu" ? "app.cal.eu" : `app.${host}`;
    return parsed.origin;
  }

  return parsed.origin;
}

function resolveCalComMeetingLabel(bookingPath: string, eventSlug: string): string {
  try {
    const slug =
      new URL(bookingPath).pathname.split("/").filter(Boolean).pop() ??
      eventSlug;
    return slug.replace(/-/g, " ");
  } catch {
    return eventSlug.replace(/-/g, " ");
  }
}

function isCalComHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return (
    host === "cal.com" ||
    host === "app.cal.com" ||
    host === "cal.eu" ||
    host === "app.cal.eu" ||
    host.endsWith(".cal.com") ||
    host.endsWith(".cal.eu")
  );
}

function resolveCalComCalLink(bookingPath: string): string {
  const segments = new URL(bookingPath).pathname.split("/").filter(Boolean);
  return segments.join("/");
}

function resolveCalComEmbedJsUrl(bookingPath: string): string {
  return `${resolveCalComEmbedOrigin(bookingPath)}/embed/embed.js`;
}

function buildCalComEmbedUrl(
  input: SiteBookingRequest,
): SiteBookingConfig | null {
  const base = resolveCalComBaseUrl();
  if (!base) return null;

  const eventSlug = resolveEventSlug(input);
  const bookingPath = resolveCalComBookingPath(base, eventSlug);
  const embedOrigin = resolveCalComEmbedOrigin(bookingPath);
  const embedPath = bookingPath.includes("/embed")
    ? bookingPath.replace(/^https?:\/\/[^/]+/, embedOrigin)
    : `${embedOrigin}${new URL(bookingPath).pathname.replace(/\/+$/, "")}/embed`;

  const embedUrl = appendQueryParams(embedPath, {
    embed: "true",
    layout: "column_view",
    useSlotsViewOnSmallScreen: "true",
    name: input.name,
    email: input.email,
    notes: input.notes,
  });

  const fallbackUrl = appendQueryParams(bookingPath, {
    name: input.name,
    email: input.email,
    notes: input.notes,
  });

  return {
    configured: true,
    provider: "calcom",
    meetingLabel: resolveCalComMeetingLabel(bookingPath, eventSlug),
    embedUrl,
    fallbackUrl,
    prefillApplied: Boolean(input.name || input.email || input.notes),
    calLink: resolveCalComCalLink(bookingPath),
    calOrigin: new URL(bookingPath).origin,
    embedJsUrl: resolveCalComEmbedJsUrl(bookingPath),
  };
}

function buildCalendlyEmbedUrl(
  input: SiteBookingRequest,
): SiteBookingConfig | null {
  const base = resolveCalendlyUrl();
  if (!base) return null;

  const embedUrl = appendQueryParams(base, {
    embed_type: "Inline",
    hide_event_type_details: "1",
    hide_gdpr_banner: "1",
    name: input.name,
    email: input.email,
    a1: input.notes,
  });

  const fallbackUrl = appendQueryParams(base, {
    name: input.name,
    email: input.email,
    a1: input.notes,
  });

  let meetingLabel = "intro call";
  try {
    meetingLabel =
      new URL(base).pathname.split("/").filter(Boolean).pop() ?? meetingLabel;
  } catch {
    /* keep default */
  }

  return {
    configured: true,
    provider: "calendly",
    meetingLabel,
    embedUrl,
    fallbackUrl,
    prefillApplied: Boolean(input.name || input.email || input.notes),
  };
}

export function resolveSiteBookingConfig(
  input: SiteBookingRequest = {},
): SiteBookingConfig {
  const provider = resolveSiteBookingProvider();

  if (provider === "calcom") {
    const calcom = buildCalComEmbedUrl(input);
    if (calcom) return calcom;
  }

  if (provider === "calendly") {
    const calendly = buildCalendlyEmbedUrl(input);
    if (calendly) return calendly;
  }

  if (provider === "calcom" || provider === "calendly") {
    const fallback = buildCalComEmbedUrl(input) ?? buildCalendlyEmbedUrl(input);
    if (fallback) return fallback;
  }

  return {
    configured: false,
    provider: "none",
    meetingLabel: "discovery call",
    embedUrl: "",
    fallbackUrl: "/contact",
    prefillApplied: false,
  };
}

export function isAllowedSiteBookingEmbedUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    const host = parsed.hostname.toLowerCase();
    return (
      isCalComHost(host) ||
      host === "calendly.com" ||
      host.endsWith(".calendly.com")
    );
  } catch {
    return false;
  }
}

/** @deprecated Use resolveSiteBookingConfig */
export const resolveDonnyBookingEmbed = resolveSiteBookingConfig;

/** @deprecated Use resolveSiteBookingProvider */
export const resolveDonnyBookingProvider = resolveSiteBookingProvider;

/** @deprecated Use isAllowedSiteBookingEmbedUrl */
export const isAllowedDonnyBookingEmbedUrl = isAllowedSiteBookingEmbedUrl;

export type DonnyBookingProvider = SiteBookingProvider;
export type DonnyMeetingType = SiteMeetingType;
export type DonnyBookingRequest = SiteBookingRequest;
export type DonnyBookingResult = SiteBookingConfig;
