"use client";

import { PricingPageContent } from "../../../patterns/PricingPageContent";
import { AsciiSceneBackground } from "../AsciiScene";

export function PricingPage() {
  return <PricingPageContent heroBackground={<AsciiSceneBackground scene="notes" />} />;
}

PricingPage.displayName = "PricingPage";
