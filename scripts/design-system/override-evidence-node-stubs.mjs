/**
 * Browser-bundle stubs for node:fs / node:path, aliased in by
 * measure-override-evidence.mjs when bundling ssr-evidence-lib.mjs for the
 * harness page. Only loadComponentContract touches these APIs and the
 * harness never calls it (contracts arrive pre-embedded), so every stub
 * throws to make an accidental call loud instead of silently wrong.
 */
function refuse(name) {
  return () => {
    throw new Error(
      `${name} is not available in the override-evidence browser harness`,
    );
  };
}

export const existsSync = refuse("node:fs existsSync");
export const readFileSync = refuse("node:fs readFileSync");
export const join = refuse("node:path join");
export default {};
