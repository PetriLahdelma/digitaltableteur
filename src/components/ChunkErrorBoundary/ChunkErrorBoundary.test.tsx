import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import ChunkErrorBoundary from "./ChunkErrorBoundary";

describe("ChunkErrorBoundary", () => {
  const reloadSpy = vi.fn();

  beforeEach(() => {
    reloadSpy.mockReset();
    Object.defineProperty(window, "location", {
      value: { reload: reloadSpy },
      writable: true,
    });
  });

  it("renders fallback and triggers reload on chunk error", () => {
    const ProblemChild = () => {
      throw new Error("Loading chunk 123 failed");
    };

    render(
      <ChunkErrorBoundary>
        <ProblemChild />
      </ChunkErrorBoundary>,
    );

    expect(screen.getByText(/Loading Error/i)).toBeInTheDocument();
    expect(reloadSpy).toHaveBeenCalled();
  });
});
