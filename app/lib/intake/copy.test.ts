import { createHash } from "node:crypto";

import { describe, expect, it } from "vitest";

import { SSR_SNAPSHOT_SCRIPT } from "../ssr-snapshot-script";
import { INTAKE_COPY, copyTable, format, resolveIntakeLocale } from "./copy";
import { INTAKE_RESPONSE_HEADERS, SSR_SNAPSHOT_SCRIPT_HASH, intakeCsp, isIntakePath } from "./csp";
import { PRIVACY_NOTICE, PRIVACY_NOTICE_TITLE } from "./privacy-notice";
import { INTAKE_LOCALES, type LocalizedCopy } from "./types";

const EM_DASH = "—";
const MIDDLE_DOT = "·";

function checkCopy(copy: LocalizedCopy, where: string) {
  for (const locale of INTAKE_LOCALES) {
    expect(copy[locale]?.trim(), `${where} is empty in ${locale}`).toBeTruthy();
    expect(copy[locale], `em dash in ${locale}: ${where}`).not.toContain(EM_DASH);
    expect(copy[locale], `middle dot in ${locale}: ${where}`).not.toContain(MIDDLE_DOT);
  }
}

describe("intake copy", () => {
  it("has every string in every locale and follows the house style", () => {
    for (const [key, copy] of Object.entries(INTAKE_COPY)) checkCopy(copy, key);
  });

  it("uses the same placeholders in every locale", () => {
    for (const [key, copy] of Object.entries(INTAKE_COPY)) {
      const placeholders = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();
      for (const locale of INTAKE_LOCALES) expect(placeholders(copy[locale]), `${key} ${locale}`).toEqual(placeholders(copy.en));
    }
  });

  it("keeps answers out of every email template", () => {
    const templates = (Object.keys(INTAKE_COPY) as (keyof typeof INTAKE_COPY)[]).filter((key) => key.startsWith("mail"));
    for (const key of templates) {
      expect(INTAKE_COPY[key].en).not.toMatch(/\{answers?\}/);
    }
  });

  it("formats placeholders and leaves unknown ones visible", () => {
    expect(format("Page {page} of {total}", { page: 1, total: 7 })).toBe("Page 1 of 7");
    expect(format("{missing}")).toBe("{missing}");
    expect(copyTable("fi").submit).toBe("Lähetä");
  });

  it("offers only enabled locales", () => {
    expect(resolveIntakeLocale("fi")).toBe("fi");
    expect(resolveIntakeLocale("sv")).toBe("en");
    expect(resolveIntakeLocale(null, "fi-FI,fi;q=0.9,en;q=0.8")).toBe("fi");
    expect(resolveIntakeLocale(null, "de-DE")).toBe("en");
  });

  it("has a complete privacy notice in every locale", () => {
    checkCopy(PRIVACY_NOTICE_TITLE, "notice title");
    for (const section of PRIVACY_NOTICE) {
      checkCopy(section.title, `notice ${section.title.en}`);
      if (section.body) checkCopy(section.body, `notice ${section.title.en} body`);
      for (const item of section.items ?? []) checkCopy(item, `notice ${section.title.en} item`);
    }
  });
});

describe("intake security headers", () => {
  it("allows the root layout's SSR snapshot script by its current hash", () => {
    const hash = createHash("sha256").update(SSR_SNAPSHOT_SCRIPT, "utf8").digest("base64");
    expect(SSR_SNAPSHOT_SCRIPT_HASH).toBe(`'sha256-${hash}'`);
  });

  it("builds a nonce policy with no third-party hosts", () => {
    const csp = intakeCsp("abc", { dev: false, https: true });
    expect(csp).toContain("script-src 'self' 'nonce-abc' 'strict-dynamic'");
    expect(csp).not.toContain("unsafe-eval");
    expect(csp).not.toMatch(/https:\/\//);
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("upgrade-insecure-requests");
    expect(INTAKE_RESPONSE_HEADERS["Cache-Control"]).toContain("no-store");
    expect(INTAKE_RESPONSE_HEADERS["Referrer-Policy"]).toBe("no-referrer");
  });

  it("matches the intake area and nothing else", () => {
    expect(isIntakePath("/intake")).toBe(true);
    expect(isIntakePath("/intake/forms/x")).toBe(true);
    expect(isIntakePath("/intakes")).toBe(false);
    expect(isIntakePath("/blog/intake")).toBe(false);
  });
});
