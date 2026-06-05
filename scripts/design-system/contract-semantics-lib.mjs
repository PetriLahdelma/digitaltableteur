/**
 * Shared helpers for v2 semantic contract fields (graph + forbiddenUse).
 */

const COMPONENT_NAME = /^[A-Z][A-Za-z0-9]*$/;

/**
 * @param {unknown} value
 * @returns {string[]}
 */
export function normalizeStringList(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((v) => typeof v === "string" && v.trim()))];
}

/**
 * @param {string[]} a
 * @param {string[]} b
 */
export function sameStringList(a, b) {
  return JSON.stringify(normalizeStringList(a)) === JSON.stringify(normalizeStringList(b));
}

/**
 * @param {object | undefined} agent
 * @returns {{ composesWith: string[], prefersOver: string[], forbiddenUse: string[] }}
 */
export function expectedSemanticFields(agent) {
  return {
    composesWith: normalizeStringList(agent?.composesWith).filter((name) =>
      COMPONENT_NAME.test(name),
    ),
    prefersOver: normalizeStringList(agent?.prefersOver),
    forbiddenUse: normalizeStringList(agent?.forbiddenUse),
  };
}

/**
 * @param {object} contract
 * @param {{ composesWith: string[], prefersOver: string[], forbiddenUse: string[] }} expected
 * @returns {Array<{ kind: string, detail: string }>}
 */
export function diffSemanticFields(contract, expected) {
  const issues = [];
  const actualComposes = normalizeStringList(contract.composesWith).filter(
    (name) => COMPONENT_NAME.test(name),
  );
  const actualPrefers = normalizeStringList(contract.prefersOver);
  const actualForbidden = normalizeStringList(contract.forbiddenUse);

  if (!sameStringList(actualComposes, expected.composesWith)) {
    issues.push({
      kind: "composesWith-drift",
      detail: `expected ${JSON.stringify(expected.composesWith)} — run npm run sync:contract-props -- --write`,
    });
  }
  if (!sameStringList(actualPrefers, expected.prefersOver)) {
    issues.push({
      kind: "prefersOver-drift",
      detail: `expected ${JSON.stringify(expected.prefersOver)} — run npm run sync:contract-props -- --write`,
    });
  }
  if (!sameStringList(actualForbidden, expected.forbiddenUse)) {
    issues.push({
      kind: "forbiddenUse-drift",
      detail: `expected ${JSON.stringify(expected.forbiddenUse)} — run npm run sync:contract-props -- --write`,
    });
  }

  return issues;
}
