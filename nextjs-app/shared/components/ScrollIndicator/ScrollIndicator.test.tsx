import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ScrollIndicator } from "./ScrollIndicator";
import { AnimationRuntimeProvider } from "../../lib/animation";

describe("ScrollIndicator", () => {
  it("renders a labelled button", () => {
    render(<ScrollIndicator targetId="main" label="Scroll" />);
    expect(screen.getByRole("button", { name: "Scroll" })).toBeInTheDocument();
  });

  // Backs the audit:controls effect exemption for HomeHero.scrollTargetId:
  // the target id is behavior-only (consumed by the click handler), with no
  // DOM signature at rest.
  it("scrolls the target element into view on click", async () => {
    const target = document.createElement("div");
    target.id = "scroll-probe-target";
    target.scrollIntoView = vi.fn();
    document.body.appendChild(target);

    render(<ScrollIndicator targetId="scroll-probe-target" />);
    const user = userEvent.setup();
    await user.click(
      screen.getByRole("button", { name: /scroll to content/i }),
    );

    expect(target.scrollIntoView).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "start",
    });
    target.remove();
  });

  it("does not render an inert control without a targetId", () => {
    render(<ScrollIndicator />);
    expect(
      screen.queryByRole("button", { name: /scroll to content/i }),
    ).not.toBeInTheDocument();
  });

  it("uses instant scrolling when reduced motion is preferred", async () => {
    const target = document.createElement("div");
    target.id = "reduced-motion-target";
    target.scrollIntoView = vi.fn();
    document.body.appendChild(target);

    render(
      <AnimationRuntimeProvider
        value={{ motionPreference: "reduced", isReady: true }}
      >
        <ScrollIndicator targetId="reduced-motion-target" />
      </AnimationRuntimeProvider>,
    );
    await userEvent.click(
      screen.getByRole("button", { name: /scroll to content/i }),
    );

    expect(target.scrollIntoView).toHaveBeenCalledWith({
      behavior: "auto",
      block: "start",
    });
    target.remove();
  });
});
