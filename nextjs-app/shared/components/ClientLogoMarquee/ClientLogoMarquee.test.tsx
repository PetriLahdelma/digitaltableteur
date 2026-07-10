import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ClientLogoMarquee } from "./ClientLogoMarquee";

const useAnimationContextMock = vi.fn(() => ({
  motionPreference: "full" as const,
  isReady: true,
}));

vi.mock("../../lib/animation", () => ({
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
    expect(container.querySelectorAll(".client-logo-marquee-track")).toHaveLength(
      1,
    );
    expect(container.querySelectorAll("[data-marquee-group]")).toHaveLength(2);
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
    expect(screen.getAllByRole("img")).toHaveLength(19);
    expect(screen.getByText("DSharp")).toBeInTheDocument();
  });

  it("exposes one semantic client list for assistive tech and crawlers", () => {
    render(<ClientLogoMarquee ariaLabel="Selected client organisations" />);

    expect(screen.getByText("SAP")).toBeInTheDocument();
    expect(screen.getByText("DSharp")).toBeInTheDocument();
    expect(screen.getAllByText("SAP")).toHaveLength(1);
  });
});
