import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./Tooltip";

describe("Tooltip", () => {
  it("renders the trigger and shows content when defaultOpen", () => {
    render(
      <TooltipProvider>
        <Tooltip defaultOpen>
          <TooltipTrigger asChild>
            <button type="button">Trigger</button>
          </TooltipTrigger>
          <TooltipContent>Tip content</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );

    expect(
      screen.getByRole("button", { name: "Trigger" }),
    ).toBeInTheDocument();
    // Radix renders the visible content plus a visually-hidden copy for SR.
    expect(screen.getAllByText("Tip content").length).toBeGreaterThan(0);
  });
});
