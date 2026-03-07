import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ClientLogoMarquee } from "./ClientLogoMarquee";

const useReducedMotionMock = vi.fn(() => false);

vi.mock("framer-motion", async () => {
  const actual = await vi.importActual<typeof import("framer-motion")>(
    "framer-motion",
  );

  return {
    ...actual,
    useReducedMotion: () => useReducedMotionMock(),
  };
});

describe("ClientLogoMarquee", () => {
  afterEach(() => {
    useReducedMotionMock.mockReset();
    useReducedMotionMock.mockReturnValue(false);
  });

  it("renders the animated marquee by default", () => {
    const { container } = render(
      <ClientLogoMarquee ariaLabel="Selected client organisations" />,
    );

    expect(
      container.querySelector(".client-logo-marquee-container"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Selected client organisations" }),
    ).toBeInTheDocument();
  });

  it("renders a static grid when reduced motion is preferred", () => {
    useReducedMotionMock.mockReturnValue(true);

    const { container } = render(
      <ClientLogoMarquee ariaLabel="Selected client organisations" />,
    );

    expect(
      container.querySelector(".client-logo-marquee-container"),
    ).not.toBeInTheDocument();
    expect(screen.getAllByRole("img")).toHaveLength(18);
  });
});
