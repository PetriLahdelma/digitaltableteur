export function normalizeStylelintWarningText(text) {
  return text.replace(/, at line \d+/g, "").replace(/\s+/g, " ").trim();
}

export function assignStylelintWarningIds(items) {
  const occurrences = new Map();

  return [...items]
    .sort(
      (a, b) =>
        a.file.localeCompare(b.file) ||
        a.rule.localeCompare(b.rule) ||
        normalizeStylelintWarningText(a.text).localeCompare(
          normalizeStylelintWarningText(b.text),
        ) ||
        a.line - b.line ||
        a.column - b.column,
    )
    .map((warning) => {
      const key = [
        warning.file,
        warning.rule,
        normalizeStylelintWarningText(warning.text),
      ].join("::");
      const occurrence = (occurrences.get(key) ?? 0) + 1;
      occurrences.set(key, occurrence);
      return { ...warning, id: `${key}::${occurrence}` };
    });
}
