/**
 * Docs pages render inside the preview iframe (`iframe.html`), so links that
 * should drive the Storybook manager must target the manager document and
 * survive the production `/storybook/` base path. Pair with `target="_top"`.
 */
export function managerHref(pathParam: string): string {
  if (typeof window === "undefined") return `?path=${pathParam}`;
  const base = window.location.pathname.replace(/iframe\.html.*$/, "");
  return `${base}?path=${pathParam}`;
}
