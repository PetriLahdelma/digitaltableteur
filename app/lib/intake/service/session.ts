import { cookies } from "next/headers";

import { SESSION_COOKIE, readSession, type ClientSession } from "./auth";
import type { IntakeContext } from "./context";
import { intakeContext } from "./runtime";

/** The signed-in client for a server component or route handler, or null. */
export async function currentClient(): Promise<{ ctx: IntakeContext; session: ClientSession | null }> {
  const ctx = await intakeContext();
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return { ctx, session: await readSession(ctx, token) };
}
