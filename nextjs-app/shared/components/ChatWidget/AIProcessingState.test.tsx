import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import AIProcessingState from "@dt/ChatWidget/AIProcessingState";
import { I18nextProvider } from "react-i18next";
import i18n from "../../i18n";

expect.extend(toHaveNoViolations);

const renderWithI18n = (ui: React.ReactElement) => {
  return render(<I18nextProvider i18n={i18n}>{ui}</I18nextProvider>);
};

describe("AIProcessingState", () => {
  describe("Rendering", () => {
    it("renders with default props", () => {
      renderWithI18n(<AIProcessingState />);
      const container = screen.getByTestId("ai-processing-state");
      expect(container).toBeInTheDocument();
      expect(container).toHaveAttribute("data-mode", "thinking");
      expect(container).toHaveAttribute("data-intensity", "subtle");
    });

    it("renders thinking mode message", () => {
      renderWithI18n(<AIProcessingState mode="thinking" />);
      expect(screen.getByText(/thinking/i)).toBeInTheDocument();
    });

    it("renders generating mode message", () => {
      renderWithI18n(<AIProcessingState mode="generating" />);
      expect(screen.getByText(/generating/i)).toBeInTheDocument();
    });

    it("renders analyzing mode message", () => {
      renderWithI18n(<AIProcessingState mode="analyzing" />);
      expect(screen.getByText(/analyzing/i)).toBeInTheDocument();
    });

    it("renders custom message when provided", () => {
      const customMessage = "Processing your request...";
      renderWithI18n(<AIProcessingState customMessage={customMessage} />);
      expect(screen.getByText(customMessage)).toBeInTheDocument();
    });

    it("applies custom className", () => {
      renderWithI18n(<AIProcessingState className="custom-class" />);
      const container = screen.getByTestId("ai-processing-state");
      expect(container).toHaveClass("custom-class");
    });
  });

  describe("Intensity Levels", () => {
    it("applies subtle intensity by default", () => {
      renderWithI18n(<AIProcessingState />);
      const container = screen.getByTestId("ai-processing-state");
      expect(container).toHaveAttribute("data-intensity", "subtle");
    });

    it("applies moderate intensity", () => {
      renderWithI18n(<AIProcessingState intensity="moderate" />);
      const container = screen.getByTestId("ai-processing-state");
      expect(container).toHaveAttribute("data-intensity", "moderate");
    });

    it("applies prominent intensity", () => {
      renderWithI18n(<AIProcessingState intensity="prominent" />);
      const container = screen.getByTestId("ai-processing-state");
      expect(container).toHaveAttribute("data-intensity", "prominent");
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA role and live region", () => {
      renderWithI18n(<AIProcessingState />);
      const container = screen.getByTestId("ai-processing-state");
      expect(container).toHaveAttribute("role", "status");
      expect(container).toHaveAttribute("aria-live", "polite");
    });

    it("has accessible label matching visible text", () => {
      renderWithI18n(<AIProcessingState mode="thinking" />);
      const container = screen.getByTestId("ai-processing-state");
      const label = container.getAttribute("aria-label");
      expect(label).toMatch(/thinking/i);
    });

    it("hides decorative text from screen readers", () => {
      renderWithI18n(<AIProcessingState />);
      const text = screen.getByText(/thinking/i);
      expect(text).toHaveAttribute("aria-hidden", "true");
    });

    it("passes axe accessibility tests - default", async () => {
      const { container } = renderWithI18n(<AIProcessingState />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("passes axe accessibility tests - all modes", async () => {
      const modes: Array<"thinking" | "generating" | "analyzing"> = [
        "thinking",
        "generating",
        "analyzing",
      ];

      for (const mode of modes) {
        const { container } = renderWithI18n(<AIProcessingState mode={mode} />);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    });

    it("passes axe accessibility tests - all intensities", async () => {
      const intensities: Array<"subtle" | "moderate" | "prominent"> = [
        "subtle",
        "moderate",
        "prominent",
      ];

      for (const intensity of intensities) {
        const { container } = renderWithI18n(
          <AIProcessingState intensity={intensity} />,
        );
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    });
  });

  describe("Data Attributes", () => {
    it("sets correct mode data attribute", () => {
      const { rerender } = renderWithI18n(
        <AIProcessingState mode="thinking" />,
      );
      let container = screen.getByTestId("ai-processing-state");
      expect(container).toHaveAttribute("data-mode", "thinking");

      rerender(
        <I18nextProvider i18n={i18n}>
          <AIProcessingState mode="generating" />
        </I18nextProvider>,
      );
      container = screen.getByTestId("ai-processing-state");
      expect(container).toHaveAttribute("data-mode", "generating");

      rerender(
        <I18nextProvider i18n={i18n}>
          <AIProcessingState mode="analyzing" />
        </I18nextProvider>,
      );
      container = screen.getByTestId("ai-processing-state");
      expect(container).toHaveAttribute("data-mode", "analyzing");
    });

    it("sets correct intensity data attribute", () => {
      const { rerender } = renderWithI18n(
        <AIProcessingState intensity="subtle" />,
      );
      let container = screen.getByTestId("ai-processing-state");
      expect(container).toHaveAttribute("data-intensity", "subtle");

      rerender(
        <I18nextProvider i18n={i18n}>
          <AIProcessingState intensity="moderate" />
        </I18nextProvider>,
      );
      container = screen.getByTestId("ai-processing-state");
      expect(container).toHaveAttribute("data-intensity", "moderate");

      rerender(
        <I18nextProvider i18n={i18n}>
          <AIProcessingState intensity="prominent" />
        </I18nextProvider>,
      );
      container = screen.getByTestId("ai-processing-state");
      expect(container).toHaveAttribute("data-intensity", "prominent");
    });
  });
});
