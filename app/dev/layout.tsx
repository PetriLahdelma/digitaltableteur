import { notFound } from "next/navigation";

/**
 * /dev/* pages are demo and smoke-test harnesses (package consumption checks,
 * Tailwind dogfood cohort). They must not ship on the production deployment;
 * previews and local builds keep them (guard keys on VERCEL_ENV, not NODE_ENV,
 * so `next build && next start` locally still serves them).
 */
export default function DevLayout({ children }: { children: React.ReactNode }) {
  if (process.env.VERCEL_ENV === "production") {
    notFound();
  }
  return children;
}
