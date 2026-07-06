import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { ProjectGallery, type GalleryImage } from "./ProjectGallery";

expect.extend(toHaveNoViolations);

const images: GalleryImage[] = [
  { src: "/images/a.jpg", alt: "Screen one", width: 800, height: 600, caption: "One" },
  { src: "/images/b.jpg", alt: "Screen two", width: 800, height: 600 },
  { src: "/images/c.jpg", alt: "Screen three", width: 800, height: 600 },
];

describe("ProjectGallery", () => {
  it("renders a labelled list with one item per image", () => {
    render(<ProjectGallery images={images} />);
    const list = screen.getByRole("list", { name: "Project gallery" });
    expect(list).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });

  it("exposes a fullscreen affordance per image when the lightbox is enabled", () => {
    render(<ProjectGallery images={images} />);
    expect(
      screen.getByRole("button", { name: "View Screen one in fullscreen" }),
    ).toBeEnabled();
  });

  it("renders captions when present", () => {
    render(<ProjectGallery images={images} />);
    expect(screen.getByText("One")).toBeInTheDocument();
  });

  it("disables the triggers when the lightbox is off", () => {
    render(<ProjectGallery images={images} enableLightbox={false} />);
    screen.getAllByRole("button").forEach((btn) => expect(btn).toBeDisabled());
  });

  it("renders nothing without images", () => {
    const { container } = render(<ProjectGallery images={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("has no axe violations", async () => {
    const { container } = render(<ProjectGallery images={images} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
