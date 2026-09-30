import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
    expect(
      container.querySelectorAll(".client-logo-marquee-track"),
    ).toHaveLength(1);
    expect(container.querySelectorAll("[data-marquee-group]")).toHaveLength(2);
    expect(
      screen.getByRole("button", { name: "Pause client logo animation" }),
    ).toHaveAttribute("aria-pressed", "false");
  });

  it("lets the visitor pause and resume the animation", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <ClientLogoMarquee
        ariaLabel="Selected client organisations"
        pauseLabel="Pause logos"
        resumeLabel="Resume logos"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Pause logos" }));
    expect(container.querySelector("[data-paused='true']")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Resume logos" }),
    ).toHaveAttribute("aria-pressed", "true");

    await user.click(screen.getByRole("button", { name: "Resume logos" }));
    expect(
      container.querySelector("[data-paused='true']"),
    ).not.toBeInTheDocument();
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
    expect(container.querySelectorAll("img[aria-hidden='true']")).toHaveLength(
      19,
    );
    expect(screen.getByText("DSharp")).toBeInTheDocument();
  });

  it("exposes one semantic client list for assistive tech and crawlers", () => {
    render(<ClientLogoMarquee ariaLabel="Selected client organisations" />);

    expect(screen.getByText("SAP")).toBeInTheDocument();
    expect(screen.getByText("DSharp")).toBeInTheDocument();
    expect(screen.getAllByText("SAP")).toHaveLength(1);
    expect(screen.queryByRole("img", { name: "SAP" })).not.toBeInTheDocument();
  });
});
