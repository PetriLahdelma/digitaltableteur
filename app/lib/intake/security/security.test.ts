import { randomBytes } from "node:crypto";

import { describe, expect, it } from "vitest";

import { openBytes, openJson, rewrap, sealBytes, sealJson } from "./envelope";
import { parseDataKeys, parseHmacKey } from "./keys";
import { canonicalJson, snapshotDigest } from "./snapshot";
import {
  CODE_DIGITS,
  codeDigest,
  emailLookupKey,
  generateCode,
  generateToken,
  hashToken,
  normaliseEmail,
  verifyCode,
} from "./tokens";

const k = () => randomBytes(32).toString("base64");
const ring = parseDataKeys(`k2:${k()},k1:${k()}`);
const hmacKey = parseHmacKey(randomBytes(32).toString("base64"));

describe("keys", () => {
  it("makes the first key active and keeps older keys for decryption", () => {
    expect(ring.activeId).toBe("k2");
    expect([...ring.keys.keys()]).toEqual(["k2", "k1"]);
  });

  it.each([undefined, "", "k1", "k1:short", `K1:${k()}`, `k1:${k()},k1:${k()}`])("rejects %s", (raw) => {
    expect(() => parseDataKeys(raw)).toThrow();
  });

  it("rejects a short HMAC key", () => {
    expect(() => parseHmacKey(randomBytes(16).toString("base64"))).toThrow();
  });
});

describe("tokens and codes", () => {
  it("generates 256-bit url-safe tokens and stores only their digest", () => {
    const token = generateToken();
    expect(Buffer.from(token, "base64url")).toHaveLength(32);
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(hashToken(token)).toMatch(/^[0-9a-f]{64}$/);
    expect(hashToken(token)).toBe(hashToken(token));
    expect(generateToken()).not.toBe(token);
  });

  it("generates 8-digit codes with leading zeros kept", () => {
    for (let i = 0; i < 200; i++) expect(generateCode()).toMatch(new RegExp(`^\\d{${CODE_DIGITS}}$`));
  });

  it("verifies a code only for the invite it was bound to", () => {
    const code = generateCode();
    const digest = codeDigest(code, "invite-a", hmacKey);
    expect(verifyCode(code, "invite-a", hmacKey, digest)).toBe(true);
    expect(verifyCode(code, "invite-b", hmacKey, digest)).toBe(false);
    expect(verifyCode(code === "00000000" ? "00000001" : "00000000", "invite-a", hmacKey, digest)).toBe(false);
  });

  it.each(["", "1234567", "123456789", "1234567a", " 12345678"])("rejects malformed code %j", (code) => {
    expect(verifyCode(code, "invite-a", hmacKey, codeDigest("12345678", "invite-a", hmacKey))).toBe(false);
  });

  it("normalises email before deriving the lookup key", () => {
    expect(normaliseEmail("  Matti.Meikäläinen@Example.FI ")).toBe("matti.meikäläinen@example.fi");
    expect(emailLookupKey("A@Example.com", hmacKey)).toBe(emailLookupKey(" a@example.com", hmacKey));
    expect(emailLookupKey("a@example.com", hmacKey)).not.toBe(emailLookupKey("b@example.com", hmacKey));
  });
});

describe("envelope encryption", () => {
  const answers = { contact_name: "Test Person", services: ["audit"], character_tone: 3 };

  it("round-trips JSON and never stores plaintext", () => {
    const sealed = sealJson(answers, ring, "draft:1");
    expect(JSON.stringify(sealed)).not.toContain("Test Person");
    expect(sealed.kid).toBe("k2");
    expect(openJson(sealed, ring, "draft:1")).toEqual(answers);
  });

  it("fails when the ciphertext is moved to another record", () => {
    const sealed = sealJson(answers, ring, "draft:1");
    expect(() => openJson(sealed, ring, "draft:2")).toThrow();
  });

  it("fails when any byte is tampered with", () => {
    const sealed = sealBytes(Buffer.from("pdf bytes"), ring, "pdf:1");
    const ct = Buffer.from(sealed.data.ct, "base64url");
    ct[0] ^= 1;
    expect(() => openBytes({ ...sealed, data: { ...sealed.data, ct: ct.toString("base64url") } }, ring, "pdf:1")).toThrow();
  });

  it("rejects truncated authentication tags and wrong IV lengths", () => {
    const sealed = sealBytes(Buffer.from("pdf bytes"), ring, "pdf:1");
    const tag = Buffer.from(sealed.data.tag, "base64url");
    const shortTag = { ...sealed, data: { ...sealed.data, tag: tag.subarray(0, 4).toString("base64url") } };
    expect(() => openBytes(shortTag, ring, "pdf:1")).toThrow(/tag length/);
    const shortIv = { ...sealed, data: { ...sealed.data, iv: Buffer.alloc(8).toString("base64url") } };
    expect(() => openBytes(shortIv, ring, "pdf:1")).toThrow(/iv length/);
    const wrappedShortTag = { ...sealed, key: { ...sealed.key, tag: tag.subarray(0, 8).toString("base64url") } };
    expect(() => openBytes(wrappedShortTag, ring, "pdf:1")).toThrow(/tag length/);
  });

  it("rejects malformed sealed records", () => {
    const sealed = sealJson({ a: 1 }, ring, "draft:1");
    expect(() => openJson({ ...sealed, v: 2 as 1 }, ring, "draft:1")).toThrow(/version/);
    expect(() => openJson({ ...sealed, kid: "../k1" }, ring, "draft:1")).toThrow(/key id/);
    expect(() => openJson({ ...sealed, data: { ...sealed.data, ct: "not base64url!" } }, ring, "draft:1")).toThrow(/ciphertext/);
  });

  it("rotates keys by re-wrapping without touching the payload", () => {
    const oldRing = parseDataKeys([...ring.keys].reverse().map(([id, key]) => `${id}:${key.toString("base64")}`).join(","));
    const sealed = sealJson(answers, oldRing, "submission:9");
    expect(sealed.kid).toBe("k1");
    const rotated = rewrap(sealed, ring, "submission:9");
    expect(rotated.kid).toBe("k2");
    expect(rotated.data).toEqual(sealed.data);
    expect(openJson(rotated, ring, "submission:9")).toEqual(answers);
    expect(() => openJson(sealed, parseDataKeys(`k2:${ring.keys.get("k2")!.toString("base64")}`), "submission:9")).toThrow();
  });
});

describe("snapshot digest", () => {
  it("ignores key order and undefined values", () => {
    expect(canonicalJson({ b: 1, a: [2, { d: 1, c: 2 }], z: undefined })).toBe('{"a":[2,{"c":2,"d":1}],"b":1}');
    expect(snapshotDigest({ a: 1, b: 2 })).toBe(snapshotDigest({ b: 2, a: 1 }));
  });

  it("treats composed and decomposed Unicode as the same answer", () => {
    expect(snapshotDigest({ name: "Järvinen" })).toBe(snapshotDigest({ name: "Järvinen" }));
  });

  it("changes when any answer changes", () => {
    expect(snapshotDigest({ a: "x" })).not.toBe(snapshotDigest({ a: "y" }));
  });

  it("rejects non-finite numbers", () => {
    expect(() => canonicalJson({ a: Number.NaN })).toThrow();
  });
});
