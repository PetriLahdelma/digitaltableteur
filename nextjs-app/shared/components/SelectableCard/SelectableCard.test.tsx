import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SelectableCard, SelectableCardGroup } from "./SelectableCard";

const here = dirname(fileURLToPath(import.meta.url));
const css = readFileSync(join(here, "SelectableCard.module.css"), "utf8");

describe("SelectableCardGroup — single (radio)", () => {
  it("renders one radio per card, named as a set", () => {
    render(
      <SelectableCardGroup type="single" legend="Plan" name="plan">
        <SelectableCard value="a" title="A" />
        <SelectableCard value="b" title="B" />
      </SelectableCardGroup>,
    );
    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(2);
    expect(radios.every((r) => (r as HTMLInputElement).name === "plan")).toBe(
      true,
    );
  });

  it("selecting one option is exclusive and reports the value", () => {
    const onValueChange = vi.fn();
    render(
      <SelectableCardGroup
        type="single"
        legend="Plan"
        onValueChange={onValueChange}
      >
        <SelectableCard value="a" title="A" />
        <SelectableCard value="b" title="B" />
      </SelectableCardGroup>,
    );
    fireEvent.click(screen.getByRole("radio", { name: /A/ }));
    expect(onValueChange).toHaveBeenLastCalledWith("a");
    fireEvent.click(screen.getByRole("radio", { name: /B/ }));
    expect(onValueChange).toHaveBeenLastCalledWith("b");
    expect(
      (screen.getByRole("radio", { name: /A/ }) as HTMLInputElement).checked,
    ).toBe(false);
    expect(
      (screen.getByRole("radio", { name: /B/ }) as HTMLInputElement).checked,
    ).toBe(true);
  });

  it("honors defaultValue when uncontrolled", () => {
    render(
      <SelectableCardGroup type="single" legend="Plan" defaultValue="b">
        <SelectableCard value="a" title="A" />
        <SelectableCard value="b" title="B" />
      </SelectableCardGroup>,
    );
    expect(
      (screen.getByRole("radio", { name: /B/ }) as HTMLInputElement).checked,
    ).toBe(true);
  });

  it("marks the selected card with data-selected", () => {
    render(
      <SelectableCardGroup type="single" legend="Plan" defaultValue="a">
        <SelectableCard value="a" title="A" />
      </SelectableCardGroup>,
    );
    const label = screen.getByRole("radio", { name: /A/ }).closest("label");
    expect(label).toHaveAttribute("data-selected", "true");
  });
});

describe("SelectableCardGroup — multiple (checkbox)", () => {
  it("toggles options independently and reports an array", () => {
    const onValueChange = vi.fn();
    render(
      <SelectableCardGroup
        type="multiple"
        legend="Add-ons"
        onValueChange={onValueChange}
      >
        <SelectableCard value="x" title="X" />
        <SelectableCard value="y" title="Y" />
      </SelectableCardGroup>,
    );
    fireEvent.click(screen.getByRole("checkbox", { name: /X/ }));
    expect(onValueChange).toHaveBeenLastCalledWith(["x"]);
    fireEvent.click(screen.getByRole("checkbox", { name: /Y/ }));
    expect(onValueChange).toHaveBeenLastCalledWith(["x", "y"]);
    fireEvent.click(screen.getByRole("checkbox", { name: /X/ }));
    expect(onValueChange).toHaveBeenLastCalledWith(["y"]);
  });
});

describe("SelectableCardGroup — disabled", () => {
  it("disables every input and blocks selection", () => {
    const onValueChange = vi.fn();
    render(
      <SelectableCardGroup
        type="single"
        legend="Plan"
        disabled
        onValueChange={onValueChange}
      >
        <SelectableCard value="a" title="A" />
      </SelectableCardGroup>,
    );
    const radio = screen.getByRole("radio", { name: /A/ }) as HTMLInputElement;
    expect(radio).toBeDisabled();
    fireEvent.click(radio);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("supports a single disabled option inside an enabled group", () => {
    render(
      <SelectableCardGroup type="single" legend="Plan">
        <SelectableCard value="a" title="A" />
        <SelectableCard value="b" title="B" disabled />
      </SelectableCardGroup>,
    );
    expect(screen.getByRole("radio", { name: /A/ })).not.toBeDisabled();
    expect(screen.getByRole("radio", { name: /B/ })).toBeDisabled();
  });
});

describe("SelectableCardGroup — error", () => {
  it("announces the error and marks the group invalid", () => {
    render(
      <SelectableCardGroup type="single" legend="Plan" error="Pick one.">
        <SelectableCard value="a" title="A" />
      </SelectableCardGroup>,
    );
    expect(screen.getByText("Pick one.")).toBeInTheDocument();
    expect(screen.getByRole("group")).toHaveAttribute("aria-invalid", "true");
  });

  it("wires helper and error copy through aria-describedby", () => {
    render(
      <SelectableCardGroup
        type="single"
        legend="Plan"
        name="plan"
        helperText="Choose a plan."
        error="Pick one."
      >
        <SelectableCard value="a" title="A" />
      </SelectableCardGroup>,
    );

    const group = screen.getByRole("group", { name: "Plan" });
    expect(group).toHaveAttribute(
      "aria-describedby",
      expect.stringContaining("plan-helper"),
    );
    expect(group).toHaveAttribute(
      "aria-describedby",
      expect.stringContaining("plan-error"),
    );
  });
});

describe("SelectableCard — standalone", () => {
  it("toggles as a checkbox via selected / onSelectedChange", () => {
    const onSelectedChange = vi.fn();
    render(
      <SelectableCard
        value="solo"
        title="Solo"
        selected={false}
        onSelectedChange={onSelectedChange}
      />,
    );
    const input = screen.getByRole("checkbox", {
      name: /Solo/,
    }) as HTMLInputElement;
    expect(input.name).toBe("");
    fireEvent.click(input);
    expect(onSelectedChange).toHaveBeenCalledWith(true);
  });
});

// Guard the class names the component actually applies. Vitest's CSS-module
// proxy fabricates a class for any `styles.x`, so a typo'd/missing class is
// invisible to render tests and only shows as class="undefined" in prod.
describe("SelectableCard — CSS module classes exist", () => {
  it.each([
    "group",
    "legend",
    "options",
    "vertical",
    "horizontal",
    "card",
    "disabled",
    "input",
    "surface",
  ])("defines .%s", (cls) => {
    expect(css).toContain(`.${cls}`);
  });
});
