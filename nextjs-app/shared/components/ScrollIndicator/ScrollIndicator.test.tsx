import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ScrollIndicator } from "./ScrollIndicator";

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
    await user.click(screen.getByRole("button", { name: /scroll to content/i }));

    expect(target.scrollIntoView).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "start",
    });
    target.remove();
  });

  it("does nothing without a targetId", async () => {
    render(<ScrollIndicator />);
    const user = userEvent.setup();
    // No target wired: the click must not throw.
    await user.click(screen.getByRole("button", { name: /scroll to content/i }));
  });
});
