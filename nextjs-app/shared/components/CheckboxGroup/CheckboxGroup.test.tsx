import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import CheckboxGroup from "@dt/CheckboxGroup";

describe("CheckboxGroup", () => {
  const options = [
    { label: "Option 1", value: "option1" },
    { label: "Option 2", value: "option2" },
    { label: "Option 3", value: "option3" },
  ];

  it("renders group label", () => {
    render(
      <CheckboxGroup
        label="Group Label"
        options={options}
        onChange={() => {}}
      />,
    );
    expect(screen.getByText("Group Label")).toBeInTheDocument();
  });

  it("renders all options", () => {
    render(
      <CheckboxGroup
        label="Group Label"
        options={options}
        onChange={() => {}}
      />,
    );
    options.forEach((opt) => {
      expect(screen.getByLabelText(opt.label)).toBeInTheDocument();
    });
  });

  it("calls onChange when an option is clicked", () => {
    const onChange = vi.fn();
    render(
      <CheckboxGroup
        label="Group Label"
        options={options}
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByLabelText("Option 2"));
    expect(onChange).toHaveBeenCalledWith(["option2"]);
  });

  it("calls onChange with all option values from the master checkbox", () => {
    const onChange = vi.fn();
    render(
      <CheckboxGroup
        label="Group Label"
        options={options}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByLabelText(/Select All|All/i));

    expect(onChange).toHaveBeenCalledWith(["option1", "option2", "option3"]);
  });

  it("master checkbox shows indeterminate when some options are selected", () => {
    render(
      <CheckboxGroup
        label="Group Label"
        options={options}
        onChange={() => {}}
      />,
    );

    // Click the first and second option
    fireEvent.click(screen.getByLabelText("Option 1"));
    fireEvent.click(screen.getByLabelText("Option 2"));

    // Master label is translated ("Select All") when i18n is initialized; fall back to "All" only in legacy/no-i18n cases.
    const master = screen.getByLabelText(/Select All|All/i) as HTMLInputElement;
    expect(master).toBeInTheDocument();
    // master should be indeterminate (some selected)
    expect(master.indeterminate).toBe(true);

    // Now select the third option so all are selected -> master checked
    fireEvent.click(screen.getByLabelText("Option 3"));
    expect(master.checked).toBe(true);

    // Uncheck all options -> master unchecked
    fireEvent.click(screen.getByLabelText("Option 1"));
    fireEvent.click(screen.getByLabelText("Option 2"));
    fireEvent.click(screen.getByLabelText("Option 3"));
    expect(master.checked).toBe(false);
    expect(master.indeterminate).toBe(false);
  });

  it("names the group with a legend, including without the master checkbox", () => {
    render(
      <CheckboxGroup
        id="follow-up"
        label="How should we follow up?"
        showMasterCheckbox={false}
        options={[
          { label: "Email", value: "email" },
          { label: "Phone", value: "phone" },
        ]}
      />,
    );
    // Was a <label for> pointing at a nonexistent id: no group name at all.
    const group = screen.getByRole("group", { name: "How should we follow up?" });
    expect(group.tagName).toBe("FIELDSET");
    expect(screen.getByRole("checkbox", { name: "Email" })).toBeInTheDocument();
  });

  it("keeps the master checkbox's own name", () => {
    render(
      <CheckboxGroup
        id="all"
        label="Topics"
        masterLabel="All topics"
        options={[{ label: "Design", value: "design" }]}
      />,
    );
    expect(
      screen.getByRole("checkbox", { name: "All topics" }),
    ).toBeInTheDocument();
  });

  it("keeps a hidden legend as the group name", () => {
    render(<CheckboxGroup id="h" label="Services" hideLegend showMasterCheckbox={false} options={options} />);
    const group = screen.getByRole("group", { name: "Services" });
    expect(group.querySelector("legend")?.className).toMatch(/hiddenLegend/);
    expect(screen.getAllByRole("checkbox")).toHaveLength(3);
  });
});
