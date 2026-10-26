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
      console.error(`[intake] ${route} mail failed:`, error instanceof Error ? error.message : "unknown error");
    }
  });
}
