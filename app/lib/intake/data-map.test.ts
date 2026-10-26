import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { renderDataMap } from "./data-policy";
import { listQuestionnaires } from "./index";

describe("docs/intake/data-map.md", () => {
  it("matches the questionnaire definitions (run npm run generate:intake-data-map)", () => {
    const onDisk = readFileSync(join(process.cwd(), "docs", "intake", "data-map.md"), "utf8");
    expect(onDisk).toBe(renderDataMap(listQuestionnaires()));
  });
});
