import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./Tooltip";

expect.extend(toHaveNoViolations);

function renderTooltip(props?: {
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  return render(
    <TooltipProvider delayDuration={0}>
      <Tooltip {...props}>
        <TooltipTrigger asChild>
          <button type="button">Trigger</button>
        </TooltipTrigger>
        <TooltipContent>Tip content</TooltipContent>
      </Tooltip>
    </TooltipProvider>,
  );
}

describe("Tooltip", () => {
  it("renders the trigger and shows content when defaultOpen", () => {
    renderTooltip({ defaultOpen: true });

    expect(
      screen.getByRole("button", { name: "Trigger" }),
    ).toBeInTheDocument();
    // Radix renders the visible content plus a visually-hidden copy for SR.
    expect(screen.getAllByText("Tip content").length).toBeGreaterThan(0);
  });

  it("opens on keyboard focus and links content via aria-describedby", async () => {
    const user = userEvent.setup();
    renderTooltip();
    const trigger = screen.getByRole("button", { name: "Trigger" });

    await user.tab();
    expect(trigger).toHaveFocus();
    await waitFor(() => expect(screen.getByRole("tooltip")).toBeVisible());
    expect(trigger).toHaveAttribute("aria-describedby");
  });

  it("calls onOpenChange when keyboard focus opens the tooltip", async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    renderTooltip({ onOpenChange });

    await user.tab();
    await waitFor(() => expect(screen.getByRole("tooltip")).toBeVisible());

    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it("dismisses on Escape without moving focus", async () => {
    const user = userEvent.setup();
    renderTooltip();
    const trigger = screen.getByRole("button", { name: "Trigger" });

    await user.tab();
    await waitFor(() => expect(screen.getByRole("tooltip")).toBeVisible());
    await user.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument(),
    );
    expect(trigger).toHaveFocus();
  });

  it("has no axe violations while open", async () => {
    const { container } = renderTooltip({ defaultOpen: true });
    expect(await axe(container)).toHaveNoViolations();
  });

  it("renders a shortcut as keycaps joined by plus signs", () => {
    render(
      <TooltipProvider delayDuration={0}>
        <Tooltip defaultOpen>
          <TooltipTrigger asChild>
            <button type="button">New chat</button>
          </TooltipTrigger>
          <TooltipContent shortcut={["⌘", "⇧", "Backspace"]}>
            New chat
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    const tooltip = screen.getByRole("tooltip");
    const bubble = document.querySelector("[data-side]") as HTMLElement;

    expect(bubble.querySelectorAll("kbd")).toHaveLength(3);
    // Symbols are drawn as icons; the key's name is what assistive tech reads.
    expect(tooltip).toHaveTextContent("New chatCommand+Shift+Backspace");
    expect(bubble.querySelectorAll("kbd svg")).toHaveLength(2);
  });

  it("has no axe violations with a shortcut", async () => {
    const { container } = render(
      <TooltipProvider delayDuration={0}>
        <Tooltip defaultOpen>
          <TooltipTrigger asChild>
            <button type="button">New chat</button>
          </TooltipTrigger>
          <TooltipContent shortcut={["Ctrl", "Shift", "Backspace"]}>
            New chat
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
