import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import React from "react";
import { describe, it, expect, vi } from "vitest";
import AdaptiveLoadingButton from "./AdaptiveLoadingButton";

expect.extend(toHaveNoViolations);

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, unknown>) =>
      params?.percent ? `${key} ${params.percent}` : key,
    i18n: { language: "en" },
  }),
}));

describe("AdaptiveLoadingButton", () => {
  test("renders provided label when idle", () => {
    render(<AdaptiveLoadingButton>Action</AdaptiveLoadingButton>);
    expect(screen.getByRole("button", { name: /Action/ })).toBeInTheDocument();
  });

  test("disables and shows loading content when loading", () => {
    render(<AdaptiveLoadingButton loading>Action</AdaptiveLoadingButton>);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toBeDisabled();
    expect(
      screen.getByText(/adaptiveLoadingButton.loading/),
    ).toBeInTheDocument();
  });

  test("handles clicks when not loading", async () => {
    const onClick = vi.fn();
    render(
      <AdaptiveLoadingButton onClick={onClick}>Click me</AdaptiveLoadingButton>,
    );
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test("has no accessibility violations", async () => {
    const { container } = render(
      <AdaptiveLoadingButton>Label</AdaptiveLoadingButton>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
