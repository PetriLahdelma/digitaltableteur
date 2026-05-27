import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { createRef } from "react";
import ReadingProgress from "./ReadingProgress";

describe("ReadingProgress", () => {
  it("renders nothing when target is missing", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(<ReadingProgress targetRef={ref} />);
    expect(container.firstChild).toBeNull();
  });
});
