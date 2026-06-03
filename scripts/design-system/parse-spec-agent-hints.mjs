/**
 * Extract agent-facing use/avoid hints from component spec.md Do/Don't sections.
 */

/**
 * @param {string | null | undefined} specText
 * @returns {{ useWhen: string[], avoidWhen: string[] }}
 */
export function parseSpecAgentHints(specText) {
  const useWhen = [];
  const avoidWhen = [];
  if (!specText) return { useWhen, avoidWhen };

  const section = specText.match(/## Do \/ don't([\s\S]*?)(?=^## |\Z)/m);
  if (!section) return { useWhen, avoidWhen };

  for (const line of section[1].split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith("- Do:")) {
      useWhen.push(trimmed.slice(5).trim());
    } else if (trimmed.startsWith("- Don't:")) {
      avoidWhen.push(trimmed.slice(8).trim());
    }
  }

  return {
    useWhen: useWhen.slice(0, 8),
    avoidWhen: avoidWhen.slice(0, 8),
  };
}

/**
 * @param {string | null | undefined} specText
 * @returns {string}
 */
export function extractSpecIntent(specText) {
  if (!specText) return "";
  const match = specText.match(/## Intent\n([\s\S]*?)(?=^## |\Z)/m);
  return match ? match[1].replace(/\s+/g, " ").trim() : "";
}
