/**
 * Stub for `next/navigation` used by Vitest.
 *
 * Avoids loading nextjs-app/node_modules/next (second React copy → useContext null).
 */
import { vi } from "vitest";

export function useRouter() {
  return {
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
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

export const redirect = vi.fn();
export const notFound = vi.fn();
