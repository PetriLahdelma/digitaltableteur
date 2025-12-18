import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Switch from "./Switch";

describe("Switch", () => {
  it("renders unchecked state", () => {
    render(<Switch checked={false} />);
    const switchEl = screen.getByRole("switch");
    expect(switchEl).toHaveAttribute("aria-checked", "false");
  });

  it("renders checked state", () => {
    render(<Switch checked={true} />);
    const switchEl = screen.getByRole("switch");
    expect(switchEl).toHaveAttribute("aria-checked", "true");
  });

  it("toggles on click", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(<Switch checked={false} onCheckedChange={handleChange} />);

    await user.click(screen.getByRole("switch"));
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it("does not toggle when disabled", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(<Switch checked={false} disabled onCheckedChange={handleChange} />);

    await user.click(screen.getByRole("switch"));
    expect(handleChange).not.toHaveBeenCalled();
  });

  it("does not toggle when loading", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(<Switch checked={false} loading onCheckedChange={handleChange} />);

    await user.click(screen.getByRole("switch"));
    expect(handleChange).not.toHaveBeenCalled();
  });

  it("renders with label", () => {
    render(<Switch checked={false} label="Enable feature" />);
    expect(screen.getByText("Enable feature")).toBeInTheDocument();
  });

  it("renders with helper text", () => {
    render(<Switch checked={false} helperText="This is a helper text" />);
    expect(screen.getByText("This is a helper text")).toBeInTheDocument();
  });

  it("places label on the right by default", () => {
    const { container } = render(
      <Switch checked={false} label="Right label" />,
    );
    const wrapper = container.querySelector('[class*="switchWrapper"]');
    expect(wrapper).not.toHaveClass("wrapperLabelLeft");
    expect(wrapper).not.toHaveClass("wrapperLabelTop");
  });

  it("places label on the left when specified", () => {
    const { container } = render(
      <Switch checked={false} label="Left label" labelPlacement="left" />,
    );
    const wrapper = container.querySelector('[class*="wrapperLabelLeft"]');
    expect(wrapper).toBeInTheDocument();
  });

  it("places label on top when specified", () => {
    const { container } = render(
      <Switch checked={false} label="Top label" labelPlacement="top" />,
    );
    const wrapper = container.querySelector('[class*="wrapperLabelTop"]');
    expect(wrapper).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <Switch checked={false} className="custom-class" />,
    );
    const switchEl = container.querySelector('[class*="switch"]');
    expect(switchEl).toHaveClass("custom-class");
  });

  it("forwards ref to button element", () => {
    const ref = vi.fn();
    render(<Switch checked={false} ref={ref} />);
    expect(ref).toHaveBeenCalled();
  });

  it("uses custom id when provided", () => {
    render(<Switch checked={false} id="custom-id" />);
    const switchEl = screen.getByRole("switch");
    expect(switchEl).toHaveAttribute("id", "custom-id");
  });

  it("generates unique id when not provided", () => {
    render(<Switch checked={false} />);
    const switchEl = screen.getByRole("switch");
    expect(switchEl).toHaveAttribute("id");
  });

  it("shows loading state with disabled interaction", () => {
    render(<Switch checked={false} loading />);
    const switchEl = screen.getByRole("switch");
    expect(switchEl).toBeDisabled();
  });
});
