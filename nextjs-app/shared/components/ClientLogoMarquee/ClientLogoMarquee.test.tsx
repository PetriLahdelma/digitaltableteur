import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ClientLogoMarquee } from "./ClientLogoMarquee";

const useAnimationContextMock = vi.fn(() => ({
  motionPreference: "full" as const,
  isReady: true,
}));

vi.mock("@/providers/AnimationProvider", () => ({
  useAnimationContext: () => useAnimationContextMock(),
}));

describe("ClientLogoMarquee", () => {
  afterEach(() => {
    useAnimationContextMock.mockReset();
    useAnimationContextMock.mockReturnValue({
      motionPreference: "full",
      isReady: true,
    });
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
    useAnimationContextMock.mockReturnValue({
      motionPreference: "reduced",
      isReady: true,
    });

    const { container } = render(
      <ClientLogoMarquee ariaLabel="Selected client organisations" />,
    );

    expect(
      container.querySelector(".client-logo-marquee-container"),
    ).not.toBeInTheDocument();
    expect(screen.getAllByRole("img")).toHaveLength(18);
  });
});
