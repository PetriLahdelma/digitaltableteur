import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Divider from "./Divider";

describe("Divider", () => {
  it("renders", () => {
    render(<Divider />);
    expect(document.body).toBeTruthy();
  });
});
