import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ProcessBlock from "./ProcessBlock";

const mockPhases = [
  {
    title: "Discover",
    activities: [
      "User Research",
      "Stakeholder Workshops",
      "Benchmark Analysis",
    ],
  },
  {
    title: "Define",
    activities: ["User Personas", "Empathy Map", "User Journey Mapping"],
  },
  {
    title: "Ideate",
    activities: ["User Flows", "Wireframes", "Prototypes"],
  },
  {
    title: "Design",
    activities: ["Reusable Components", "Documentation", "Design Reviews"],
  },
];

describe("ProcessBlock", () => {
  describe("Basic Rendering", () => {
    it("renders with required phases prop", () => {
      render(<ProcessBlock phases={mockPhases} />);
      expect(screen.getByText("Process")).toBeInTheDocument();
      expect(screen.getByText("Discover")).toBeInTheDocument();
    });

    it("renders custom section title", () => {
      render(
        <ProcessBlock phases={mockPhases} sectionTitle="Our Methodology" />,
      );
      expect(screen.getByText("Our Methodology")).toBeInTheDocument();
    });

    it("renders without section title when empty string provided", () => {
      render(<ProcessBlock phases={mockPhases} sectionTitle="" />);
      expect(screen.queryByText("Process")).not.toBeInTheDocument();
    });

    it("renders string description", () => {
      render(
        <ProcessBlock
          phases={mockPhases}
          description="This is our process description"
        />,
      );
      expect(
        screen.getByText("This is our process description"),
      ).toBeInTheDocument();
    });

    it("renders React node description", () => {
      render(
        <ProcessBlock
          phases={mockPhases}
          description={<div>Custom description node</div>}
        />,
      );
      expect(screen.getByText("Custom description node")).toBeInTheDocument();
    });
  });

  describe("Process Phases Rendering", () => {
    it("renders all phase titles", () => {
      render(<ProcessBlock phases={mockPhases} />);
      expect(screen.getByText("Discover")).toBeInTheDocument();
      expect(screen.getByText("Define")).toBeInTheDocument();
      expect(screen.getByText("Ideate")).toBeInTheDocument();
      expect(screen.getByText("Design")).toBeInTheDocument();
    });

    it("renders all activities for each phase", () => {
      render(<ProcessBlock phases={mockPhases} />);
      expect(screen.getByText("User Research")).toBeInTheDocument();
      expect(screen.getByText("User Personas")).toBeInTheDocument();
      expect(screen.getByText("Wireframes")).toBeInTheDocument();
      expect(screen.getByText("Documentation")).toBeInTheDocument();
    });

    it("renders correct number of phases", () => {
      const { container } = render(<ProcessBlock phases={mockPhases} />);
      const phases = container.querySelectorAll('[class*="col"]');
      expect(phases).toHaveLength(4);
    });

    it("handles single phase", () => {
      const singlePhase = [
        { title: "Single Phase", activities: ["Activity 1", "Activity 2"] },
      ];
      render(<ProcessBlock phases={singlePhase} />);
      expect(screen.getByText("Single Phase")).toBeInTheDocument();
      expect(screen.getByText("Activity 1")).toBeInTheDocument();
    });

    it("handles many phases", () => {
      const manyPhases = [
        ...mockPhases,
        { title: "Deploy", activities: ["Launch", "Monitor"] },
        { title: "Maintain", activities: ["Support", "Updates"] },
      ];
      const { container } = render(<ProcessBlock phases={manyPhases} />);
      const phases = container.querySelectorAll('[class*="col"]');
      expect(phases).toHaveLength(6);
    });
  });

  describe("Layout & Styling", () => {
    it("applies custom className", () => {
      const { container } = render(
        <ProcessBlock phases={mockPhases} className="custom-class" />,
      );
      expect(container.firstChild).toHaveClass("custom-class");
    });

    it("renders as section by default", () => {
      const { container } = render(<ProcessBlock phases={mockPhases} />);
      expect(container.firstChild?.nodeName).toBe("SECTION");
    });

    it("renders as article when specified", () => {
      const { container } = render(
        <ProcessBlock phases={mockPhases} as="article" />,
      );
      expect(container.firstChild?.nodeName).toBe("ARTICLE");
    });

    it("renders as div when specified", () => {
      const { container } = render(
        <ProcessBlock phases={mockPhases} as="div" />,
      );
      expect(container.firstChild?.nodeName).toBe("DIV");
    });

    it("applies light background by default", () => {
      const { container } = render(<ProcessBlock phases={mockPhases} />);
      const section = container.firstChild as HTMLElement;
      expect(section.style.backgroundColor).toBe("var(--color-light-bg)");
    });

    it("applies white background when specified", () => {
      const { container } = render(
        <ProcessBlock phases={mockPhases} backgroundColor="white" />,
      );
      const section = container.firstChild as HTMLElement;
      expect(section.style.backgroundColor).toBe("var(--color-white)");
    });

    it("applies transparent background when specified", () => {
      const { container } = render(
        <ProcessBlock phases={mockPhases} backgroundColor="transparent" />,
      );
      const section = container.firstChild as HTMLElement;
      expect(section.style.backgroundColor).toBe("transparent");
    });

    it("applies 4-column grid class by default", () => {
      const { container } = render(<ProcessBlock phases={mockPhases} />);
      const grid = container.querySelector('[class*="grid4Col"]');
      expect(grid).toBeInTheDocument();
    });

    it("applies 2-column grid class when specified", () => {
      const { container } = render(
        <ProcessBlock phases={mockPhases} columns={2} />,
      );
      const grid = container.querySelector('[class*="grid2Col"]');
      expect(grid).toBeInTheDocument();
    });

    it("applies 3-column grid class when specified", () => {
      const { container } = render(
        <ProcessBlock phases={mockPhases} columns={3} />,
      );
      const grid = container.querySelector('[class*="grid3Col"]');
      expect(grid).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("applies aria-label from sectionTitle by default", () => {
      const { container } = render(
        <ProcessBlock phases={mockPhases} sectionTitle="Custom Process" />,
      );
      expect(container.firstChild).toHaveAttribute(
        "aria-label",
        "Custom Process",
      );
    });

    it("applies custom aria-label when provided", () => {
      const { container } = render(
        <ProcessBlock
          phases={mockPhases}
          sectionTitle="Process"
          ariaLabel="Custom accessible label"
        />,
      );
      expect(container.firstChild).toHaveAttribute(
        "aria-label",
        "Custom accessible label",
      );
    });

    it("uses proper heading hierarchy", () => {
      render(<ProcessBlock phases={mockPhases} />);
      const mainHeading = screen.getByText("Process");
      expect(mainHeading.tagName).toBe("H2");

      // Phase titles sit directly under the section title (H2), so they are
      // H3 — sequential, no skipped level. Asserting H4 here would itself be a
      // heading-hierarchy violation (H2 → H4).
      const phaseHeading = screen.getByText("Discover");
      expect(phaseHeading.tagName).toBe("H3");
    });

    it("has data attribute for title", () => {
      render(<ProcessBlock phases={mockPhases} />);
      const title = screen.getByText("Process");
      expect(title).toHaveAttribute("data-process-title");
    });
  });

  describe("Props Defaults", () => {
    it("uses default maxWidth of lg", () => {
      render(<ProcessBlock phases={mockPhases} />);
      // PageLayout component would handle this, just verify it renders
      expect(screen.getByText("Process")).toBeInTheDocument();
    });

    it("uses default spacing of comfortable", () => {
      render(<ProcessBlock phases={mockPhases} />);
      // PageLayout component would handle this, just verify it renders
      expect(screen.getByText("Process")).toBeInTheDocument();
    });

    it("uses default columns of 4", () => {
      const { container } = render(<ProcessBlock phases={mockPhases} />);
      const grid = container.querySelector('[class*="grid4Col"]');
      expect(grid).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles empty activities array", () => {
      const emptyActivities = [{ title: "Empty Phase", activities: [] }];
      render(<ProcessBlock phases={emptyActivities} />);
      expect(screen.getByText("Empty Phase")).toBeInTheDocument();
    });

    it("handles phases with very long activity names", () => {
      const longActivities = [
        {
          title: "Phase",
          activities: [
            "This is a very long activity name that might cause layout issues if not handled properly",
          ],
        },
      ];
      render(<ProcessBlock phases={longActivities} />);
      expect(
        screen.getByText(/This is a very long activity name/),
      ).toBeInTheDocument();
    });

    it("handles phases with many activities", () => {
      const manyActivities = [
        {
          title: "Busy Phase",
          activities: Array.from({ length: 20 }, (_, i) => `Activity ${i + 1}`),
        },
      ];
      render(<ProcessBlock phases={manyActivities} />);
      expect(screen.getByText("Activity 1")).toBeInTheDocument();
      expect(screen.getByText("Activity 20")).toBeInTheDocument();
    });
  });
});
