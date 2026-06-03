"use client";

import { useTranslation } from "react-i18next";
import { CTASection } from "../CTASection/CTASection";

export interface WorkCTAProps {
  /** Override the default title */
  title?: string;
  /** Override the default description */
  description?: string;
  /** Custom className */
  className?: string;
}

export function WorkCTA({ title, description, className }: WorkCTAProps) {
  const { t } = useTranslation();

  return (
    <CTASection
      title={title || t("workCTATitle", "Interested in working together?")}
      description={
        description ||
        t(
          "workCTADescription",
          "Let's discuss how design systems, AI and thoughtful UX can elevate your product.",
        )
      }
      primaryAction={{
        label: t("workCTAPrimary", "Get in touch"),
        href: "/contact",
      }}
      secondaryAction={{
        label: t("workCTASecondary", "View all work"),
        href: "/work",
      }}
      background="brand"
      align="center"
      id="work-cta"
      className={className}
    />
  );
}

WorkCTA.displayName = "WorkCTA";
