import type { Metadata } from "next";
import type { ReactNode } from "react";

import { getClientName } from "@/app/lib/intake/service/invites";
import { currentClient } from "@/app/lib/intake/service/session";

import { IntakeChrome } from "./_components/IntakeChrome";

export const metadata: Metadata = {
  title: "Client intake | Digitaltableteur",
  robots: { index: false, follow: false, nocache: true },
  referrer: "no-referrer",
};

/** The signed-in client's name for the header, or null (signed out, or the database is unreachable). */
async function accountName(): Promise<string | null> {
  try {
    const { ctx, session } = await currentClient();
    return session ? await getClientName(ctx, session.clientId) : null;
  } catch {
    return null;
  }
}

/**
 * Intake pages sit in the normal site layout (header, footer, theme and
 * language switchers) without the chat assistant or analytics, under their
 * own CSP (proxy.ts). `data-sentry-block` keeps answers out of Sentry replays.
 */
export default async function IntakeLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div data-sentry-block>
      <IntakeChrome accountName={await accountName()} />
      {children}
    </div>
  );
}
