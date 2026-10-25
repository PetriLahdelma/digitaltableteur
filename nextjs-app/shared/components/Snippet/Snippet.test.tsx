import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Snippet } from "./Snippet";

expect.extend(toHaveNoViolations);

const writeText = vi.fn().mockResolvedValue(undefined);

beforeEach(() => {
  writeText.mockClear();
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

describe("Snippet", () => {
  it("hides the prompt from assistive tech and from the copy", async () => {
    const user = setup();
    render(<Snippet command="npm install" />);
    expect(screen.getByText("$")).toHaveAttribute("aria-hidden", "true");
    await user.click(screen.getByRole("button", { name: "Copy code" }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith("npm install"));
  });

  it("renders several commands and copies them together", async () => {
    const user = setup();
    render(<Snippet command={["npm ci", "npm test"]} />);
    expect(screen.getAllByText("$")).toHaveLength(2);
    await user.click(screen.getByRole("button", { name: "Copy code" }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith("npm ci\nnpm test"));
  });

  it("can drop the prompt and the copy button", () => {
    render(<Snippet command="ls" prompt={false} copyable={false} />);
    expect(screen.queryByText("$")).toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("puts an inverted snippet in the dark theme", () => {
    const { container } = render(<Snippet command="ls" theme="inverted" />);
    expect(container.firstElementChild).toHaveClass("themeDark");
  });

  it("has no axe violations", async () => {
    const { container } = render(<Snippet command="npm install" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
