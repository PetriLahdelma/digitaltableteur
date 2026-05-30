import type { DonnyTargetId } from "../../data/donny-site-actions";

export const DONNY_PREFILL_CONTACT_EVENT = "donny:prefill-contact";

export interface DonnyContactPrefillDetail {
  projectType?: string;
  message?: string;
  sourceTargetId?: DonnyTargetId;
  packageId?: string;
  serviceId?: string;
}

/** Maps consulting package ids to ContactFormEditorial project-type values. */
export const DONNY_PACKAGE_PROJECT_TYPE: Record<string, string> = {
  "ux-sprint": "component-library",
  "ai-ready-designops": "ai-designops",
  "design-system-lift-off": "ds-audit",
};

export function dispatchDonnyContactPrefill(
  detail: DonnyContactPrefillDetail,
): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<DonnyContactPrefillDetail>(DONNY_PREFILL_CONTACT_EVENT, {
      detail,
    }),
  );
}
