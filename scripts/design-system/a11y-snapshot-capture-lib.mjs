/**
 * Storybook AT snapshot capture — includes portaled overlays: dialogs (Modal,
 * etc.) plus Radix dropdown menus (role="menu") and select popovers
 * (role="listbox"), which portal to <body> and were invisible to the snapshot
 * before. Menu/listbox capture is guarded so content already present in
 * another captured part is not captured twice: :not(#storybook-root *)
 * excludes inline menus (in the root snapshot), and :not([role="dialog"] *)
 * / :not([role="alertdialog"] *) excludes ones nested inside a portaled
 * dialog (e.g. CommandPalette's listbox, already in the dialog part).
 * Dialogs keep the historical unguarded selector so existing snapshots stay
 * byte-stable.
 * @param {import('@playwright/test').Page} page
 */
export async function captureStoryAccessibilityTree(page) {
  const parts = [];
  const rootSnap = await page.locator("#storybook-root").ariaSnapshot();
  parts.push(typeof rootSnap === "string" ? rootSnap : String(rootSnap));

  const portaledOverlayGuard =
    ':not(#storybook-root *):not([role="dialog"] *):not([role="alertdialog"] *)';
  const portaled = page.locator(
    '[role="alertdialog"], [role="dialog"], ' +
      `[role="menu"]${portaledOverlayGuard}, [role="listbox"]${portaledOverlayGuard}`,
  );
  const count = await portaled.count();
  for (let i = 0; i < count; i++) {
    const snap = await portaled.nth(i).ariaSnapshot();
    const text = typeof snap === "string" ? snap : String(snap);
    if (text.trim()) parts.push(text);
  }

  return parts.join("\n");
}
