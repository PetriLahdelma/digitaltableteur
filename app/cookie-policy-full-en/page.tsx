import type { Metadata } from "next";

import { CookiePolicyFullEnContent } from "./CookiePolicyFullEnContent";

export const metadata: Metadata = {
  title: "Cookie Policy – Full",
  description:
    "Full cookie and privacy policy for Digitaltableteur, including consent and data handling details.",
};

export const revalidate = 86400;

export default function CookiePolicyFullEn() {
  return <CookiePolicyFullEnContent />;
}
