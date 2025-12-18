import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AiUsagePage } from "./AiUsagePage";

describe("AiUsagePage", () => {
  it("renders page title", () => {
    render(<AiUsagePage />);
    expect(screen.getByText(/aiUseTitle/i)).toBeInTheDocument();
  });

  it("renders introduction section", () => {
    render(<AiUsagePage />);
    expect(screen.getByText(/aiUseIntro/i)).toBeInTheDocument();
  });

  it("renders principles section", () => {
    render(<AiUsagePage />);
    expect(screen.getByText(/aiUsePrinciples/i)).toBeInTheDocument();
  });

  it("renders tools section", () => {
    render(<AiUsagePage />);
    expect(screen.getByText(/aiUseTools/i)).toBeInTheDocument();
  });

  it("renders email contact link", () => {
    render(<AiUsagePage />);
    const emailLinks = screen.getAllByRole("link", {
      name: /mail@digitaltableteur.com/i,
    });
    expect(emailLinks.length).toBeGreaterThan(0);
  });

  it("renders back button", () => {
    render(<AiUsagePage />);
    expect(screen.getByRole("link", { name: /back/i })).toBeInTheDocument();
  });

  it("renders transparency statement", () => {
    render(<AiUsagePage />);
    expect(screen.getByText(/transparency/i)).toBeInTheDocument();
  });
});
