import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Radio from "./Radio";

describe("Radio", () => {
  it("renders", () => {
    render(<Radio name="n" value="v" label="Opt" />);
    expect(document.body).toBeTruthy();
  });
});
