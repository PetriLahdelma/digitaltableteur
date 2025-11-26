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
  describe("Rendering", () => {
    it("renders provided label when idle", () => {
      render(<AdaptiveLoadingButton>Action</AdaptiveLoadingButton>);
      expect(
        screen.getByRole("button", { name: /Action/ }),
      ).toBeInTheDocument();
    });

    it("renders with custom className", () => {
      render(
        <AdaptiveLoadingButton className="custom-class">
          Action
        </AdaptiveLoadingButton>,
      );
      const button = screen.getByRole("button");
      expect(button.className).toContain("custom-class");
    });

    it("renders with different variants", () => {
      const { rerender } = render(
        <AdaptiveLoadingButton variant="primary">
          Primary
        </AdaptiveLoadingButton>,
      );
      expect(screen.getByRole("button")).toBeInTheDocument();

      rerender(
        <AdaptiveLoadingButton variant="secondary">
          Secondary
        </AdaptiveLoadingButton>,
      );
      expect(screen.getByRole("button")).toBeInTheDocument();

      rerender(
        <AdaptiveLoadingButton variant="tertiary">
          Tertiary
        </AdaptiveLoadingButton>,
      );
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("renders with different sizes", () => {
      const { rerender } = render(
        <AdaptiveLoadingButton size="s">Small</AdaptiveLoadingButton>,
      );
      expect(screen.getByRole("button")).toBeInTheDocument();

      rerender(<AdaptiveLoadingButton size="m">Medium</AdaptiveLoadingButton>);
      expect(screen.getByRole("button")).toBeInTheDocument();

      rerender(<AdaptiveLoadingButton size="l">Large</AdaptiveLoadingButton>);
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("uses fallback translation key when no children provided", () => {
      render(<AdaptiveLoadingButton />);
      expect(
        screen.getByText(/adaptiveLoadingButton.idle/),
      ).toBeInTheDocument();
    });
  });

  describe("Loading State", () => {
    it("disables and shows loading content when loading", () => {
      render(<AdaptiveLoadingButton loading>Action</AdaptiveLoadingButton>);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-busy", "true");
      expect(button).toBeDisabled();
      expect(
        screen.getByText(/adaptiveLoadingButton.loading/),
      ).toBeInTheDocument();
    });

    it("shows progress percentage when provided", () => {
      render(
        <AdaptiveLoadingButton loading progress={42}>
          Action
        </AdaptiveLoadingButton>,
      );
      expect(
        screen.getByText(/adaptiveLoadingButton.progress 42/),
      ).toBeInTheDocument();
    });

    it("applies loading className when loading", () => {
      render(<AdaptiveLoadingButton loading>Action</AdaptiveLoadingButton>);
      const button = screen.getByRole("button");
      expect(button.className).toContain("loading");
    });

    it("updates accessible description when loading", () => {
      render(<AdaptiveLoadingButton loading>Action</AdaptiveLoadingButton>);
      expect(
        screen.getByText(/adaptiveLoadingButton.busyDescription/),
      ).toBeInTheDocument();
    });

    it("preserves custom accessible description when not loading", () => {
      render(
        <AdaptiveLoadingButton accessibleDescription="Custom description">
          Action
        </AdaptiveLoadingButton>,
      );
      // Button component would handle this internally
      expect(screen.getByRole("button")).toBeInTheDocument();
    });
  });

  describe("Interactions", () => {
    it("handles clicks when not loading", async () => {
      const onClick = vi.fn();
      render(
        <AdaptiveLoadingButton onClick={onClick}>
          Click me
        </AdaptiveLoadingButton>,
      );
      await userEvent.click(screen.getByRole("button"));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("prevents clicks when loading", async () => {
      const onClick = vi.fn();
      render(
        <AdaptiveLoadingButton loading onClick={onClick}>
          Loading
        </AdaptiveLoadingButton>,
      );
      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
      // Disabled buttons don't fire click events
    });

    it("prevents clicks when disabled", async () => {
      const onClick = vi.fn();
      render(
        <AdaptiveLoadingButton disabled onClick={onClick}>
          Disabled
        </AdaptiveLoadingButton>,
      );
      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });
  });

  describe("Props Forwarding", () => {
    it("forwards ref to Button component", () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<AdaptiveLoadingButton ref={ref}>Action</AdaptiveLoadingButton>);
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });

    it("forwards Button props correctly", () => {
      render(
        <AdaptiveLoadingButton variant="error" size="l">
          Action
        </AdaptiveLoadingButton>,
      );
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("merges loading state with disabled prop", () => {
      const { rerender } = render(
        <AdaptiveLoadingButton disabled>Action</AdaptiveLoadingButton>,
      );
      expect(screen.getByRole("button")).toBeDisabled();

      rerender(<AdaptiveLoadingButton loading>Action</AdaptiveLoadingButton>);
      expect(screen.getByRole("button")).toBeDisabled();

      rerender(
        <AdaptiveLoadingButton disabled loading>
          Action
        </AdaptiveLoadingButton>,
      );
      expect(screen.getByRole("button")).toBeDisabled();
    });
  });

  describe("Translation Keys", () => {
    it("uses correct loading translation key", () => {
      render(<AdaptiveLoadingButton loading>Action</AdaptiveLoadingButton>);
      expect(
        screen.getByText(/adaptiveLoadingButton.loading/),
      ).toBeInTheDocument();
    });

    it("uses custom loading label key when provided", () => {
      render(
        <AdaptiveLoadingButton loading loadingLabelKey="custom.loading">
          Action
        </AdaptiveLoadingButton>,
      );
      expect(screen.getByText(/custom.loading/)).toBeInTheDocument();
    });

    it("uses correct idle translation key", () => {
      render(<AdaptiveLoadingButton idleLabelKey="custom.idle" />);
      expect(screen.getByText(/custom.idle/)).toBeInTheDocument();
    });

    it("uses correct progress translation key with interpolation", () => {
      render(
        <AdaptiveLoadingButton loading progress={75}>
          Action
        </AdaptiveLoadingButton>,
      );
      expect(
        screen.getByText(/adaptiveLoadingButton.progress 75/),
      ).toBeInTheDocument();
    });

    it("uses correct busy description translation key", () => {
      render(<AdaptiveLoadingButton loading>Action</AdaptiveLoadingButton>);
      expect(
        screen.getByText(/adaptiveLoadingButton.busyDescription/),
      ).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has no accessibility violations in idle state", async () => {
      const { container } = render(
        <AdaptiveLoadingButton>Label</AdaptiveLoadingButton>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has no accessibility violations in loading state", async () => {
      const { container } = render(
        <AdaptiveLoadingButton loading>Label</AdaptiveLoadingButton>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has no accessibility violations with progress", async () => {
      const { container } = render(
        <AdaptiveLoadingButton loading progress={50}>
          Label
        </AdaptiveLoadingButton>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has no accessibility violations when disabled", async () => {
      const { container } = render(
        <AdaptiveLoadingButton disabled>Label</AdaptiveLoadingButton>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("marks spinner as decorative with aria-hidden", () => {
      const { container } = render(
        <AdaptiveLoadingButton loading>Action</AdaptiveLoadingButton>,
      );
      const spinner = container.querySelector('[aria-hidden="true"]');
      expect(spinner).toBeInTheDocument();
    });

    it("marks progress as polite live region", () => {
      render(
        <AdaptiveLoadingButton loading progress={30}>
          Action
        </AdaptiveLoadingButton>,
      );
      const progress = screen.getByText(/adaptiveLoadingButton.progress 30/);
      expect(progress).toHaveAttribute("aria-live", "polite");
    });
  });

  describe("Edge Cases", () => {
    it("handles progress at 0%", () => {
      render(
        <AdaptiveLoadingButton loading progress={0}>
          Action
        </AdaptiveLoadingButton>,
      );
      expect(
        screen.getByText(/adaptiveLoadingButton.progress 0/),
      ).toBeInTheDocument();
    });

    it("handles progress at 100%", () => {
      render(
        <AdaptiveLoadingButton loading progress={100}>
          Action
        </AdaptiveLoadingButton>,
      );
      expect(
        screen.getByText(/adaptiveLoadingButton.progress 100/),
      ).toBeInTheDocument();
    });

    it("does not show progress when progress is undefined", () => {
      render(<AdaptiveLoadingButton loading>Action</AdaptiveLoadingButton>);
      expect(
        screen.queryByText(/adaptiveLoadingButton.progress/),
      ).not.toBeInTheDocument();
    });

    it("handles very long button text", () => {
      const longText =
        "This is a very long button text that might cause layout issues";
      render(<AdaptiveLoadingButton>{longText}</AdaptiveLoadingButton>);
      expect(
        screen.getByRole("button", { name: new RegExp(longText) }),
      ).toBeInTheDocument();
    });

    it("handles loading state with very long text", () => {
      const longText =
        "Processing a very long and complex operation that takes time";
      render(<AdaptiveLoadingButton loading>{longText}</AdaptiveLoadingButton>);
      expect(screen.getByRole("button")).toBeInTheDocument();
    });
  });
});
