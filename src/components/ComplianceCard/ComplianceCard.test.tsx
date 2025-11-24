import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import axe from "axe-core";
import ComplianceCard from "./ComplianceCard";
import type { ComplianceRule } from "./ComplianceCard";

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "en" },
  }),
}));

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

    test("renders table headers with translations", () => {
      render(<ComplianceCard title="Test" rules={mockRules} />);
      expect(screen.getByText("complianceCard.columnRule")).toBeInTheDocument();
      expect(
        screen.getByText("complianceCard.columnStatus"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("complianceCard.columnDetails"),
      ).toBeInTheDocument();
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
    test("has no accessibility violations", async () => {
      const { container } = render(
        <ComplianceCard title="Test Compliance" rules={mockRules} />,
      );
      const results = await axe.run(container);
      expect(results.violations).toEqual([]);
    });

    test("table headers have scope attribute", () => {
      render(<ComplianceCard title="Test" rules={mockRules} />);
      const headers = screen.getAllByRole("columnheader");
      headers.forEach((header) => {
        expect(header).toHaveAttribute("scope", "col");
      });
    });

    test("uses semantic table structure", () => {
      render(<ComplianceCard title="Test" rules={mockRules} />);
      expect(screen.getByRole("table")).toBeInTheDocument();
      expect(screen.getAllByRole("row")).toHaveLength(4); // 1 header + 3 data rows
      expect(screen.getAllByRole("columnheader")).toHaveLength(3);
      expect(screen.getAllByRole("cell")).toHaveLength(9); // 3 rows × 3 cells
    });
  });

  describe("Empty State", () => {
    test("renders with no rules", () => {
      render(<ComplianceCard title="Empty Test" rules={[]} />);
      expect(screen.getByText("Empty Test")).toBeInTheDocument();
      expect(screen.getByRole("table")).toBeInTheDocument();
    });
  });

  describe("Unique Keys", () => {
    test("uses unique id for each rule row", () => {
      const { container } = render(
        <ComplianceCard title="Test" rules={mockRules} />,
      );
      const rows = container.querySelectorAll("tbody tr");
      expect(rows).toHaveLength(3);
      // React doesn't expose keys in DOM, but we can verify rendering is correct
      expect(rows[0]).toHaveTextContent("Test Rule 1");
      expect(rows[1]).toHaveTextContent("Test Rule 2");
      expect(rows[2]).toHaveTextContent("Test Rule 3");
    });
  });
});
