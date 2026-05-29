import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import TextArea from "./TextArea";

describe("TextArea", () => {
  it("renders", () => {
    render(<TextArea label="Notes" />);
    expect(document.body).toBeTruthy();
  });
});
