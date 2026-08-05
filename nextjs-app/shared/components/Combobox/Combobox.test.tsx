import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import Combobox from "@dt/Combobox";

const OPTIONS = [
  { value: "asap", label: "ASAP" },
  { value: "flexible", label: "Flexible" },
];

describe("Combobox", () => {
  it("shows placeholder when no value is selected", () => {
    render(
      <Combobox
        label="Timeline"
        options={OPTIONS}
        value=""
        onValueChange={() => {}}
        placeholder="Select..."
      />,
    );

    expect(screen.getByRole("combobox")).toHaveTextContent("Select...");
  });

  it("opens dropdown and selects an option", () => {
    const onValueChange = vi.fn();

    render(
      <Combobox
        label="Timeline"
        options={OPTIONS}
        value=""
        onValueChange={onValueChange}
        placeholder="Select..."
      />,
    );

    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(within(screen.getByRole("listbox")).getByRole("option", { name: "ASAP" }));
    expect(onValueChange).toHaveBeenCalledWith("asap");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("wires required combobox state to the portaled listbox", async () => {
    render(
      <Combobox
        id="timeline"
        label="Timeline"
        options={OPTIONS}
        value="flexible"
        onValueChange={() => {}}
        required
      />,
    );

    const trigger = screen.getByRole("combobox", { name: /Timeline/ });
    expect(trigger).toHaveAttribute("aria-required", "true");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveAttribute("aria-controls", "timeline-listbox");

    fireEvent.click(trigger);

    await waitFor(() =>
      expect(trigger).toHaveAttribute("aria-expanded", "true"),
    );
    expect(trigger).toHaveAttribute(
      "aria-activedescendant",
      "timeline-option-flexible",
    );
    expect(screen.getByRole("listbox", { name: "Timeline" })).toHaveAttribute(
      "id",
      "timeline-listbox",
    );
    expect(screen.getByRole("option", { name: "Flexible" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("closes when the chevron is clicked while open", () => {
    render(
      <Combobox
        label="Timeline"
        options={OPTIONS}
        value=""
        onValueChange={() => {}}
      />,
    );

    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByRole("button", { name: /toggle options/i }));
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("closes the listbox on Escape", () => {
    render(
      <Combobox
        label="Timeline"
        options={OPTIONS}
        value=""
        onValueChange={() => {}}
      />,
    );

    const trigger = screen.getByRole("combobox");
    fireEvent.click(trigger);
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    fireEvent.keyDown(trigger, { key: "Escape" });
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("wires helper text to the trigger when there is no error", () => {
    render(
      <Combobox
        id="timeline"
        label="Timeline"
        options={OPTIONS}
        value=""
        onValueChange={() => {}}
        helperText="Choose a timeline"
      />,
    );

    expect(screen.getByRole("combobox", { name: "Timeline" })).toHaveAttribute(
      "aria-describedby",
      "timeline-helper",
    );
    expect(screen.getByText("Choose a timeline")).toHaveAttribute(
      "id",
      "timeline-helper",
    );
  });

  it("wires error and helper text together when both are set", () => {
    render(
      <Combobox
        id="timeline"
        label="Timeline"
        options={OPTIONS}
        value=""
        onValueChange={() => {}}
        helperText="Choose a timeline"
        error="Timeline is required"
      />,
    );

    const trigger = screen.getByRole("combobox", { name: "Timeline" });
    expect(trigger).toHaveAttribute("aria-invalid", "true");
    expect(trigger).toHaveAttribute(
      "aria-describedby",
      "timeline-error timeline-helper",
    );
    expect(screen.getByText("Timeline is required")).toHaveAttribute(
      "id",
      "timeline-error",
    );
    expect(screen.getByText("Choose a timeline")).toHaveAttribute(
      "id",
      "timeline-helper",
    );
  });

  it("keeps keyboard navigation working when options are rebuilt every render", () => {
    // Consumers idiomatically build options inline (new array identity each
    // render). The highlight must survive those re-renders: a regression
    // here resets it to the selected option on every arrow key.
    function InlineOptionsHarness() {
      const [, force] = React.useState(0);
      React.useEffect(() => {
        const bump = () => force((n) => n + 1);
        window.addEventListener("keydown", bump);
        return () => window.removeEventListener("keydown", bump);
      }, []);
      return (
        <Combobox
          label="Timeline"
          id="inline-timeline"
          options={[
            { value: "", label: "Select..." },
            { value: "asap", label: "ASAP" },
            { value: "flexible", label: "Flexible" },
          ]}
          value=""
          onValueChange={() => {}}
        />
      );
    }
    render(<InlineOptionsHarness />);

    const trigger = screen.getByRole("combobox");
    fireEvent.keyDown(trigger, { key: "ArrowDown" }); // opens
    fireEvent.keyDown(trigger, { key: "ArrowDown" }); // -> index 1 (asap)
    fireEvent.keyDown(trigger, { key: "ArrowDown" }); // -> index 2 (flexible)
    expect(trigger).toHaveAttribute(
      "aria-activedescendant",
      "inline-timeline-option-flexible",
    );
  });
});
