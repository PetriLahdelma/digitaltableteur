import type { Metadata } from "next";

import { CookiePolicyFullFiContent } from "./CookiePolicyFullFiContent";

export const metadata: Metadata = {
  title: "Evästeet – Täysi versio",
  description:
    "Täydellinen eväste- ja tietosuojakäytäntö Digitaltableteurille suostumuksineen ja käsittelykuvauksineen.",
};

export default function CookiePolicyFullFi() {
  return <CookiePolicyFullFiContent />;
}
