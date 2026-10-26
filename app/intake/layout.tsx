import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Client intake | Digitaltableteur",
  robots: { index: false, follow: false, nocache: true },
  referrer: "no-referrer",
};

/**
 * Intake pages render without the site header, footer, chat or analytics
 * (app/components/SiteChrome.tsx) and under their own CSP (proxy.ts).
 * `data-sentry-block` keeps the whole area out of Sentry session replays.
 */
export default function IntakeLayout({ children }: { children: ReactNode }) {
  return <div data-sentry-block>{children}</div>;
}
