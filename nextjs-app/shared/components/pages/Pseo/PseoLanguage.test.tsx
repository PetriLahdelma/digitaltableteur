import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

describe("PSEO page language boundaries", () => {
  it.each(["PseoIndexPage", "PseoLeafPage", "PseoPillarPage"])(
    "%s marks its English-only PageLayout",
    (name) => {
      const here = dirname(fileURLToPath(import.meta.url));
      const source = readFileSync(join(here, `${name}.tsx`), "utf8");

      expect(source).toMatch(/<div className={styles\.root} lang="en">/);
    },
  );
});
