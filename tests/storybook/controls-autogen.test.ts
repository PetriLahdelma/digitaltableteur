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
  it("seeds controlled and uncontrolled rows so both controls stay operable", () => {
    const args = checkboxArgs({});

    expect(args).toHaveProperty("checked", false);
    expect(args).toHaveProperty("defaultChecked", false);
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
