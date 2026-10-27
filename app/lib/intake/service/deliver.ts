import * as Sentry from "@sentry/nextjs";
import { after } from "next/server";

import type { IntakeMail } from "./context";
import { intakeMailer } from "./runtime";

/**
 * Sends after the response is written, so how long the mail provider takes
 * never tells a caller whether an address is known (STRIDE I3).
 */
export function deliverAfterResponse(mail: IntakeMail | null | (() => Promise<IntakeMail | null>), route: string): void {
  if (!mail) return;
  after(async () => {
    try {
      const message = typeof mail === "function" ? await mail() : mail;
      if (message) await intakeMailer().send(message);
    } catch (error) {
      reportMailFailure(route, error);
    }
  });
}

/**
 * A failed send is reported to Sentry by route and error name only: provider
 * messages can quote the recipient, so the original error is not sent.
 */
export function reportMailFailure(route: string, error: unknown): void {
  const name = error instanceof Error ? error.name : "unknown error";
  Sentry.captureMessage(`[intake] ${route} mail failed: ${name}`, { level: "error", tags: { area: "intake", route, kind: "mail" } });
  console.error(`[intake] ${route} mail failed:`, name);
}

/** Sends now and says whether it worked, for owner actions that report it. */
export async function deliverNow(mail: IntakeMail, route: string): Promise<boolean> {
  try {
    await intakeMailer().send(mail);
    return true;
  } catch (error) {
    reportMailFailure(route, error);
    return false;
  }
}
