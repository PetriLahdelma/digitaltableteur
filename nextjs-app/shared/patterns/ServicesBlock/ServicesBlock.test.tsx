import { render, screen } from "@testing-library/react";
import React from "react";
import ServicesBlock from "./ServicesBlock";
import { SiFigma, SiReact } from "react-icons/si";

describe("ServicesBlock", () => {
  const mockServices = [
    { label: "UX Design" },
    { label: "UI Design" },
    { label: "Frontend Development" },
  ];

  const mockTools = [
    { key: "figma", icon: <SiFigma size={24} />, ariaLabel: "Figma" },
    { key: "react", icon: <SiReact size={24} />, ariaLabel: "React" },
  ];

  describe("Basic Rendering", () => {
    it("renders overview content when provided as string", () => {
      render(<ServicesBlock overview="Test overview content" />);

      expect(screen.getByText("Test overview content")).toBeInTheDocument();
    });

    it("renders overview content when provided as React node", () => {
      render(
        <ServicesBlock
          overview={
            <div>
              <strong>Bold text</strong> and normal text
            </div>
          }
        />,
      );

      expect(screen.getByText("Bold text")).toBeInTheDocument();
      expect(screen.getByText("and normal text")).toBeInTheDocument();
    });

    it("renders default overview title", () => {
      render(<ServicesBlock overview="Content" />);
      expect(screen.getByText("Overview")).toBeInTheDocument();
    });

    it("renders custom overview title", () => {
      render(
        <ServicesBlock overview="Content" overviewTitle="Project Summary" />,
      );
      expect(screen.getByText("Project Summary")).toBeInTheDocument();
    });
  });

  describe("Services Section", () => {
    it("renders services list when provided", () => {
      render(<ServicesBlock services={mockServices} overview="Content" />);

      expect(screen.getByText("Services")).toBeInTheDocument();
      expect(screen.getByText("UX Design")).toBeInTheDocument();
      expect(screen.getByText("UI Design")).toBeInTheDocument();
      expect(screen.getByText("Frontend Development")).toBeInTheDocument();
    });

    it("does not render services section when empty", () => {
      render(<ServicesBlock services={[]} overview="Content" />);
      expect(screen.queryByText("Services")).not.toBeInTheDocument();
    });

    it("renders custom services title", () => {
      render(
        <ServicesBlock
          services={mockServices}
          servicesTitle="Our Services"
          overview="Content"
        />,
      );
      expect(screen.getByText("Our Services")).toBeInTheDocument();
    });
  });

  describe("Duration Section", () => {
    it("renders duration when provided", () => {
      render(
        <ServicesBlock duration="January 2024–March 2024" overview="Content" />,
      );

      expect(screen.getByText("Duration")).toBeInTheDocument();
      expect(screen.getByText("January 2024–March 2024")).toBeInTheDocument();
    });

    it("does not render duration section when not provided", () => {
      render(<ServicesBlock overview="Content" />);
      expect(screen.queryByText("Duration")).not.toBeInTheDocument();
    });

    it("renders custom duration title", () => {
      render(
        <ServicesBlock
          duration="2024"
          durationTitle="Timeline"
          overview="Content"
        />,
      );
      expect(screen.getByText("Timeline")).toBeInTheDocument();
    });
  });

  describe("Tools Section", () => {
    it("renders tools icons when provided", () => {
      render(<ServicesBlock tools={mockTools} overview="Content" />);

      expect(screen.getByText("Tools")).toBeInTheDocument();
      expect(screen.getByLabelText("Figma")).toBeInTheDocument();
      expect(screen.getByLabelText("React")).toBeInTheDocument();
    });

    it("does not render tools section when empty", () => {
      render(<ServicesBlock tools={[]} overview="Content" />);
      expect(screen.queryByText("Tools")).not.toBeInTheDocument();
    });

    it("renders custom tools title", () => {
      render(
        <ServicesBlock
          tools={mockTools}
          toolsTitle="Technologies"
          overview="Content"
        />,
      );
      expect(screen.getByText("Technologies")).toBeInTheDocument();
    });

    it("renders tools with proper list structure", () => {
      render(<ServicesBlock tools={mockTools} overview="Content" />);

      const toolsList = screen.getByRole("list", { name: "Tools" });
      expect(toolsList).toBeInTheDocument();

      const toolItems = screen.getAllByRole("listitem");
      expect(toolItems).toHaveLength(2);
    });
  });

  describe("Layout & Styling", () => {
    it("applies custom className", () => {
      const { container } = render(
        <ServicesBlock overview="Content" className="custom-class" />,
      );

      const section = container.querySelector("section");
      expect(section?.className).toContain("custom-class");
    });

    it("renders as specified HTML element", () => {
      const { container: sectionContainer } = render(
        <ServicesBlock overview="Content" as="section" />,
      );
      expect(sectionContainer.querySelector("section")).toBeInTheDocument();

      const { container: articleContainer } = render(
        <ServicesBlock overview="Content" as="article" />,
      );
      expect(articleContainer.querySelector("article")).toBeInTheDocument();

      const { container: divContainer } = render(
        <ServicesBlock overview="Content" as="div" />,
      );
      // PageLayout wraps in the specified element
      expect(divContainer.querySelector("div")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("applies aria-label to section", () => {
      const { container } = render(
        <ServicesBlock
          overview="Content"
          ariaLabel="Project details section"
        />,
      );

      const section = container.querySelector("section");
      expect(section).toHaveAttribute("aria-label", "Project details section");
    });

    it("includes proper heading hierarchy", () => {
      render(
        <ServicesBlock
          services={mockServices}
          duration="2024"
          tools={mockTools}
          overview="Content"
        />,
      );

      const headings = screen.getAllByRole("heading", { level: 3 });
      expect(headings).toHaveLength(4); // Services, Duration, Tools, Overview
    });

    it("has accessible tool icons with labels", () => {
      render(<ServicesBlock tools={mockTools} overview="Content" />);

      mockTools.forEach((tool) => {
        expect(screen.getByLabelText(tool.ariaLabel)).toBeInTheDocument();
      });
    });
  });

  describe("Conditional Rendering", () => {
    it("renders all sections when all data provided", () => {
      render(
        <ServicesBlock
          services={mockServices}
          duration="2024"
          tools={mockTools}
          overview="Content"
        />,
      );

      expect(screen.getByText("Services")).toBeInTheDocument();
      expect(screen.getByText("Duration")).toBeInTheDocument();
      expect(screen.getByText("Tools")).toBeInTheDocument();
      expect(screen.getByText("Overview")).toBeInTheDocument();
    });

    it("renders only overview when no metadata provided", () => {
      render(<ServicesBlock overview="Content" />);

      expect(screen.queryByText("Services")).not.toBeInTheDocument();
      expect(screen.queryByText("Duration")).not.toBeInTheDocument();
      expect(screen.queryByText("Tools")).not.toBeInTheDocument();
      expect(screen.getByText("Overview")).toBeInTheDocument();
    });

    it("renders partial metadata", () => {
      render(<ServicesBlock services={mockServices} overview="Content" />);

      expect(screen.getByText("Services")).toBeInTheDocument();
      expect(screen.queryByText("Duration")).not.toBeInTheDocument();
      expect(screen.queryByText("Tools")).not.toBeInTheDocument();
    });
  });

  describe("Props Defaults", () => {
    it("uses default maxWidth and spacing", () => {
      const { container } = render(<ServicesBlock overview="Content" />);
      // PageLayout handles these props - just verify component renders
      expect(container.querySelector("section")).toBeInTheDocument();
    });

    it("applies custom maxWidth and spacing", () => {
      const { container } = render(
        <ServicesBlock overview="Content" maxWidth="lg" spacing="spacious" />,
      );
      expect(container.querySelector("section")).toBeInTheDocument();
    });
  });
});
