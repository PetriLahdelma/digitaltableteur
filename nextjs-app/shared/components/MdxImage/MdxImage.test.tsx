import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MdxImage } from "./MdxImage";

describe("MdxImage", () => {
  it("renders nothing when src is undefined", () => {
    const { container } = render(<MdxImage src={undefined} alt="Test" />);
    expect(container.firstChild).toBeNull();
  });

  it("renders image with alt text", () => {
    render(<MdxImage src="/test-image.jpg" alt="Test image description" />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("alt", "Test image description");
  });

  it("applies custom className", () => {
    render(
      <MdxImage src="/test.jpg" alt="Test" className="custom-class" />
    );
    const img = screen.getByRole("img");
    expect(img.className).toContain("custom-class");
  });

  it("uses lazy loading by default", () => {
    render(<MdxImage src="/test.jpg" alt="Test" />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("loading", "lazy");
  });

  it("uses eager loading when priority is true", () => {
    render(<MdxImage src="/test.jpg" alt="Test" priority />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("loading", "eager");
  });

  it("sets default dimensions", () => {
    render(<MdxImage src="/test.jpg" alt="Test" />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("width", "800");
    expect(img).toHaveAttribute("height", "400");
  });

  it("accepts custom dimensions", () => {
    render(<MdxImage src="/test.jpg" alt="Test" width={1200} height={600} />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("width", "1200");
    expect(img).toHaveAttribute("height", "600");
  });
});
