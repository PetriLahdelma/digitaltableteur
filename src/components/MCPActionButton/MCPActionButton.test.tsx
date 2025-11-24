import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import React from "react";
import { describe, it, expect, vi } from "vitest";
import MCPActionButton from "./MCPActionButton";

expect.extend(toHaveNoViolations);

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "en" },
  }),
}));

describe("MCPActionButton", () => {
  test("renders label", () => {
    render(<MCPActionButton toolId="demo" />);
    expect(
      screen.getByRole("button", { name: /mcpActionButton.label/ }),
    ).toBeInTheDocument();
  });

  test("invokes MCP executor and updates status", async () => {
    const execute = vi.fn().mockResolvedValueOnce({ ok: true });
    const handleResult = vi.fn();
    render(
      <MCPActionButton
        toolId="demo"
        onExecute={execute}
        onResult={handleResult}
      />,
    );
    await userEvent.click(screen.getByRole("button"));
    await waitFor(() =>
      expect(
        screen.getByText(/mcpActionButton.status.success/),
      ).toBeInTheDocument(),
    );
    expect(execute).toHaveBeenCalledWith({
      toolId: "demo",
      payload: undefined,
    });
    expect(handleResult).toHaveBeenCalledWith({ ok: true });
  });

  test("has no accessibility violations", async () => {
    const { container } = render(<MCPActionButton toolId="demo" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
