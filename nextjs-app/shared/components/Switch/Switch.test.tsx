import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Switch from "./Switch";
import styles from "./Switch.module.css";

describe("Switch", () => {
  it("renders unchecked state", () => {
    render(<Switch isChecked={false} />);
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "false");
  });

  it("renders checked state", () => {
    render(<Switch isChecked />);
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
  });

  it("toggles on click", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(<Switch isChecked={false} onCheckedChange={handleChange} />);

    await user.click(screen.getByRole("switch"));
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it("does not toggle when disabled", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Switch isChecked={false} isDisabled onCheckedChange={handleChange} />,
    );

    await user.click(screen.getByRole("switch"));
    expect(handleChange).not.toHaveBeenCalled();
  });

  it("does not toggle when loading", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Switch isChecked={false} isLoading onCheckedChange={handleChange} />,
    );

    await user.click(screen.getByRole("switch"));
    expect(handleChange).not.toHaveBeenCalled();
  });

  it("renders with label", () => {
    render(<Switch isChecked={false} label="Enable feature" />);
    expect(screen.getByText("Enable feature")).toBeInTheDocument();
  });

  it("renders with helper text", () => {
    render(<Switch isChecked={false} helperText="This is a helper text" />);
    expect(screen.getByText("This is a helper text")).toBeInTheDocument();
  });

  it("places label on the right by default", () => {
    const { container } = render(
      <Switch isChecked={false} label="Right label" />,
    );
    const wrapper = container.querySelector(`.${styles.switchWrapper}`);
    expect(wrapper).not.toHaveClass(styles.wrapperLabelLeft);
    expect(wrapper).not.toHaveClass(styles.wrapperLabelTop);
  });

  it("places label on the left when specified", () => {
    const { container } = render(
      <Switch isChecked={false} label="Left label" labelPlacement="left" />,
    );
    expect(
      container.querySelector(`.${styles.wrapperLabelLeft}`),
    ).toBeInTheDocument();
  });

  it("places label on top when specified", () => {
    const { container } = render(
      <Switch isChecked={false} label="Top label" labelPlacement="top" />,
    );
    expect(
      container.querySelector(`.${styles.wrapperLabelTop}`),
    ).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<Switch isChecked={false} className="custom-class" />);
    expect(screen.getByRole("switch")).toHaveClass("custom-class");
  });

  it("forwards ref to button element", () => {
    const ref = vi.fn();
    render(<Switch isChecked={false} ref={ref} />);
    expect(ref).toHaveBeenCalled();
  });

  it("uses custom id when provided", () => {
    render(<Switch isChecked={false} id="custom-id" />);
    expect(screen.getByRole("switch")).toHaveAttribute("id", "custom-id");
  });

  it("generates unique id when not provided", () => {
    render(<Switch isChecked={false} />);
    expect(screen.getByRole("switch")).toHaveAttribute("id");
  });

  it("shows loading state with disabled interaction", () => {
    render(<Switch isChecked={false} isLoading />);
    const toggle = screen.getByRole("switch");
    expect(toggle).toHaveAttribute("aria-busy", "true");
    expect(toggle).toHaveAttribute("data-loading", "true");
  });
});
