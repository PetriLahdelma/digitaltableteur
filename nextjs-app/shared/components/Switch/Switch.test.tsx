import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Switch from "./Switch";
import styles from "./Switch.module.css";

describe("Switch", () => {
  it("renders unchecked state", () => {
    render(<Switch checked={false} />);
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "false");
  });

  it("renders checked state", () => {
    render(<Switch checked />);
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
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
    render(
      <Switch checked={false} disabled onCheckedChange={handleChange} />,
    );

    await user.click(screen.getByRole("switch"));
    expect(handleChange).not.toHaveBeenCalled();
  });

  it("does not toggle when loading", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Switch checked={false} loading onCheckedChange={handleChange} />,
    );

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
    const wrapper = container.querySelector(`.${styles.switchWrapper}`);
    expect(wrapper).not.toHaveClass(styles.wrapperLabelLeft);
    expect(wrapper).not.toHaveClass(styles.wrapperLabelTop);
  });

  it("places label on the left when specified", () => {
    const { container } = render(
      <Switch checked={false} label="Left label" labelPlacement="left" />,
    );
    expect(
      container.querySelector(`.${styles.wrapperLabelLeft}`),
    ).toBeInTheDocument();
  });

  it("places label on top when specified", () => {
    const { container } = render(
      <Switch checked={false} label="Top label" labelPlacement="top" />,
    );
    expect(
      container.querySelector(`.${styles.wrapperLabelTop}`),
    ).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<Switch checked={false} className="custom-class" />);
    expect(screen.getByRole("switch")).toHaveClass("custom-class");
  });

  it("forwards ref to button element", () => {
    const ref = vi.fn();
    render(<Switch checked={false} ref={ref} />);
    expect(ref).toHaveBeenCalled();
  });

  it("uses custom id when provided", () => {
    render(<Switch checked={false} id="custom-id" />);
    expect(screen.getByRole("switch")).toHaveAttribute("id", "custom-id");
  });

  it("generates unique id when not provided", () => {
    render(<Switch checked={false} />);
    expect(screen.getByRole("switch")).toHaveAttribute("id");
  });

  it("shows loading state with disabled interaction", () => {
    render(<Switch checked={false} loading />);
    const toggle = screen.getByRole("switch");
    expect(toggle).toHaveAttribute("aria-busy", "true");
    expect(toggle).toHaveAttribute("data-loading", "true");
  });

  it("associates error and helper text through aria-describedby", () => {
    render(
      <Switch
        id="email-alerts"
        checked={false}
        label="Email alerts"
        error="Required"
        helperText="Used for service updates"
      />,
    );

    const toggle = screen.getByRole("switch", { name: "Email alerts" });
    expect(toggle).toHaveAttribute("aria-invalid", "true");
    expect(toggle).toHaveAttribute(
      "aria-describedby",
      "email-alerts-error email-alerts-helper",
    );
  });
});
