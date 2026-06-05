import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { getSemanticIcon, STATUS_ICON_NAMES } from "./semanticIcons";

describe("semanticIcons", () => {
  it("returns success icon", () => {
    const { container } = render(getSemanticIcon("success"));
    expect(
      container.querySelector('[data-semantic-icon="success"]'),
    ).toBeInTheDocument();
  });

  it("returns error icon", () => {
    const { container } = render(getSemanticIcon("error"));
    expect(
      container.querySelector('[data-semantic-icon="error"]'),
    ).toBeInTheDocument();
  });

  it("returns warning icon", () => {
    const { container } = render(getSemanticIcon("warning"));
    expect(
      container.querySelector('[data-semantic-icon="warning"]'),
    ).toBeInTheDocument();
  });

  it("returns info icon", () => {
    const { container } = render(getSemanticIcon("info"));
    expect(
      container.querySelector('[data-semantic-icon="info"]'),
    ).toBeInTheDocument();
  });

  it("forwards size option to Icon", () => {
    const { container } = render(getSemanticIcon("error", { size: "xl" }));
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "48");
    expect(svg).toHaveAttribute("height", "48");
  });

  it("has correct icon names in STATUS_ICON_NAMES", () => {
    expect(STATUS_ICON_NAMES.success).toBe("check-circle");
    expect(STATUS_ICON_NAMES.error).toBe("x-circle");
    expect(STATUS_ICON_NAMES.warning).toBe("warning");
    expect(STATUS_ICON_NAMES.info).toBe("info");
  });
});
