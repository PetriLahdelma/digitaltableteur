/**
 * Stub for `next/navigation` in Vitest and Storybook (Vite alias).
 *
 * Avoids loading Next's App Router context, which is not mounted outside the
 * Next.js app (Storybook, unit tests).
 */
const noop = () => undefined;

export function useRouter() {
  return {
    push: noop,
    replace: noop,
    prefetch: noop,
    back: noop,
    forward: noop,
    refresh: noop,
  };
}

export function usePathname() {
  return "/";
}

export function useSearchParams() {
  return new URLSearchParams();
}

export function useParams() {
  return {} as Record<string, string | string[]>;
}

export const redirect = noop;
export const notFound = noop;
