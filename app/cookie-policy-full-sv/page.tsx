import type { Metadata } from "next";

import { CookiePolicyFullSvContent } from "./CookiePolicyFullSvContent";

export const metadata: Metadata = {
  title: "Cookiepolicy – Fullständig version",
  description:
    "Fullständig cookie- och integritetspolicy för Digitaltableteur med information om samtycke och datahantering.",
};

export const revalidate = 86400;

export default function CookiePolicyFullSv() {
  return <CookiePolicyFullSvContent />;
}
