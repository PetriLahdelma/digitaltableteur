import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RawViewPage } from "./RawViewPage";

describe("RawViewPage", () => {
  it("renders page title", () => {
    render(<RawViewPage />);
    expect(screen.getByText(/Raw View/i)).toBeInTheDocument();
  });

  it("renders project overview", () => {
    render(<RawViewPage />);
    expect(screen.getByText(/Project Details|Overview/i)).toBeInTheDocument();
  });

  it("renders back to work link", () => {
    render(<RawViewPage />);
    expect(
      screen.getByRole("link", { name: /back to work|work/i })
    ).toBeInTheDocument();
  });
});
