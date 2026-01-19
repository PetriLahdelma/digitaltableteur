import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FinnishTransportAgencyPage } from "./FinnishTransportAgencyPage";

describe("FinnishTransportAgencyPage", () => {
  it("renders page title", () => {
    render(<FinnishTransportAgencyPage />);
    expect(
      screen.getByText(/Finnish Transport Agency/i),
    ).toBeInTheDocument();
  });

  it("renders project overview", () => {
    render(<FinnishTransportAgencyPage />);
    expect(screen.getByText(/Project Details|Overview/i)).toBeInTheDocument();
  });

  it("renders back to work link", () => {
    render(<FinnishTransportAgencyPage />);
    expect(
      screen.getByRole("link", { name: /back to work|work/i }),
    ).toBeInTheDocument();
  });
});
