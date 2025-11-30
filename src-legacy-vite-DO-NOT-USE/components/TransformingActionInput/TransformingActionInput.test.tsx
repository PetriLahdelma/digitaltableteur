import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import React from "react";
import { describe, it, expect, vi } from "vitest";
import TransformingActionInput from "./TransformingActionInput";

expect.extend(toHaveNoViolations);

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "en" },
  }),
}));

describe("TransformingActionInput", () => {
  describe("Button Mode", () => {
    test("renders trigger button by default", () => {
      render(<TransformingActionInput />);
      expect(
        screen.getByRole("button", {
          name: /transformingActionInput.trigger/,
        }),
      ).toBeInTheDocument();
    });

    test("transforms to input on click", async () => {
      render(<TransformingActionInput />);
      await userEvent.click(
        screen.getByRole("button", {
          name: /transformingActionInput.trigger/,
        }),
      );
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    test("respects disabled prop in button mode", () => {
      render(<TransformingActionInput disabled />);
      expect(
        screen.getByRole("button", {
          name: /transformingActionInput.trigger/,
        }),
      ).toBeDisabled();
    });
  });

  describe("Input Mode", () => {
    test("renders input when initialMode is input", () => {
      render(<TransformingActionInput initialMode="input" />);
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

    test("respects disabled prop in input mode", () => {
      render(<TransformingActionInput initialMode="input" disabled />);
      expect(screen.getByRole("textbox")).toBeDisabled();
      expect(
        screen.getByRole("button", { name: /transformingActionInput.submit/ }),
      ).toBeDisabled();
    });

    test("renders helper text when provided", () => {
      render(
        <TransformingActionInput
          initialMode="input"
          helperTextKey="transformingActionInput.helper"
        />,
      );
      expect(
        screen.getByText("transformingActionInput.helper"),
      ).toBeInTheDocument();
    });

    test("uses defaultValue prop", () => {
      render(
        <TransformingActionInput
          initialMode="input"
          defaultValue="test value"
        />,
      );
      expect(screen.getByRole("textbox")).toHaveValue("test value");
    });

    test("calls onChange when value changes", async () => {
      const handleChange = vi.fn();
      render(
        <TransformingActionInput initialMode="input" onChange={handleChange} />,
      );
      const input = screen.getByRole("textbox");
      await userEvent.type(input, "test");
      expect(handleChange).toHaveBeenCalled();
    });
  });

  describe("Cancel Action", () => {
    test("shows cancel button in input mode", () => {
      render(<TransformingActionInput initialMode="input" />);
      expect(
        screen.getByRole("button", { name: /transformingActionInput.cancel/ }),
      ).toBeInTheDocument();
    });

    test("transforms back to button on cancel", async () => {
      render(<TransformingActionInput />);
      await userEvent.click(
        screen.getByRole("button", {
          name: /transformingActionInput.trigger/,
        }),
      );
      await userEvent.click(
        screen.getByRole("button", { name: /transformingActionInput.cancel/ }),
      );
      expect(
        screen.getByRole("button", {
          name: /transformingActionInput.trigger/,
        }),
      ).toBeInTheDocument();
    });

    test("does not transform back if stayInInputMode is true", async () => {
      render(<TransformingActionInput stayInInputMode />);
      await userEvent.click(
        screen.getByRole("button", {
          name: /transformingActionInput.trigger/,
        }),
      );
      await userEvent.click(
        screen.getByRole("button", { name: /transformingActionInput.cancel/ }),
      );
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });
  });

  describe("Ref Methods", () => {
    test("exposes focus method via ref", () => {
      const ref = React.createRef<{
        focus: () => void;
        getValue: () => string;
        transformToInput: () => void;
      }>();
      render(<TransformingActionInput ref={ref} />);
      expect(ref.current?.focus).toBeDefined();
    });

    test("exposes getValue method via ref", () => {
      const ref = React.createRef<{
        focus: () => void;
        getValue: () => string;
        transformToInput: () => void;
      }>();
      render(
        <TransformingActionInput
          ref={ref}
          initialMode="input"
          defaultValue="test"
        />,
      );
      expect(ref.current?.getValue()).toBe("test");
    });

    test("exposes transformToInput method via ref", () => {
      const ref = React.createRef<{
        focus: () => void;
        getValue: () => string;
        transformToInput: () => void;
      }>();
      render(<TransformingActionInput ref={ref} />);
      expect(ref.current?.transformToInput).toBeDefined();
      ref.current?.transformToInput();
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    test("has no accessibility violations in input mode", async () => {
      const { container } = render(
        <TransformingActionInput initialMode="input" />,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test("has no accessibility violations in button mode", async () => {
      const { container } = render(<TransformingActionInput />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
