import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusPill } from "./StatusPill";

describe("StatusPill", () => {
  it("renders the status text with a status-specific class", () => {
    render(<StatusPill status="stable" />);
    const pill = screen.getByText("stable");
    expect(pill.closest("[class*='stable']")).not.toBeNull();
  });

  it("renders deprecated with a status-specific class", () => {
    render(<StatusPill status="deprecated" />);
    const pill = screen.getByText("deprecated");
    expect(pill.closest("[class*='deprecated']")).not.toBeNull();
  });
});
