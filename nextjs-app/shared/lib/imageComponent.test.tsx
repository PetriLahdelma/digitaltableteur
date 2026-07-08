import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  Image,
  ImageProvider,
  type ImageComponentProps,
} from "./imageComponent";

describe("imageComponent", () => {
  it("renders a plain <img> by default, resolving a string src", () => {
    render(<Image src="/a.png" alt="A" width={10} height={10} />);
    const img = screen.getByAltText("A");
    expect(img.tagName).toBe("IMG");
    expect(img).toHaveAttribute("src", "/a.png");
  });

  it("does not leak fill/priority as invalid <img> attributes", () => {
    render(<Image src="/b.png" alt="B" fill priority />);
    const img = screen.getByAltText("B");
    expect(img.getAttribute("fill")).toBeNull();
    expect(img.getAttribute("priority")).toBeNull();
    expect(img).toHaveAttribute("loading", "eager");
    expect((img as HTMLElement).style.position).toBe("absolute");
  });

  it("renders through the injected component when a provider is present", () => {
    const Injected = ({ src, alt }: ImageComponentProps) => (
      <img data-injected="true" src={typeof src === "string" ? src : src.src} alt={alt} />
    );
    render(
      <ImageProvider component={Injected}>
        <Image src="/c.png" alt="C" />
      </ImageProvider>,
    );
    expect(screen.getByAltText("C")).toHaveAttribute("data-injected", "true");
  });
});
