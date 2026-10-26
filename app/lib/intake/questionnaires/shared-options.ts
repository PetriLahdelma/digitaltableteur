import type { LocalizedCopy } from "../types";
import { TIME_ZONES, timeZoneLabel } from "./time-zones";

type Option = Readonly<{ id: string; label: LocalizedCopy }>;

/** Every IANA time zone; the zone names read the same in every language. */
export const TIME_ZONE_OPTIONS: readonly Option[] = TIME_ZONES.map((zone) => {
  const label = timeZoneLabel(zone);
  return { id: zone, label: { en: label, fi: label, sv: label } };
});

export const CONTACT_METHOD_OPTIONS: readonly Option[] = [
  { id: "email", label: { en: "Email", fi: "Sähköposti", sv: "E-post" } },
  { id: "phone", label: { en: "Phone call", fi: "Puhelu", sv: "Telefonsamtal" } },
  { id: "video", label: { en: "Video call", fi: "Videopuhelu", sv: "Videosamtal" } },
  { id: "text", label: { en: "Text message", fi: "Tekstiviesti", sv: "Sms" } },
];
