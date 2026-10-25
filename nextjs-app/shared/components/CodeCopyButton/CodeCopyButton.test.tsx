import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CodeCopyButton } from "./CodeCopyButton";

expect.extend(toHaveNoViolations);

const writeText = vi.fn();

beforeEach(() => {
  writeText.mockReset().mockResolvedValue(undefined);
});

/* userEvent.setup() installs its own clipboard stub, so ours goes on after. */
function setup(options?: Parameters<typeof userEvent.setup>[0]) {
  const user = userEvent.setup(options);
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText },
    configurable: true,
  });
  return user;
}

describe("CodeCopyButton", () => {
  it("copies the value, announces it and reports it", async () => {
    const user = setup();
    const onCopy = vi.fn();
    render(<CodeCopyButton value="npm ci" onCopy={onCopy} />);
    await user.click(screen.getByRole("button", { name: "Copy code" }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith("npm ci"));
    expect(screen.getByRole("status")).toHaveTextContent("Copied");
    expect(screen.getByRole("button")).toHaveAttribute("data-status", "copied");
    expect(onCopy).toHaveBeenCalledWith("npm ci");
  });

  it("reads a getter at click time", async () => {
    const user = setup();
    let text = "first";
    render(<CodeCopyButton value={() => text} />);
    text = "second";
    await user.click(screen.getByRole("button"));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith("second"));
  });

  it("reports a refused clipboard instead of a false success", async () => {
    const user = setup();
    writeText.mockRejectedValue(new Error("denied"));
    const onCopy = vi.fn();
    render(<CodeCopyButton value="x" onCopy={onCopy} />);
    await user.click(screen.getByRole("button"));
    expect(await screen.findByText("Copy failed")).toBeInTheDocument();
    expect(onCopy).not.toHaveBeenCalled();
  });

  it("returns to idle after the reset delay", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      const user = setup({ advanceTimers: vi.advanceTimersByTime });
      render(<CodeCopyButton value="x" resetAfterMs={500} />);
      await user.click(screen.getByRole("button"));
      await waitFor(() =>
        expect(screen.getByRole("button")).toHaveAttribute("data-status", "copied"),
      );
      await act(async () => {
        vi.advanceTimersByTime(600);
      });
      expect(screen.getByRole("button")).toHaveAttribute("data-status", "idle");
    } finally {
      vi.useRealTimers();
    }
  });

  it("takes a custom label", () => {
    render(<CodeCopyButton value="x" label="Copy install command" />);
    expect(
      screen.getByRole("button", { name: "Copy install command" }),
    ).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = render(<CodeCopyButton value="x" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
