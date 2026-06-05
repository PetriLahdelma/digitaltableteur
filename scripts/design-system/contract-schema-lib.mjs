/**
 * AJV validators for component contract schema v1 (legacy) and v2.
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import("ajv").ValidateFunction | null} */
let validateV1 = null;
/** @type {import("ajv").ValidateFunction | null} */
let validateV2 = null;

function loadValidators() {
  if (validateV1 && validateV2) return { validateV1, validateV2 };
  const ajv = new Ajv2020({ strict: false, allErrors: true });
  addFormats(ajv);
  const v1Path = resolve(__dirname, "contract.schema.json");
  const v2Path = resolve(__dirname, "contract.schema.v2.json");
  validateV1 = ajv.compile(JSON.parse(readFileSync(v1Path, "utf8")));
  validateV2 = ajv.compile(JSON.parse(readFileSync(v2Path, "utf8")));
  return { validateV1, validateV2 };
}

/**
 * @param {Record<string, unknown>} manifest
 */
export function validateContractSchema(manifest) {
  const { validateV1: v1, validateV2: v2 } = loadValidators();
  const version = manifest.schemaVersion ?? 1;
  const validate = version >= 2 ? v2 : v1;
  const ok = validate(manifest);
  return { ok: !!ok, errors: validate.errors ?? [] };
}

export const CONTRACT_SCHEMA_V2_REL =
  "../../../scripts/design-system/contract.schema.v2.json";
