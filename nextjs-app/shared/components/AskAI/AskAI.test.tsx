import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AskAI } from "./AskAI";

vi.mock("../../lib/translation", () => {
  const t = (key: string, fallback?: string | { defaultValue?: string }) =>
    typeof fallback === "string" ? fallback : (fallback?.defaultValue ?? key);
  return { useTranslate: () => t };
});

describe("AskAI", () => {
  it("collapses to a pill on phones and toggles the panel both ways", async () => {
    const user = userEvent.setup();
    render(<AskAI />);

    const pill = screen.getByRole("button", { name: "Ask AI" });
    const minimize = screen.getByRole("button", { name: "Minimize Ask AI" });
    const panelId = pill.getAttribute("aria-controls")!;

    expect(pill).toHaveAttribute("aria-expanded", "false");
    expect(minimize).toHaveAttribute("aria-controls", panelId);
    expect(document.getElementById(panelId)).toContainElement(
      screen.getByRole("link", { name: /ChatGPT/ }),
    );

    const aside = screen.getByRole("complementary");
    const before = aside.className;
    await user.click(pill);
    expect(aside.className).not.toBe(before);
    await user.click(minimize);
    expect(aside.className).toBe(before);
  });
});
