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

  it("merges an error with a caller-provided accessible description", () => {
    render(
      <>
        <FormFieldEditorial
          label="Email"
          id="email"
          error="Enter a valid email"
          aria-describedby="email-suggestion"
        />
        <p id="email-suggestion">Did you mean person@gmail.com?</p>
      </>,
    );
    expect(screen.getByLabelText(/Email/)).toHaveAccessibleDescription(
      "Enter a valid email Did you mean person@gmail.com?",
    );
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
  describe("read-only with helper text", () => {
    it("keeps the value focusable, unchangeable and described by the helper", async () => {
      render(
        <FormFieldEditorial
          label="Budget"
          readOnly
          value="€7–14k, 2 weeks"
          helperText="Set by the package."
        />,
      );
      const input = screen.getByRole("textbox", { name: "Budget" });
      expect(input).toHaveAttribute("readonly");
      expect(input).toHaveValue("€7–14k, 2 weeks");
      expect(input).toHaveAccessibleDescription("Set by the package.");
      await userEvent.type(input, "x");
      expect(input).toHaveValue("€7–14k, 2 weeks");
      input.focus();
      expect(input).toHaveFocus();
    });

    it("links helper and error together when both are present", () => {
      render(<FormFieldEditorial label="Notes" type="textarea" helperText="Optional." error="Too long" />);
      const field = screen.getByRole("textbox", { name: "Notes" });
      expect(field.getAttribute("aria-describedby")?.split(" ")).toEqual(["notes-error", "notes-helper"]);
    });

    it("has no axe violations", async () => {
      const { container } = render(
        <FormFieldEditorial label="Budget" readOnly value="€7–14k" helperText="Set by the package." />,
      );
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
