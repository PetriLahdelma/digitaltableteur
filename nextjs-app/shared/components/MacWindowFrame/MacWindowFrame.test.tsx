import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import React from "react";
import { describe, it, expect, vi } from "vitest";
import MacWindowFrame from "@dt/MacWindowFrame";

expect.extend(toHaveNoViolations);

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "en" },
  }),
}));

describe("MacWindowFrame", () => {
  test("renders content and title", () => {
    render(<MacWindowFrame>Content</MacWindowFrame>);
    expect(screen.getByText(/Content/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
      "Preview",
    );
  });

  test("fires action when provided", async () => {
    const onAction = vi.fn();
    render(<MacWindowFrame onAction={onAction}>Content</MacWindowFrame>);
    await userEvent.click(screen.getByRole("button"));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  test("has no accessibility violations", async () => {
    const { container } = render(<MacWindowFrame>Content</MacWindowFrame>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
