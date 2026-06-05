/**
 * Storybook AT snapshot capture — includes portaled overlays (Modal, etc.).
 * @param {import('@playwright/test').Page} page
 */
export async function captureStoryAccessibilityTree(page) {
  const parts = [];
  const rootSnap = await page.locator("#storybook-root").ariaSnapshot();
  parts.push(typeof rootSnap === "string" ? rootSnap : String(rootSnap));

  const portaled = page.locator('[role="alertdialog"], [role="dialog"]');
  const count = await portaled.count();
  for (let i = 0; i < count; i++) {
    const snap = await portaled.nth(i).ariaSnapshot();
    const text = typeof snap === "string" ? snap : String(snap);
    if (text.trim()) parts.push(text);
  }

  return parts.join("\n");
}
