import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import SplitButton from "./SplitButton";

describe("SplitButton", () => {
  const options = [
    { id: "save-as", label: "Save as" },
    { id: "save-cloud", label: "Save to cloud" },
  ];

  it("opens menu and calls option handler", () => {
    const onSelect = vi.fn();
    render(
      <SplitButton
        label="Save"
        options={[
          options[0],
          { ...options[1], onSelect },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /more options/i }));
    fireEvent.click(screen.getByRole("menuitem", { name: /save to cloud/i }));

    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("supports keyboard navigation", () => {
    const onSelect = vi.fn();
    render(
      <SplitButton
        label="Save"
        options={[
          { ...options[0], disabled: true },
          { ...options[1], onSelect },
        ]}
      />,
    );
    const toggle = screen.getByRole("button", { name: /more options/i });
    fireEvent.keyDown(toggle, { key: "Enter" });
    fireEvent.keyDown(screen.getByRole("menu"), { key: "ArrowDown" });
    fireEvent.keyDown(screen.getByRole("menuitem", { name: /save to cloud/i }), {
      key: "Enter",
    });
    expect(onSelect).toHaveBeenCalledTimes(1);
  });
});
