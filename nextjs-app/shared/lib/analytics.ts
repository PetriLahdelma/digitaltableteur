/**
 * GA4 events the site sends on purpose, on top of enhanced measurement.
 *
 * Every helper sends nothing unless analytics consent loaded gtag
 * (DeferredAnalytics) and consent has not been withdrawn since (the
 * `ga-disable-<id>` flag). No helper sends personal data or message text:
 * only where something happened and which offer it concerned.
 *
 * Event plan (register the parameters as event-scoped custom dimensions):
 * - generate_lead {lead_source, engagement_package?}: the contact API
 *   accepted an enquiry. This is the key event; it replaces the old rule
 *   that turned every /contact page view into generate_lead.
 * - chat_start {}: the first message of a Donny conversation.
 * - book_meeting {booking_source}: Cal.com confirmed a booking made in the
 *   embed (DonnyBookingEmbed), from the contact page or the chat.
 * - contact_channel_click {lead_source}: a direct line on the contact page
 *   was used: "email_copy" (the copy button) or "signal" (the Message on Signal button).
 *   It reuses the Lead source dimension; it is not a key event, because a
 *   copied address or an opened chat is not yet an enquiry.
 */
export type LeadSource = "contact_form" | "chat";

type Gtag = (command: "event", name: string, params: Record<string, string>) => void;

export function trackEvent(name: string, params: Record<string, string> = {}): void {
  if (typeof window === "undefined") return;
  const globals = window as unknown as Record<string, unknown>;
  const gtag = globals.gtag;
  if (typeof gtag !== "function") return;
  const disabled = Object.keys(globals).some(
    (key) => key.startsWith("ga-disable-") && globals[key] === true,
  );
  if (disabled) return;
  (gtag as Gtag)("event", name, params);
}

export function trackLead(source: LeadSource, options: { engagementPackage?: string } = {}): void {
  trackEvent("generate_lead", {
    lead_source: source,
    ...(options.engagementPackage ? { engagement_package: options.engagementPackage } : {}),
  });
}
