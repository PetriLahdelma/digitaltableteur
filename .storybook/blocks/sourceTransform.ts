import en from "../../nextjs-app/shared/locales/en/translation.json";

const translations = en as Record<string, string>;

/**
 * Storybook `docs.source.transform`: strips story scaffolding so copied code
 * looks like consumer code (the Astryx copyright-strip pattern, ours strips
 * i18n test helpers and template wrappers instead).
 */
export function dtSourceTransform(code: string): string {
  let out = code;

  // <Label tKey="x" /> is a stories-only i18n helper; show the EN string.
  out = out.replace(
    /<Label\s+tKey=["']([^"']+)["']\s*\/>/g,
    (match, key: string) => translations[key] ?? match,
  );

  // (args) => <X {...args} /> and bare () => <X /> arrow prefixes add
  // nothing for readers; show the JSX only.
  out = out.replace(/^\s*\(\s*(?:args)?\s*\)\s*=>\s*(<[\s\S]+)$/, "$1");

  // Dedent by the common leading whitespace across non-empty lines.
  const lines = out.split("\n");
  const indents = lines
    .filter((line) => line.trim().length > 0)
    .map((line) => line.match(/^\s*/)?.[0].length ?? 0);
  const commonIndent = indents.length > 0 ? Math.min(...indents) : 0;
  if (commonIndent > 0) {
    out = lines
      .map((line) =>
        line.trim().length > 0 ? line.slice(commonIndent) : line.trim(),
      )
      .join("\n");
  }

  return out.trim();
}
