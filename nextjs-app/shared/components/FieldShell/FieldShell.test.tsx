import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { axe, toHaveNoViolations } from "jest-axe";

import {
  FieldShell,
  fieldDescribedBy,
  fieldStatusClass,
  resolveFieldStatus,
} from "./FieldShell";
import fieldStyles from "../../styles/field.module.css";

expect.extend(toHaveNoViolations);

function Shell(props: Partial<React.ComponentProps<typeof FieldShell>>) {
  return (
    <FieldShell controlId="email" label="Email" {...props}>
      <input
        id="email"
        aria-describedby={fieldDescribedBy("email", {
          statusMessage: props.statusMessage,
          helperText: props.helperText,
        })}
      />
    </FieldShell>
  );
}

describe("FieldShell", () => {
  it("labels the control and gives the label an id", () => {
    render(<Shell />);
    const input = screen.getByRole("textbox", { name: "Email" });
    expect(screen.getByText("Email")).toHaveAttribute("id", "email-label");
    expect(input).not.toHaveAttribute("aria-describedby");
  });

  it("renders the status message before the helper line and links both", () => {
    render(
      <Shell
        status="warning"
        statusMessage="This address bounced last time"
        helperText="We reply within a day"
      />,
    );
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("aria-describedby", "email-status email-helper");
    const status = screen.getByText("This address bounced last time");
    const helper = screen.getByText("We reply within a day");
    expect(status).toHaveAttribute("id", "email-status");
    expect(status.compareDocumentPosition(helper) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("announces an error message as an alert", () => {
    render(<Shell status="error" statusMessage="Enter an email address" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Enter an email address");
  });

  it("runs a direct action on click", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Shell actions={[{ label: "Paste", icon: "clipboard", onClick }]} />);
    await user.click(screen.getByRole("button", { name: "Paste" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("opens a menu for an action with items", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <Shell
        actions={[
          {
            label: "More options",
            items: [
              { label: "Use my work address", onSelect },
              { label: "Clear", onSelect: vi.fn() },
            ],
          },
        ]}
      />,
    );
    await user.click(screen.getByRole("button", { name: "More options" }));
    expect(screen.getAllByRole("menuitem")).toHaveLength(2);
    await user.click(screen.getByRole("menuitem", { name: "Use my work address" }));
    expect(onSelect).toHaveBeenCalledOnce();
  });

  it("disables every action when the field is disabled", () => {
    render(
      <Shell
        disabled
        actions={[{ label: "Paste", icon: "clipboard", onClick: vi.fn() }]}
      />,
    );
    expect(screen.getByRole("button", { name: "Paste" })).toBeDisabled();
  });

  it("keeps a hidden label as the accessible name", () => {
    render(<Shell hideLabel />);
    expect(screen.getByRole("textbox", { name: "Email" })).toBeInTheDocument();
  });

  it("folds the error shorthand into the status", () => {
    expect(resolveFieldStatus({ error: "Required", status: "success", statusMessage: "Looks good" })).toEqual({
      status: "error",
      statusMessage: "Required",
    });
    expect(resolveFieldStatus({ status: "success", statusMessage: "Looks good" })).toEqual({
      status: "success",
      statusMessage: "Looks good",
    });
    expect(fieldStatusClass("success")).toBe(fieldStyles.statusSuccess);
    expect(fieldStatusClass(undefined)).toBeUndefined();
  });

  it("has no axe violations with actions, status and helper text", async () => {
    const { container } = render(
      <Shell
        status="success"
        statusMessage="Address verified"
        helperText="Used for the confirmation only"
        actions={[{ label: "Paste", icon: "clipboard", onClick: vi.fn() }]}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
