#!/usr/bin/env node
/** Minimal WCAG contrast check on brand primary vs surface */
function luminance(hex) {
  const h = hex.replace("#", "");
  const rgb = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}
function contrast(a, b) {
  const l1 = luminance(a);
  const l2 = luminance(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}
const pairs = [["#041b23", "#ffffff"], ["#f5f5f5", "#23272a"]];
for (const [fg, bg] of pairs) {
  const ratio = contrast(fg, bg);
  if (ratio < 4.5) {
    console.error(`FAIL ${fg} on ${bg}: ${ratio.toFixed(2)}`);
    process.exit(1);
  }
}
console.log("✓ Contrast pairs pass WCAG AA");
