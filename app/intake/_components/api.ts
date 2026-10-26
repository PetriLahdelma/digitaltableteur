/** JSON calls from intake pages to their route handlers. Same origin only. */
export async function postJson(url: string, body: unknown, method: "POST" | "PUT" = "POST"): Promise<{ httpStatus: number; data: Record<string, unknown> }> {
  try {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      credentials: "same-origin",
      cache: "no-store",
    });
    const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    return { httpStatus: response.status, data };
  } catch {
    return { httpStatus: 0, data: { status: "network" } };
  }
}
