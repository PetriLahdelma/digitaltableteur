import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { BlogMediaImage } from "./BlogMediaImage";

expect.extend(toHaveNoViolations);

describe("BlogMediaImage", () => {
  it("renders a raster image with alt text", () => {
    render(<BlogMediaImage src="/images/photo.jpg" alt="A photo" width={800} height={400} />);
    expect(screen.getByRole("img", { name: "A photo" })).toBeInTheDocument();
  });

  it("renders SVG sources as a plain img (next/image is unreliable for SVG)", () => {
    render(<BlogMediaImage src="/diagrams/flow.svg" alt="Flow diagram" width={600} height={300} />);
    const img = screen.getByRole("img", { name: "Flow diagram" });
    expect(img).toHaveAttribute("src", "/diagrams/flow.svg");
  });

  it("applies object-contain in fill mode when fit=contain", () => {
    render(
      <BlogMediaImage src="/diagrams/flow.svg" alt="Flow diagram" fill fit="contain" />,
    );
    expect(screen.getByRole("img", { name: "Flow diagram" })).toHaveClass(
      "object-contain",
    );
  });

  it("defaults to object-cover in fill mode", () => {
    render(<BlogMediaImage src="/diagrams/flow.svg" alt="Flow diagram" fill />);
    expect(screen.getByRole("img", { name: "Flow diagram" })).toHaveClass(
      "object-cover",
    );
  });

  it("fires onError when the image fails to load", () => {
    const onError = vi.fn();
    render(
      <BlogMediaImage src="/diagrams/flow.svg" alt="Flow diagram" onError={onError} />,
    );
    fireEvent.error(screen.getByRole("img", { name: "Flow diagram" }));
    expect(onError).toHaveBeenCalledOnce();
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <BlogMediaImage src="/images/photo.jpg" alt="A descriptive photo" width={800} height={400} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
