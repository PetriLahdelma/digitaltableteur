import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { KnobSmithAudioPage } from "./KnobSmithAudioPage";

describe("KnobSmithAudioPage", () => {
  it("renders page title", () => {
    render(<KnobSmithAudioPage />);
    expect(screen.getByText(/KnobSmith Audio/i)).toBeInTheDocument();
  });

  it("renders project overview", () => {
    render(<KnobSmithAudioPage />);
    expect(screen.getByText(/Project Details|Overview/i)).toBeInTheDocument();
  });

  it("renders back to work link", () => {
    render(<KnobSmithAudioPage />);
    expect(
      screen.getByRole("link", { name: /back to work|work/i }),
    ).toBeInTheDocument();
  });
});
