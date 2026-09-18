import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { useNavigationPathname } from "@/nextjs-app/shared/lib/navigation";

const navigation = vi.hoisted(() => ({ pathname: "/" }));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

import {
  NextNavigationProvider,
  normalizePathname,
} from "./NextNavigationProvider";

function Probe() {
  return <output>{useNavigationPathname() ?? "null"}</output>;
}

describe("normalizePathname", () => {
  it("maps Vercel's ISR root alias back to /", () => {
    expect(normalizePathname("/index")).toBe("/");
  });

  it("strips a trailing /index alias from nested routes", () => {
    expect(normalizePathname("/blog/index")).toBe("/blog");
  });

  it("leaves ordinary paths and null untouched", () => {
    expect(normalizePathname("/work")).toBe("/work");
    expect(normalizePathname("/index-of-things")).toBe("/index-of-things");
    expect(normalizePathname(null)).toBeNull();
  });
});

describe("NextNavigationProvider", () => {
  it("exposes the normalised pathname to design-system consumers", () => {
    navigation.pathname = "/index";
    render(
      <NextNavigationProvider>
        <Probe />
      </NextNavigationProvider>,
    );
    expect(screen.getByRole("status")).toHaveTextContent("/");
  });
});
