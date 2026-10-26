/**
 * Key material for the intake system, read from the server environment.
 *
 * INTAKE_DATA_KEYS: comma-separated `keyId:base64key` pairs, 32-byte keys.
 *   The first pair is active for new encryption; later pairs only decrypt,
 *   which is how a key is rotated out.
 * INTAKE_HMAC_KEY: base64, at least 32 bytes. Keys the email lookup HMAC and
 *   the one-time code digests.
 */

export type DataKeyring = Readonly<{
  activeId: string;
  keys: ReadonlyMap<string, Buffer>;
}>;

const KEY_ID = /^[a-z0-9-]{1,16}$/;

export function parseDataKeys(raw: string | undefined): DataKeyring {
  if (!raw?.trim()) throw new Error("INTAKE_DATA_KEYS is not set");
  const keys = new Map<string, Buffer>();
  let activeId = "";
  for (const entry of raw.split(",")) {
    const [id, encoded] = entry.trim().split(":");
    if (!id || !encoded || !KEY_ID.test(id)) throw new Error("INTAKE_DATA_KEYS entry must be keyId:base64key");
    const key = Buffer.from(encoded, "base64");
    if (key.length !== 32) throw new Error(`INTAKE_DATA_KEYS key ${id} must be 32 bytes`);
    if (keys.has(id)) throw new Error(`INTAKE_DATA_KEYS repeats key ${id}`);
    keys.set(id, key);
    activeId ||= id;
  }
  return { activeId, keys };
}

export function parseHmacKey(raw: string | undefined): Buffer {
  if (!raw?.trim()) throw new Error("INTAKE_HMAC_KEY is not set");
  const key = Buffer.from(raw.trim(), "base64");
  if (key.length < 32) throw new Error("INTAKE_HMAC_KEY must be at least 32 bytes");
  return key;
}
