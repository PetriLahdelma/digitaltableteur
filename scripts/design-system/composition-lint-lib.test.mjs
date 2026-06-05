import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  extractDtImports,
  findIncompatibleImportPairs,
} from "./composition-lint-lib.mjs";

describe("composition-lint-lib", () => {
  it("flags toast, alertbanner, and modal pairings", () => {
    const imports = extractDtImports(`
      import Modal from "@dt/Modal";
      import Toast from "@dt/Toast";
      import AlertBanner from "@dt/AlertBanner";
    `);
    const ids = findIncompatibleImportPairs(imports).map((row) => row.id);
    assert.ok(ids.includes("toast-modal"));
    assert.ok(ids.includes("toast-alertbanner"));
    assert.ok(ids.includes("alertbanner-modal"));
  });

  it("passes for compatible imports", () => {
    const imports = extractDtImports(`
      import Modal from "@dt/Modal";
      import Button from "@dt/Button";
    `);
    assert.equal(findIncompatibleImportPairs(imports).length, 0);
  });
});
