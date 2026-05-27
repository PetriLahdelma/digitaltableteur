import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import VisuallyHidden from "./VisuallyHidden";

describe("VisuallyHidden", () => {
  it("renders", () => {
    render(<VisuallyHidden>Hidden</VisuallyHidden>);
    expect(document.body).toBeTruthy();
  });
});
