/**
 * Writes docs/intake/data-map.md from the questionnaire definitions.
 * app/lib/intake/data-map.test.ts fails when the file is out of date.
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";

import { renderDataMap } from "../app/lib/intake/data-policy";
import { listQuestionnaires } from "../app/lib/intake";

const target = join(process.cwd(), "docs", "intake", "data-map.md");
writeFileSync(target, renderDataMap(listQuestionnaires()));
console.log(`Wrote ${target}`);
