import { afterEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { act, cleanup, render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { EnhancedProjectCard } from "./EnhancedProjectCard";

expect.extend(toHaveNoViolations);

const baseProps = {
  title: "SAP Build Apps Design System",
  slug: "sap-build-apps",
  thumbnail: "/images/portfolio/sap-build-apps/icon.png",
  category: "Design Systems",
  description:
    "Tokens, components, and governance that scale with your product.",
  tags: ["Enterprise", "Low-Code"],
};

describe("EnhancedProjectCard", () => {
  it("renders the title as a level-3 heading", () => {
    render(<EnhancedProjectCard {...baseProps} />);
    expect(
      screen.getByRole("heading", { level: 3, name: baseProps.title }),
    ).toBeInTheDocument();
  });

  it("renders the whole card as a link to the project detail page", () => {
    render(<EnhancedProjectCard {...baseProps} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/work/sap-build-apps");
  });

  it("uses the visible title and one visible description for the link semantics", () => {
    render(<EnhancedProjectCard {...baseProps} />);
    const link = screen.getByRole("link", { name: baseProps.title });
    const labelledBy = link.getAttribute("aria-labelledby");
    const describedBy = link.getAttribute("aria-describedby");
    expect(labelledBy).toBeTruthy();
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(labelledBy as string)).toHaveTextContent(
      baseProps.title,
    );
    const description = document.getElementById(describedBy as string);
    expect(description).toHaveTextContent(baseProps.description);
    expect(screen.getAllByText(baseProps.description)).toHaveLength(1);
    expect(link).toHaveAccessibleDescription(baseProps.description);
  });

  it("marks English project copy without overriding a localized status label", () => {
    render(
      <EnhancedProjectCard
        {...baseProps}
        comingSoon
        comingSoonLabel="Tulossa pian"
        contentLanguage="en"
      />,
    );

    expect(
      screen.getByRole("heading", { name: baseProps.title }),
    ).toHaveAttribute("lang", "en");
    expect(screen.getByText(baseProps.description)).toHaveAttribute(
      "lang",
      "en",
    );
    expect(screen.getByText("Tulossa pian")).not.toHaveAttribute("lang", "en");
  });

  it("marks the thumbnail image as decorative (empty alt)", () => {
    const { container } = render(<EnhancedProjectCard {...baseProps} />);
    const img = container.querySelector("img");
    expect(img).not.toBeNull();
    expect(img).toHaveAttribute("alt", "");
  });

  it("keeps video previews paused unless autoPlayVideo is set", () => {
    const { container } = render(
      <EnhancedProjectCard
        {...baseProps}
        thumbnail="/images/poster.webp"
        videoThumbnail="/images/preview.webm"
      />,
    );
    const video = container.querySelector("video");

    expect(video).toHaveAttribute("preload", "metadata");
    expect(video).toHaveAttribute("poster", "/images/poster.webp");
    expect(video).not.toHaveAttribute("autoplay");
    expect(video).not.toHaveAttribute("loop");
  });

  it("does not hide image assets behind load-state opacity", () => {
    const here = dirname(fileURLToPath(import.meta.url));
    const source = readFileSync(join(here, "EnhancedProjectCard.tsx"), "utf8");
    const css = readFileSync(
      join(here, "EnhancedProjectCard.module.css"),
      "utf8",
    );

    expect(source).not.toContain("assetLoading");
    expect(source).not.toContain("imageLoaded");
    expect(source).not.toContain("styles.skeleton");
    expect(css).not.toMatch(/\.assetLoading\b/);
    expect(css).not.toMatch(/\.skeleton\b/);
  });

  it("ships an aspect-ratio class per variant and guards motion under reduced-motion", () => {
    // The CSS Module carries the styling axes and a full reduced-motion guard.
    // Assert the source so neither can silently rot behind the vitest CSS proxy.
    const here = dirname(fileURLToPath(import.meta.url));
    const css = readFileSync(
      join(here, "EnhancedProjectCard.module.css"),
      "utf8",
    );
    for (const cls of ["square", "video", "portrait", "landscape"]) {
      expect(css).toMatch(new RegExp(`\\.${cls}\\b`));
    }
    expect(css).toMatch(/prefers-reduced-motion:\s*reduce/);
  });

  it("has no axe violations", async () => {
    const { container } = render(<EnhancedProjectCard {...baseProps} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("renders comingSoon as a non-interactive card with the badge", () => {
    render(
      <EnhancedProjectCard
        {...baseProps}
        comingSoon
        comingSoonLabel="Coming soon"
      />,
    );
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText("Coming soon")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: baseProps.title, level: 3 }),
    ).toBeInTheDocument();
  });

  it("comingSoon card has no axe violations", async () => {
    const { container } = render(
      <EnhancedProjectCard {...baseProps} comingSoon />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("EnhancedProjectCard autoplay loop", () => {
  const loopProps = {
    ...baseProps,
    thumbnail: "/poster.webp",
    videoThumbnail: ["/loop.webm", "/loop.mp4"],
    autoPlayVideo: true,
  };

  function setup(reducedMotion: boolean) {
    let observe: (entries: Array<{ isIntersecting: boolean }>) => void = () => {};
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(cb: typeof observe) {
          observe = cb;
        }
        observe() {}
        disconnect() {}
      },
    );
    vi.spyOn(window, "matchMedia").mockImplementation(
      () =>
        ({
          matches: reducedMotion,
          addEventListener() {},
          removeEventListener() {},
        }) as unknown as MediaQueryList,
    );
    const play = vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
    const pause = vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
    // Prototype spies keep call history across tests; start each from zero.
    play.mockClear();
    pause.mockClear();
    const view = render(<EnhancedProjectCard {...loopProps} />);
    return { view, play, pause, enter: (on: boolean) => act(() => observe([{ isIntersecting: on }])) };
  }

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("offers WebM then MP4, muted, looping and inline, with the still as poster", () => {
    const { view } = setup(false);
    const video = view.container.querySelector("video")!;
    expect(video.muted).toBe(true);
    expect(video.loop).toBe(true);
    expect(video.hasAttribute("playsinline")).toBe(true);
    expect(video.hasAttribute("autoplay")).toBe(false);
    expect(video.getAttribute("poster")).toBe("/poster.webp");
    expect([...video.querySelectorAll("source")].map((s) => s.getAttribute("type"))).toEqual([
      "video/webm",
      "video/mp4",
    ]);
  });

  it("plays only while on screen", () => {
    const { play, pause, enter } = setup(false);
    enter(true);
    expect(play).toHaveBeenCalled();
    enter(false);
    expect(pause).toHaveBeenCalled();
  });

  it("never plays for visitors who prefer reduced motion", () => {
    const { play, enter } = setup(true);
    enter(true);
    expect(play).not.toHaveBeenCalled();
  });
});
