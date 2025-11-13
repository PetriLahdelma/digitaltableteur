import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Icon from "./Icon";
import styles from "./Icon.module.css";

describe("Icon", () => {
  it("renders with accessible label and resolved name", () => {
    render(<Icon name="circle-info" ariaLabel="Information" />);
    const icon = screen.getByRole("img", { name: "Information" });
    expect(icon).toBeInTheDocument();
    expect(icon.getAttribute("data-icon-name")).toBe("circle-info");
  });

  it("maps legacy style and named size to expected dimensions", () => {
    render(<Icon name="github" style="brands" size="2xl" ariaLabel="GitHub" />);
    const icon = screen.getByRole("img", { name: "GitHub" });
    const svg = icon.querySelector("svg");
    expect(svg?.getAttribute("width")).toBe("64");
    expect(svg?.getAttribute("height")).toBe("64");
  });

  it("supports numeric size and sets color prop", () => {
    render(
      <Icon name="circle-info" size={32} color="#123456" ariaLabel="Info" />,
    );
    const icon = screen.getByRole("img", { name: "Info" });
    const svg = icon.querySelector("svg");
    expect(svg?.getAttribute("width")).toBe("32");
    expect(svg?.getAttribute("height")).toBe("32");
    expect(svg?.getAttribute("fill")).toBe("#123456");
  });

  it("marks icon as decorative when aria label missing", () => {
    const { container } = render(<Icon name="circle-info" />);
    const wrapper = container.querySelector("span");
    expect(wrapper?.getAttribute("aria-hidden")).toBe("true");
    expect(wrapper?.getAttribute("role")).toBeNull();
  });

  it("applies transforms and spin animation", () => {
    const { container } = render(
      <Icon
        name="arrow-right"
        rotate={90}
        flip="horizontal"
        spin
        ariaLabel="Arrow"
      />,
    );
    const wrapper = container.querySelector("span")!;
    expect(wrapper.getAttribute("style")).toContain("rotate(90deg)");
    expect(wrapper.getAttribute("style")).toContain("scaleX(-1)");
    expect(wrapper.className).toContain(styles.spin);
  });

  it("applies pulse animation", () => {
    const { container } = render(
      <Icon name="share-nodes" pulse ariaLabel="Share" />,
    );
    const wrapper = container.querySelector("span")!;
    expect(wrapper.className).toContain(styles.pulse);
  });
});
