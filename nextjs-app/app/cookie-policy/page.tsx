import type { Metadata } from "next";

import { CookiePolicyPage } from "../../shared/components/pages/CookiePolicy";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description:
    "Learn how Digitaltableteur uses cookies for essential functionality, analytics, and marketing.",
};

export default function CookiePolicy() {
  return <CookiePolicyPage />;
}
