import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, it, expect, vi } from "vitest";
import { FormFieldEditorial } from "./FormFieldEditorial";

expect.extend(toHaveNoViolations);

describe("FormFieldEditorial", () => {
  it("associates the label with a text input", async () => {
    render(<FormFieldEditorial label="Name" id="name" />);
    const input = screen.getByLabelText(/Name/);
    expect(input.tagName).toBe("INPUT");
    await userEvent.type(input, "Petri");
    expect(input).toHaveValue("Petri");
  });

  it("renders a textarea variant", () => {
    render(<FormFieldEditorial label="Message" id="message" type="textarea" />);
    expect(screen.getByLabelText(/Message/).tagName).toBe("TEXTAREA");
  });

  it("renders the select variant as a DS Combobox and forwards selection to onChange", async () => {
    const onChange = vi.fn();
    render(
      <FormFieldEditorial
        label="Topic"
        id="topic"
        type="select"
        onChange={onChange}
      >
        <option value="">Choose…</option>
        <option value="ds">Design systems</option>
      </FormFieldEditorial>,
    );
    const combobox = screen.getByRole("combobox", { name: /Topic/ });
    await userEvent.click(combobox);
    await userEvent.click(screen.getByRole("option", { name: "Design systems" }));
    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls[0][0].target.value).toBe("ds");
  });

  it("exposes the error to assistive tech", () => {
    render(
      <FormFieldEditorial label="Email" id="email" error="Email is required" />,
    );
    const input = screen.getByLabelText(/Email/);
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("Email is required")).toBeInTheDocument();
  });

  it("marks required fields", () => {
    render(<FormFieldEditorial label="Email" id="email" required />);
    expect(screen.getByLabelText(/Email/)).toBeRequired();
  });

  it("has no axe violations across variants", async () => {
    const { container } = render(
      <>
        <FormFieldEditorial label="Name" id="a" required />
        <FormFieldEditorial label="Message" id="b" type="textarea" />
        <FormFieldEditorial label="Email" id="c" error="Required" />
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
