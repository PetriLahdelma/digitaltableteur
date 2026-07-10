/* cn ships in @digitaltableteur/react; this re-export keeps the `@/lib/utils`
 * specifier working for app-level (non-catalog) call sites. Shared catalog
 * source must keep importing nextjs-app/shared/lib/cn directly — never this
 * file — so the package build cannot resolve into the published package. */
export { cn } from "@digitaltableteur/react";
