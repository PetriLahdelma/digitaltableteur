import type { NextRequest } from "next/server";

import { removePasskey } from "@/app/lib/intake/service/admin-auth";
import { requireAdmin } from "@/app/lib/intake/service/admin-http";
import { isSameOrigin, json, serverError } from "@/app/lib/intake/service/http";

export const runtime = "nodejs";
export const preferredRegion = "fra1";
export const dynamic = "force-dynamic";

/** Removes one of the owner's passkeys; the last one stays. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ passkeyId: string }> }) {
  if (!isSameOrigin(request)) return json({ status: "forbidden" }, 403);
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const passkeyId = (await params).passkeyId;
  if (!/^[A-Za-z0-9_-]{1,1024}$/.test(passkeyId)) return json({ status: "not_found" }, 404);
  try {
    const result = await removePasskey(auth.ctx, passkeyId);
    return json({ status: result }, result === "removed" ? 200 : result === "last" ? 409 : 404);
  } catch (error) {
    return serverError("admin.passkey.remove", error);
  }
}
