import type { Metadata } from "next";
import type { ReactNode } from "react";

import { IntakeChrome } from "./_components/IntakeChrome";

export const metadata: Metadata = {
  title: "Client intake | Digitaltableteur",
  robots: { index: false, follow: false, nocache: true },
  referrer: "no-referrer",
};

/**
 * Intake pages sit in the normal site layout (header, footer, theme and
 * language switchers) without the chat assistant or analytics, under their
 * own CSP (proxy.ts). `data-sentry-block` keeps answers out of Sentry replays.
 */
export default function IntakeLayout({ children }: { children: ReactNode }) {
  return (
    <div data-sentry-block>
      <IntakeChrome />
      {children}
    </div>
  );
}
