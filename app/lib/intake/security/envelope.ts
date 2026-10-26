import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

import type { DataKeyring } from "./keys";

/**
 * Envelope encryption for answer documents and PDFs.
 *
 * Each record gets its own random data key. The payload is sealed with that
 * key (AES-256-GCM) and the data key is sealed with the active master key.
 * `aad` binds the ciphertext to its record: a sealed value copied onto another
 * record fails authentication instead of decrypting.
 */

type Part = Readonly<{ iv: string; tag: string; ct: string }>;

export type Sealed = Readonly<{
  v: 1;
  kid: string;
  data: Part;
  key: Part;
}>;

const IV_BYTES = 12;
/** Pinned: without it Node accepts truncated tags down to 4 bytes, which makes forgery feasible. */
const TAG_BYTES = 16;
const BASE64URL = /^[A-Za-z0-9_-]*$/;

function seal(plain: Buffer, key: Buffer, aad: string): Part {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv("aes-256-gcm", key, iv, { authTagLength: TAG_BYTES });
  cipher.setAAD(Buffer.from(aad, "utf8"));
  const ct = Buffer.concat([cipher.update(plain), cipher.final()]);
  return { iv: iv.toString("base64url"), tag: cipher.getAuthTag().toString("base64url"), ct: ct.toString("base64url") };
}

function decode(value: unknown, name: string): Buffer {
  if (typeof value !== "string" || !BASE64URL.test(value)) throw new Error(`Invalid sealed ${name}`);
  return Buffer.from(value, "base64url");
}

function open(part: Part, key: Buffer, aad: string): Buffer {
  const iv = decode(part?.iv, "iv");
  const tag = decode(part?.tag, "tag");
  const ct = decode(part?.ct, "ciphertext");
  if (iv.length !== IV_BYTES) throw new Error("Invalid sealed iv length");
  if (tag.length !== TAG_BYTES) throw new Error("Invalid sealed tag length");
  const decipher = createDecipheriv("aes-256-gcm", key, iv, { authTagLength: TAG_BYTES });
  decipher.setAAD(Buffer.from(aad, "utf8"));
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ct), decipher.final()]);
}

const KID = /^[a-z0-9-]{1,16}$/;

function assertSealed(sealed: Sealed): void {
  if (sealed?.v !== 1) throw new Error("Unsupported sealed version");
  if (typeof sealed.kid !== "string" || !KID.test(sealed.kid)) throw new Error("Invalid sealed key id");
}

function masterKey(keyring: DataKeyring, kid: string): Buffer {
  const key = keyring.keys.get(kid);
  if (!key) throw new Error(`Unknown intake data key ${kid}`);
  return key;
}

export function sealBytes(plain: Buffer, keyring: DataKeyring, aad: string): Sealed {
  const dataKey = randomBytes(32);
  try {
    return {
      v: 1,
      kid: keyring.activeId,
      data: seal(plain, dataKey, `data:${aad}`),
      key: seal(dataKey, masterKey(keyring, keyring.activeId), `key:${keyring.activeId}:${aad}`),
    };
  } finally {
    dataKey.fill(0);
  }
}

export function openBytes(sealed: Sealed, keyring: DataKeyring, aad: string): Buffer {
  assertSealed(sealed);
  const dataKey = open(sealed.key, masterKey(keyring, sealed.kid), `key:${sealed.kid}:${aad}`);
  try {
    return open(sealed.data, dataKey, `data:${aad}`);
  } finally {
    dataKey.fill(0);
  }
}

export function sealJson(value: unknown, keyring: DataKeyring, aad: string): Sealed {
  return sealBytes(Buffer.from(JSON.stringify(value), "utf8"), keyring, aad);
}

export function openJson<T>(sealed: Sealed, keyring: DataKeyring, aad: string): T {
  return JSON.parse(openBytes(sealed, keyring, aad).toString("utf8")) as T;
}

/** Key rotation: re-seal only the data key under the active master key. */
export function rewrap(sealed: Sealed, keyring: DataKeyring, aad: string): Sealed {
  assertSealed(sealed);
  if (sealed.kid === keyring.activeId) return sealed;
  const dataKey = open(sealed.key, masterKey(keyring, sealed.kid), `key:${sealed.kid}:${aad}`);
  try {
    return { ...sealed, kid: keyring.activeId, key: seal(dataKey, masterKey(keyring, keyring.activeId), `key:${keyring.activeId}:${aad}`) };
  } finally {
    dataKey.fill(0);
  }
}
