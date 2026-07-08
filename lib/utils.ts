/* cn now lives in the design-system boundary at nextjs-app/shared/lib/cn so it
 * travels with the catalog when it becomes a package. This re-export keeps the
 * `@/lib/utils` specifier working for app-level (non-catalog) call sites. */
export { cn } from "../nextjs-app/shared/lib/cn";
