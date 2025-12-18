import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import Gallery from "@dt/Gallery";

describe("Gallery", () => {
  it("renders images with captions and responsive sources", () => {
    Object.defineProperty(window, "innerWidth", { value: 640, writable: true });
    render(
      <Gallery
        gutter={16}
        images={[
          {
            src: "/image.webp",
            fallback: "/image.jpg",
            alt: "Gallery item",
            caption: "Sample caption",
          },
        ]}
      />,
    );

    expect(screen.getByAltText("Gallery item")).toBeInTheDocument();
    expect(screen.getByText("Sample caption")).toBeInTheDocument();
  });
});
