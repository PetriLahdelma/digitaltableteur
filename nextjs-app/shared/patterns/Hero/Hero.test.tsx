import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Hero from "./Hero";

describe("Hero", () => {
  describe("Basic Rendering", () => {
    it("renders title correctly", () => {
      render(<Hero title="Test Hero Title" />);
      expect(screen.getByText("Test Hero Title")).toBeInTheDocument();
    });

    it("renders subtitle when provided", () => {
      render(<Hero title="Title" subtitle="Test Subtitle" />);
      expect(screen.getByText("Test Subtitle")).toBeInTheDocument();
    });

    it("renders description when provided", () => {
      render(<Hero title="Title" description="Test Description" />);
      expect(screen.getByText("Test Description")).toBeInTheDocument();
    });

    it("does not render subtitle when not provided", () => {
      render(<Hero title="Title" />);
      expect(screen.queryByText("Test Subtitle")).not.toBeInTheDocument();
    });

    it("does not render description when not provided", () => {
      render(<Hero title="Title" />);
      expect(screen.queryByText("Test Description")).not.toBeInTheDocument();
    });
  });

  describe("Title Semantic Levels", () => {
    it("renders h1 by default", () => {
      render(<Hero title="Title" />);
      const title = screen.getByRole("heading", { level: 1 });
      expect(title).toBeInTheDocument();
    });

    it("renders h2 when titleLevel is 2", () => {
      render(<Hero title="Title" titleLevel={2} />);
      const title = screen.getByRole("heading", { level: 2 });
      expect(title).toBeInTheDocument();
    });

    it("renders h3 when titleLevel is 3", () => {
      render(<Hero title="Title" titleLevel={3} />);
      const title = screen.getByRole("heading", { level: 3 });
      expect(title).toBeInTheDocument();
    });
  });

  describe("Images", () => {
    it("renders image when imageSrc provided", () => {
      render(
        <Hero
          title="Title"
          imageSrc="/test.jpg"
          imageAlt="Test image"
          imageWidth={800}
          imageHeight={400}
        />
      );
      const image = screen.getByAltText("Test image");
      expect(image).toBeInTheDocument();
    });

    it("uses title as alt text when imageAlt not provided", () => {
      render(
        <Hero
          title="Hero Title"
          imageSrc="/test.jpg"
          imageWidth={800}
          imageHeight={400}
        />
      );
      const image = screen.getByAltText("Hero Title");
      expect(image).toBeInTheDocument();
    });

    it("does not render image when imageSrc not provided", () => {
      render(<Hero title="Title" imageAlt="Test" />);
      expect(screen.queryByRole("img")).not.toBeInTheDocument();
    });
  });

  describe("Actions", () => {
    it("renders action buttons when provided", () => {
      const actions = [
        { key: "btn1", label: "Button 1", variant: "primary" as const },
        { key: "btn2", label: "Button 2", variant: "secondary" as const },
      ];
      render(<Hero title="Title" actions={actions} />);

      expect(screen.getByText("Button 1")).toBeInTheDocument();
      expect(screen.getByText("Button 2")).toBeInTheDocument();
    });

    it("calls onClick handler when button clicked", async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      const actions = [{ key: "btn1", label: "Click Me", onClick }];

      render(<Hero title="Title" actions={actions} />);

      const button = screen.getByText("Click Me");
      await user.click(button);

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("renders action as link when href provided", () => {
      const actions = [
        { key: "link1", label: "Link Button", href: "/test-page" },
      ];
      render(<Hero title="Title" actions={actions} />);

      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/test-page");
    });

    it("does not render actions section when no actions provided", () => {
      render(<Hero title="Title" />);
      // Actions container should not exist
      const section = screen.getByRole("region");
      expect(section.querySelector('[class*="heroActions"]')).not.toBeInTheDocument();
    });

    it("renders multiple actions in order", () => {
      const actions = [
        { key: "first", label: "First Action" },
        { key: "second", label: "Second Action" },
        { key: "third", label: "Third Action" },
      ];
      render(<Hero title="Title" actions={actions} />);

      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(3);
      expect(buttons[0]).toHaveTextContent("First Action");
      expect(buttons[1]).toHaveTextContent("Second Action");
      expect(buttons[2]).toHaveTextContent("Third Action");
    });
  });

  describe("Variants", () => {
    it("applies default variant class", () => {
      render(<Hero title="Title" variant="default" />);
      const section = screen.getByRole("region");
      expect(section.className).toContain("variant-default");
    });

    it("applies centered variant class", () => {
      render(<Hero title="Title" variant="centered" />);
      const section = screen.getByRole("region");
      expect(section.className).toContain("variant-centered");
    });

    it("applies split variant class", () => {
      render(<Hero title="Title" variant="split" />);
      const section = screen.getByRole("region");
      expect(section.className).toContain("variant-split");
    });

    it("applies minimal variant class", () => {
      render(<Hero title="Title" variant="minimal" />);
      const section = screen.getByRole("region");
      expect(section.className).toContain("variant-minimal");
    });
  });

  describe("Backgrounds", () => {
    it("applies light background class", () => {
      render(<Hero title="Title" background="light" />);
      const section = screen.getByRole("region");
      expect(section.className).toContain("background-light");
    });

    it("applies dark background class", () => {
      render(<Hero title="Title" background="dark" />);
      const section = screen.getByRole("region");
      expect(section.className).toContain("background-dark");
    });

    it("applies gradient background class", () => {
      render(<Hero title="Title" background="gradient" />);
      const section = screen.getByRole("region");
      expect(section.className).toContain("background-gradient");
    });

    it("applies image background class", () => {
      render(<Hero title="Title" background="image" />);
      const section = screen.getByRole("region");
      expect(section.className).toContain("background-image");
    });
  });

  describe("Alignment", () => {
    it("applies left align class", () => {
      render(<Hero title="Title" align="left" />);
      const section = screen.getByRole("region");
      expect(section.className).toContain("align-left");
    });

    it("applies center align class", () => {
      render(<Hero title="Title" align="center" />);
      const section = screen.getByRole("region");
      expect(section.className).toContain("align-center");
    });

    it("applies right align class", () => {
      render(<Hero title="Title" align="right" />);
      const section = screen.getByRole("region");
      expect(section.className).toContain("align-right");
    });
  });

  describe("Accessibility", () => {
    it("renders as section with region role", () => {
      render(<Hero title="Test Hero" />);
      const section = screen.getByRole("region");
      expect(section.tagName).toBe("SECTION");
    });

    it("has default aria-label based on title", () => {
      render(<Hero title="My Hero" />);
      const section = screen.getByRole("region");
      expect(section).toHaveAttribute("aria-label", "My Hero hero section");
    });

    it("uses custom aria-label when provided", () => {
      render(<Hero title="Title" ariaLabel="Custom hero region" />);
      const section = screen.getByRole("region");
      expect(section).toHaveAttribute("aria-label", "Custom hero region");
    });

    it("title is properly marked as heading", () => {
      render(<Hero title="Accessible Title" />);
      const heading = screen.getByRole("heading", { name: "Accessible Title" });
      expect(heading).toBeInTheDocument();
    });

    it("image has proper alt text", () => {
      render(
        <Hero
          title="Title"
          imageSrc="/test.jpg"
          imageAlt="Descriptive alt text"
          imageWidth={800}
          imageHeight={400}
        />
      );
      const image = screen.getByAltText("Descriptive alt text");
      expect(image).toBeInTheDocument();
    });

    it("action links are keyboard accessible", () => {
      const actions = [{ key: "link", label: "Learn More", href: "/about" }];
      render(<Hero title="Title" actions={actions} />);

      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/about");
    });
  });

  describe("Custom Styling", () => {
    it("applies custom className", () => {
      render(<Hero title="Title" className="custom-hero-class" />);
      const section = screen.getByRole("region");
      expect(section.className).toContain("custom-hero-class");
    });

    it("preserves built-in classes when custom className provided", () => {
      render(
        <Hero
          title="Title"
          className="custom"
          variant="centered"
          background="dark"
        />
      );
      const section = screen.getByRole("region");
      expect(section.className).toContain("custom");
      expect(section.className).toContain("variant-centered");
      expect(section.className).toContain("background-dark");
    });
  });

  describe("Props Defaults", () => {
    it("uses default props when not specified", () => {
      render(<Hero title="Title" />);
      const section = screen.getByRole("region");

      // Default variant
      expect(section.className).toContain("variant-default");
      // Default background
      expect(section.className).toContain("background-light");
      // Default align
      expect(section.className).toContain("align-left");
    });

    it("titleLevel defaults to 1", () => {
      render(<Hero title="Default Level" />);
      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toBeInTheDocument();
    });
  });

  describe("Complex Scenarios", () => {
    it("renders complete hero with all props", () => {
      const actions = [
        { key: "primary", label: "Get Started", href: "/start" },
        { key: "secondary", label: "Learn More", onClick: vi.fn() },
      ];

      render(
        <Hero
          title="Complete Hero"
          titleLevel={2}
          subtitle="Full Example"
          description="This hero has all possible props configured"
          imageSrc="/hero.jpg"
          imageAlt="Hero image"
          imageWidth={1200}
          imageHeight={600}
          actions={actions}
          variant="split"
          background="gradient"
          align="center"
          maxWidth="xl"
          spacing="spacious"
          className="custom-hero"
          ariaLabel="Complete hero section"
        />
      );

      // Verify all content present
      expect(screen.getByText("Complete Hero")).toBeInTheDocument();
      expect(screen.getByText("Full Example")).toBeInTheDocument();
      expect(
        screen.getByText("This hero has all possible props configured")
      ).toBeInTheDocument();
      expect(screen.getByAltText("Hero image")).toBeInTheDocument();
      expect(screen.getByText("Get Started")).toBeInTheDocument();
      expect(screen.getByText("Learn More")).toBeInTheDocument();

      // Verify classes applied
      const section = screen.getByRole("region");
      expect(section.className).toContain("variant-split");
      expect(section.className).toContain("background-gradient");
      expect(section.className).toContain("align-center");
      expect(section.className).toContain("custom-hero");

      // Verify accessibility
      expect(section).toHaveAttribute("aria-label", "Complete hero section");
    });

    it("handles split layout with image correctly", () => {
      render(
        <Hero
          title="Split Layout"
          subtitle="Image on the side"
          imageSrc="/split.jpg"
          imageAlt="Split image"
          imageWidth={800}
          imageHeight={600}
          variant="split"
        />
      );

      expect(screen.getByText("Split Layout")).toBeInTheDocument();
      expect(screen.getByText("Image on the side")).toBeInTheDocument();
      expect(screen.getByAltText("Split image")).toBeInTheDocument();

      const section = screen.getByRole("region");
      expect(section.className).toContain("variant-split");
    });
  });
});
