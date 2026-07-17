import { describe, expect, it } from "vitest";
import {
  autogenArgs,
  autogenArgTypes,
} from "../../.storybook/lib/controls-autogen";

function checkboxArgs(initialArgs: Record<string, unknown>) {
  return autogenArgs({
    title: "Forms/Checkbox",
    initialArgs,
    argTypes: {},
  } as never) as Record<string, unknown>;
}

describe("contract-driven Storybook args", () => {
  it("seeds the uncontrolled row and leaves the controlled half unseeded", () => {
    const args = checkboxArgs({});

    // `checked` is the controlled half of the checked/defaultChecked pair:
    // seeding it locks the canvas into controlled mode (defaultChecked
    // ignored, clicking dead) — it stays unseeded and its panel row hidden.
    expect(args).not.toHaveProperty("checked");
    expect(args).toHaveProperty("defaultChecked", false);
  });

  it("hides the controlled half's panel row", () => {
    const argTypes = autogenArgTypes({
      title: "Forms/Checkbox",
      argTypes: {},
    } as never) as Record<string, { table?: { disable?: boolean } }>;

    expect(argTypes.checked?.table?.disable).toBe(true);
    expect(argTypes.defaultChecked?.table?.disable).not.toBe(true);
  });

  it("preserves an explicitly authored uncontrolled default", () => {
    expect(checkboxArgs({ defaultChecked: true })).toMatchObject({
      defaultChecked: true,
    });
  });

  it("replaces docgen's object control for a ReactNode children slot", () => {
    const argTypes = autogenArgTypes({
      title: "Site/VisuallyHidden",
      argTypes: { children: { control: { type: "object" } } },
    } as never) as Record<string, { control?: { type?: string } }>;

    expect(argTypes.children?.control).toEqual({ type: "text" });
  });
});
