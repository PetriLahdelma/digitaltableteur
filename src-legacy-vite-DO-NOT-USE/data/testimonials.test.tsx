import { describe, it, expect } from "vitest";

import { testimonials } from "./testimonials";

describe("testimonials data", () => {
  it("exports an array (may be empty until populated)", () => {
    expect(Array.isArray(testimonials)).toBe(true);
    expect(testimonials).toHaveLength(0);
  });
});
