import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import React from "react";
import { describe, it, expect, vi } from "vitest";
import TransformingActionInput from "@dt/TransformingActionInput";

expect.extend(toHaveNoViolations);

vi.mock("../../lib/translation", () => {
  const t = (key: string) => key;
  return {
    useTranslate: () => t,
    useLocalization: () => ({
      translate: t,
      language: "en",
      resolvedLanguage: "en",
      changeLanguage: vi.fn(),
      getResourceBundle: vi.fn(),
    }),
  };
});

describe("TransformingActionInput", () => {
  test("renders trigger button by default", () => {
    render(<TransformingActionInput />);
    expect(
      screen.getByRole("button", { name: /transformingActionInput.trigger/ }),
    ).toBeInTheDocument();
  });

  test("transforms to input on click", async () => {
    render(<TransformingActionInput />);
    await userEvent.click(
      screen.getByRole("button", { name: /transformingActionInput.trigger/ }),
    );
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  test("submits value in input mode", async () => {
    const handleSubmit = vi.fn();
    render(
      <TransformingActionInput initialMode="input" onSubmit={handleSubmit} />,
    );
    const input = screen.getByRole("textbox");
    await userEvent.type(input, "hello");
    await userEvent.click(
      screen.getByRole("button", { name: /transformingActionInput.submit/ }),
    );
    expect(handleSubmit).toHaveBeenCalledWith("hello");
  });

  test("has no accessibility violations", async () => {
    const { container } = render(
      <TransformingActionInput initialMode="input" />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
