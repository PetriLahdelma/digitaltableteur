/**
 * Reports a real enquiry to GA4 as the recommended `generate_lead` event.
 *
 * Called only after the contact API accepted a submission, so the GA4 key
 * event counts enquiries, not visits to /contact. It sends nothing unless
 * analytics consent loaded gtag (DeferredAnalytics) and consent has not been
 * withdrawn since (the `ga-disable-<id>` flag), and it never sends personal
 * data: only where the enquiry came from.
 */
export type LeadSource = "contact_form" | "chat";

type Gtag = (command: "event", name: string, params: Record<string, string>) => void;

export function trackLead(source: LeadSource): void {
  if (typeof window === "undefined") return;
  const globals = window as unknown as Record<string, unknown>;
  const gtag = globals.gtag;
  if (typeof gtag !== "function") return;
  const disabled = Object.keys(globals).some(
    (key) => key.startsWith("ga-disable-") && globals[key] === true,
  );
  if (disabled) return;
  (gtag as Gtag)("event", "generate_lead", { lead_source: source });
}
