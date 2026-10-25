import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { SPRITE_SVG } from "../../../../scripts/design-system/client-logo-metrics-lib.mjs";
import { ClientLogoMarquee } from "./ClientLogoMarquee";
import { CLIENT_LOGO_SPRITE_URL } from "./clientLogoSprite.generated";

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
    const { container } = render(<ClientLogoMarquee ariaLabel="Selected client organisations" />);

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

    const { container } = render(<ClientLogoMarquee ariaLabel="Selected client organisations" />);

    expect(
      container.querySelector(".client-logo-marquee-container"),
    ).not.toBeInTheDocument();
    expect(
      container.querySelectorAll("svg.client-logo-marquee-image[aria-hidden='true']"),
    ).toHaveLength(21);
    expect(screen.getByText("DSharp")).toBeInTheDocument();
  });

  it("draws every logo from the one sprite file, with no image requests", () => {
    const { container } = render(
      <ClientLogoMarquee ariaLabel="Selected client organisations" />,
    );

    expect(container.querySelectorAll("img")).toHaveLength(0);
    const uses = [...container.querySelectorAll(".client-logo-marquee-image use")];
    expect(uses).toHaveLength(42);
    const sprite = readFileSync(path.join(process.cwd(), SPRITE_SVG), "utf8");
    for (const use of uses) {
      const [url, id] = (use.getAttribute("href") ?? "").split("#");
      expect(url).toBe(CLIENT_LOGO_SPRITE_URL);
      expect(sprite).toContain(`<symbol id="${id}"`);
    }
  });


  it("exposes one semantic client list for assistive tech and crawlers", () => {
    render(<ClientLogoMarquee ariaLabel="Selected client organisations" />);

    expect(screen.getByText("SAP")).toBeInTheDocument();
    expect(screen.getByText("DSharp")).toBeInTheDocument();
    expect(screen.getAllByText("SAP")).toHaveLength(1);
    expect(screen.queryByRole("img", { name: "SAP" })).not.toBeInTheDocument();
  });
});
