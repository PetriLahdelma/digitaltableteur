import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { Lightbox } from "./Lightbox";

const IMAGES = [
  { src: "/a.png", alt: "Image A", caption: "Caption A" },
  { src: "/b.png", alt: "Image B" },
  { src: "/c.png", alt: "Image C" },
];

afterEach(cleanup);

describe("Lightbox", () => {
  it("renders nothing while closed", () => {
    render(<Lightbox images={IMAGES} open={false} />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("renders the initial image when opened", () => {
    render(<Lightbox images={IMAGES} open initialIndex={1} />);
    expect(screen.getByAltText("Image B")).toBeTruthy();
  });

  it("advances and wraps with the arrow keys", () => {
    render(<Lightbox images={IMAGES} open initialIndex={2} />);
    expect(screen.getByAltText("Image C")).toBeTruthy();

    // Wraps from the last image back to the first.
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(screen.getByAltText("Image A")).toBeTruthy();

    // And backwards from the first to the last.
    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(screen.getByAltText("Image C")).toBeTruthy();
  });

  it("requests close on Escape", () => {
    const onOpenChange = vi.fn();
    render(<Lightbox images={IMAGES} open onOpenChange={onOpenChange} />);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("marks the page content inert while open so AT cannot reach it", () => {
    const main = document.createElement("main");
    document.body.appendChild(main);
    render(<Lightbox images={IMAGES} open />);
    expect(main.hasAttribute("inert")).toBe(true);
    main.remove();
  });

  it("renders the caption when one is supplied", () => {
    render(<Lightbox images={IMAGES} open initialIndex={0} />);
    expect(screen.getByText("Caption A")).toBeTruthy();
  });
});
