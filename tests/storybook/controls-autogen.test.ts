import { describe, expect, it } from "vitest";
import { autogenArgs } from "../../.storybook/lib/controls-autogen";

function checkboxArgs(initialArgs: Record<string, unknown>) {
  return autogenArgs({
    title: "Forms/Checkbox",
    initialArgs,
    argTypes: {},
  } as never) as Record<string, unknown>;
}

describe("contract-driven Storybook args", () => {
  it("prefers an uncontrolled default regardless of contract property order", () => {
    const args = checkboxArgs({});

    expect(args).not.toHaveProperty("checked");
    expect(args).toHaveProperty("defaultChecked", false);
  });

  it("preserves an explicitly authored controlled value", () => {
    expect(checkboxArgs({ checked: true })).toMatchObject({ checked: true });
  });
});
