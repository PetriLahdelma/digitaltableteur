import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import axe from "axe-core";
import ComplianceCard from "@dt/ComplianceCard";
import type { ComplianceRule } from "@dt/ComplianceCard";

// Mock the package translation adapter.
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

const mockRules: ComplianceRule[] = [
  {
    id: "test-1",
    rule: "Test Rule 1",
    status: "pass",
    details: "All good",
  },
  {
    id: "test-2",
    rule: "Test Rule 2",
    status: "warning",
    details: "Minor issues",
  },
  {
    id: "test-3",
    rule: "Test Rule 3",
    status: "fail",
    details: "Critical failure",
  },
];

describe("ComplianceCard", () => {
  describe("Rendering", () => {
    test("renders without crashing", () => {
      render(<ComplianceCard title="Test Compliance" rules={mockRules} />);
      expect(screen.getByText("Test Compliance")).toBeInTheDocument();
    });

    test("renders all rules", () => {
      render(<ComplianceCard title="Test" rules={mockRules} />);
      expect(screen.getByText("Test Rule 1")).toBeInTheDocument();
      expect(screen.getByText("Test Rule 2")).toBeInTheDocument();
      expect(screen.getByText("Test Rule 3")).toBeInTheDocument();
    });

    test("renders all rule details", () => {
      render(<ComplianceCard title="Test" rules={mockRules} />);
      expect(screen.getByText("All good")).toBeInTheDocument();
      expect(screen.getByText("Minor issues")).toBeInTheDocument();
      expect(screen.getByText("Critical failure")).toBeInTheDocument();
    });

    test("renders rules in card format", () => {
      render(<ComplianceCard title="Test" rules={mockRules} />);
      // Component now uses a grid layout with individual rule cards, not a table
      expect(screen.getByText("Test Rule 1")).toBeInTheDocument();
      expect(screen.getByText("Test Rule 2")).toBeInTheDocument();
      expect(screen.getByText("Test Rule 3")).toBeInTheDocument();
    });

    test("applies custom className", () => {
      const { container } = render(
        <ComplianceCard
          title="Test"
          rules={mockRules}
          className="custom-class"
        />,
      );
      // Card component receives className, check container has it applied somewhere
      expect(container.querySelector(".custom-class")).toBeInTheDocument();
    });
  });

  describe("Status Icons", () => {
    test("renders correct icon for pass status", () => {
      const passRule: ComplianceRule[] = [
        {
          id: "pass-test",
          rule: "Pass Test",
          status: "pass",
          details: "Success",
        },
      ];
      render(<ComplianceCard title="Test" rules={passRule} />);
      // Icon component with check-circle name should be rendered
      const icon = screen.getByLabelText("complianceCard.status.pass");
      expect(icon).toBeInTheDocument();
    });

    test("renders correct icon for warning status", () => {
      const warningRule: ComplianceRule[] = [
        {
          id: "warning-test",
          rule: "Warning Test",
          status: "warning",
          details: "Warning",
        },
      ];
      render(<ComplianceCard title="Test" rules={warningRule} />);
      const icon = screen.getByLabelText("complianceCard.status.warning");
      expect(icon).toBeInTheDocument();
    });

    test("renders correct icon for fail status", () => {
      const failRule: ComplianceRule[] = [
        {
          id: "fail-test",
          rule: "Fail Test",
          status: "fail",
          details: "Failure",
        },
      ];
      render(<ComplianceCard title="Test" rules={failRule} />);
      const icon = screen.getByLabelText("complianceCard.status.fail");
      expect(icon).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    test("renders with proper heading structure", () => {
      render(<ComplianceCard title="Test Compliance" rules={mockRules} />);
      expect(
        screen.getByRole("heading", { name: "Test Compliance" }),
      ).toBeInTheDocument();
    });

    test("status icons have aria-labels", () => {
      render(<ComplianceCard title="Test" rules={mockRules} />);
      expect(
        screen.getByLabelText("complianceCard.status.pass"),
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText("complianceCard.status.warning"),
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText("complianceCard.status.fail"),
      ).toBeInTheDocument();
    });

    test("resize handle exposes separator value semantics", () => {
      render(<ComplianceCard title="Test" rules={mockRules} />);
      const resizeHandle = screen.getByRole("separator", {
        name: "complianceCard.resizeHandle",
      });

      expect(resizeHandle).toHaveAttribute("aria-valuenow", "100");
      expect(resizeHandle).toHaveAttribute("aria-valuemin", "0");
      expect(resizeHandle).toHaveAttribute("aria-valuemax", "100");
    });

    test("uses grid layout for rules", () => {
      const { container } = render(
        <ComplianceCard title="Test" rules={mockRules} />,
      );
      // Component uses a grid container instead of table
      expect(
        container.querySelector('[class*="gridContainer"]'),
      ).toBeInTheDocument();
      expect(screen.getAllByText(/Test Rule/i)).toHaveLength(3);
    });
  });

  describe("Empty State", () => {
    test("renders with no rules", () => {
      const { container } = render(
        <ComplianceCard title="Empty Test" rules={[]} />,
      );
      expect(screen.getByText("Empty Test")).toBeInTheDocument();
      // Grid container still renders even with no rules
      expect(
        container.querySelector('[class*="gridContainer"]'),
      ).toBeInTheDocument();
    });
  });

  describe("Unique Keys", () => {
    test("uses unique id for each rule card", () => {
      const { container } = render(
        <ComplianceCard title="Test" rules={mockRules} />,
      );
      const ruleCards = container.querySelectorAll('[class*="ruleCard"]');
      expect(ruleCards).toHaveLength(3);
      // React doesn't expose keys in DOM, but we can verify rendering is correct
      expect(ruleCards[0]).toHaveTextContent("Test Rule 1");
      expect(ruleCards[1]).toHaveTextContent("Test Rule 2");
      expect(ruleCards[2]).toHaveTextContent("Test Rule 3");
    });
  });
});
