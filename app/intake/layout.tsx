import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { currentAdmin } from "@/app/lib/intake/service/admin-http";
import { getClientName } from "@/app/lib/intake/service/invites";
import { isIntakeConfigured } from "@/app/lib/intake/service/runtime";
import { currentClient } from "@/app/lib/intake/service/session";

import { IntakeChrome } from "./_components/IntakeChrome";

/** Unconfigured, the 404 keeps the site's own metadata, as anywhere else. */
export function generateMetadata(): Metadata {
  if (!isIntakeConfigured()) return {};
  return {
    title: "Client intake | Digitaltableteur",
    robots: { index: false, follow: false, nocache: true },
    referrer: "no-referrer",
  };
}

/** Whether the owner's admin session is present (false when the database is unreachable). */
async function adminSignedIn(): Promise<boolean> {
  try {
    return Boolean((await currentAdmin()).admin);
  } catch {
    return false;
  }
}

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
  // Without keys and a database there is no intake: the site's own 404, not a crash.
  if (!isIntakeConfigured()) notFound();
  return (
    <div data-sentry-block>
      <IntakeChrome accountName={await accountName()} adminSignedIn={await adminSignedIn()} />
      {children}
    </div>
  );
}
