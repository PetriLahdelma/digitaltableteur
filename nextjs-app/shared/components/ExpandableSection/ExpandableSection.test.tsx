import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { ExpandableSection } from "./ExpandableSection";

expect.extend(toHaveNoViolations);

describe("ExpandableSection", () => {
  it("starts collapsed and reveals on trigger", async () => {
    render(
      <ExpandableSection collapsedLabel="Show more">
        <p>Hidden tail</p>
      </ExpandableSection>,
    );
    const trigger = screen.getByRole("button", { name: "Show more" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(trigger);
    expect(
      screen.getByRole("button", { name: /show more/i }),
    ).toHaveAttribute("aria-expanded", "true");
  });

  it("swaps to expandedLabel when open", async () => {
    render(
      <ExpandableSection collapsedLabel="Show more" expandedLabel="Show less">
        <p>Tail</p>
      </ExpandableSection>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Show more" }));
    expect(screen.getByRole("button", { name: "Show less" })).toBeInTheDocument();
  });

  it("supports controlled mode", async () => {
    const onExpandedChange = vi.fn();
    render(
      <ExpandableSection
        collapsedLabel="Show"
        expanded={false}
        onExpandedChange={onExpandedChange}
      >
        <p>Tail</p>
      </ExpandableSection>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Show" }));
    expect(onExpandedChange).toHaveBeenCalledWith(true);
    // Controlled: stays collapsed until the parent flips the prop.
    expect(screen.getByRole("button", { name: "Show" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("respects defaultExpanded", () => {
    render(
      <ExpandableSection collapsedLabel="Show" defaultExpanded>
        <p>Visible tail</p>
      </ExpandableSection>,
    );
    expect(screen.getByText("Visible tail")).toBeVisible();
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <ExpandableSection collapsedLabel="Show more">
        <p>Tail</p>
      </ExpandableSection>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("neutralises the trigger and icon transitions under reduced motion", () => {
    // The framer-motion morph is duration-zeroed in the component; these two
    // CSS transitions need a media guard so nothing animates for reduced-motion
    // users. Assert the guard exists (jsdom can't evaluate media-scoped styles).
    const css = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), "ExpandableSection.module.css"),
      "utf8",
    );
    const guard = css.match(
      /@media \(prefers-reduced-motion: reduce\) \{([\s\S]*?)\}\s*\}/,
    );
    expect(guard, "reduced-motion @media block").not.toBeNull();
    const body = guard![1];
    expect(body).toMatch(/\.trigger/);
    expect(body).toMatch(/\.icon/);
    expect(body).toMatch(/transition:\s*none/);
  });
});
