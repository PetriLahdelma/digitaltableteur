import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import RadioGroup from "./RadioGroup";

describe("RadioGroup", () => {
  it("renders", () => {
    render(<RadioGroup legend="Pick" options={[{"value": "a", "label": "A"}]} />);
    expect(document.body).toBeTruthy();
  });
});
