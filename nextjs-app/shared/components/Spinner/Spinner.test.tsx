import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Spinner from "./Spinner";

describe("Spinner", () => {
  it("exposes status role and label", () => {
    render(<Spinner label="Fetching data" />);
    expect(screen.getByRole("status", { name: "Fetching data" })).toBeInTheDocument();
  });
});
