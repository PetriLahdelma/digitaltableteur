import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Progress from "./Progress";

describe("Progress", () => {
  it("renders", () => {
    render(<Progress value={50} label="Test" />);
    expect(document.body).toBeTruthy();
  });
});
