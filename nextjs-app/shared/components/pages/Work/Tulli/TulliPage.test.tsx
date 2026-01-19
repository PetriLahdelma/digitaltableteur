import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TulliPage } from "./TulliPage";

describe("TulliPage", () => {
  it("renders page title", () => {
    render(<TulliPage />);
    expect(screen.getByText(/Tulli|Finnish Customs/i)).toBeInTheDocument();
  });

  it("renders project overview", () => {
    render(<TulliPage />);
    expect(screen.getByText(/Project Details|Overview/i)).toBeInTheDocument();
  });

  it("renders back to work link", () => {
    render(<TulliPage />);
    expect(
      screen.getByRole("link", { name: /back to work|work/i })
    ).toBeInTheDocument();
  });
});
