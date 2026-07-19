function normalizeText(text) {
  return text.replace(/\s+/g, " ").trim();
}

export function flattenRhythmguardFindings(findings) {
  return Object.keys(findings)
    .sort()
    .flatMap((category) => findings[category] ?? []);
}

export function createStableRhythmguardIds(findings) {
  const occurrences = new Map();

  return flattenRhythmguardFindings(findings)
    .map((finding) => {
      const base = [
        finding.file,
        finding.rule,
        finding.type,
        finding.value,
        normalizeText(finding.text),
      ].join("::");
      const occurrence = (occurrences.get(base) ?? 0) + 1;
      occurrences.set(base, occurrence);
      return `${base}::${occurrence}`;
    })
    .sort();
}
