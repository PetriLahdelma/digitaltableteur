import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { FormField } from "./FormField";
import Checkbox from "@dt/Checkbox";

expect.extend(toHaveNoViolations);

// FormField is group-mode only (field-wrapper convention, 2026-07-03):
// individual controls own their own label/error/helperText chrome; FormField
// exists for the fieldset/legend group case.
describe("FormField", () => {
  it("renders a fieldset with the legend as the group name", () => {
    render(
      <FormField legend="Notification channels" groupDescription="Pick at least one">
        <Checkbox label="Email" />
        <Checkbox label="SMS" />
      </FormField>,
    );
    const group = screen.getByRole("group", { name: "Notification channels" });
    expect(group.tagName).toBe("FIELDSET");
    expect(screen.getByText("Pick at least one")).toBeInTheDocument();
  });

  it("gives label-only Checkbox siblings unique ids with correct label association", () => {
    render(
      <FormField legend="Notification channels">
        <Checkbox label="Email" />
        <Checkbox label="SMS" />
      </FormField>,
    );
    const emailCheckbox = screen.getByRole("checkbox", { name: "Email" });
    const smsCheckbox = screen.getByRole("checkbox", { name: "SMS" });

    expect(emailCheckbox.id).toBeTruthy();
    expect(smsCheckbox.id).toBeTruthy();
    expect(emailCheckbox.id).not.toBe(smsCheckbox.id);

    expect(emailCheckbox).toHaveAccessibleName("Email");
    expect(smsCheckbox).toHaveAccessibleName("SMS");

    const emailLabel = screen.getByText("Email");
    const smsLabel = screen.getByText("SMS");
    expect(emailLabel).toHaveAttribute("for", emailCheckbox.id);
    expect(smsLabel).toHaveAttribute("for", smsCheckbox.id);
  });

  it("shows a group-level error as an alert", () => {
    render(
      <FormField legend="Notification channels" error="Pick at least one channel">
        <Checkbox label="Email" />
        <Checkbox label="SMS" />
      </FormField>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Pick at least one channel",
    );
  });

  it("marks the legend with a visual required asterisk hidden from AT", () => {
    render(
      <FormField legend="Contact preference" required>
        <Checkbox label="Email" />
      </FormField>,
    );
    expect(
      screen.getByRole("group", { name: "Contact preference" }),
    ).toBeInTheDocument();
    const asterisk = screen.getByText("*");
    expect(asterisk).toHaveAttribute("aria-hidden", "true");
  });

  it("disables every contained control via the fieldset", () => {
    render(
      <FormField legend="Notification channels" disabled>
        <Checkbox label="Email" />
        <Checkbox label="SMS" />
      </FormField>,
    );
    expect(screen.getByRole("checkbox", { name: "Email" })).toBeDisabled();
    expect(screen.getByRole("checkbox", { name: "SMS" })).toBeDisabled();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <FormField legend="Notification channels" groupDescription="Pick at least one">
        <Checkbox label="Email" />
        <Checkbox label="SMS" />
      </FormField>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("has no violations with a group error", async () => {
    const { container } = render(
      <FormField legend="Notification channels" error="Pick at least one channel">
        <Checkbox label="Email" />
      </FormField>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
