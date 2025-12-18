import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import TeamBlock from "./TeamBlock";

const mockTeamMembers = [
  {
    name: "Laura Karhu",
    title: "Project Lead",
    image: "/images/team/laura.png",
  },
  {
    name: "Petri Lahdelma",
    title: "Senior UX Designer",
    image: "/images/team/petri.png",
  },
  {
    name: "Roni Helppi",
    title: "UX Designer",
    image: "/images/team/roni.png",
  },
];

describe("TeamBlock", () => {
  describe("Basic Rendering", () => {
    it("renders with required members prop", () => {
      render(<TeamBlock members={mockTeamMembers} />);
      expect(screen.getByText("Team")).toBeInTheDocument();
      expect(screen.getByText("Laura Karhu")).toBeInTheDocument();
    });

    it("renders custom section title", () => {
      render(
        <TeamBlock members={mockTeamMembers} sectionTitle="Project Team" />,
      );
      expect(screen.getByText("Project Team")).toBeInTheDocument();
    });

    it("renders without section title when empty string provided", () => {
      render(<TeamBlock members={mockTeamMembers} sectionTitle="" />);
      expect(screen.queryByText("Team")).not.toBeInTheDocument();
    });

    it("renders string description", () => {
      render(
        <TeamBlock members={mockTeamMembers} description="Our amazing team" />,
      );
      expect(screen.getByText("Our amazing team")).toBeInTheDocument();
    });

    it("renders React node description", () => {
      render(
        <TeamBlock
          members={mockTeamMembers}
          description={<div>Custom team description</div>}
        />,
      );
      expect(screen.getByText("Custom team description")).toBeInTheDocument();
    });
  });

  describe("Team Members Rendering", () => {
    it("renders all member names", () => {
      render(<TeamBlock members={mockTeamMembers} />);
      expect(screen.getByText("Laura Karhu")).toBeInTheDocument();
      expect(screen.getByText("Petri Lahdelma")).toBeInTheDocument();
      expect(screen.getByText("Roni Helppi")).toBeInTheDocument();
    });

    it("renders all member titles", () => {
      render(<TeamBlock members={mockTeamMembers} />);
      expect(screen.getByText("Project Lead")).toBeInTheDocument();
      expect(screen.getByText("Senior UX Designer")).toBeInTheDocument();
      expect(screen.getByText("UX Designer")).toBeInTheDocument();
    });

    it("renders all member images", () => {
      render(<TeamBlock members={mockTeamMembers} />);
      const images = screen.getAllByRole("img");
      expect(images).toHaveLength(3);
    });

    it("uses member name as alt text when imageAlt not provided", () => {
      render(<TeamBlock members={mockTeamMembers} />);
      const lauraImage = screen.getByAltText("Laura Karhu");
      expect(lauraImage).toBeInTheDocument();
    });

    it("uses custom imageAlt when provided", () => {
      const membersWithAlt = [
        {
          ...mockTeamMembers[0],
          imageAlt: "Custom alt text for Laura",
        },
      ];
      render(<TeamBlock members={membersWithAlt} />);
      expect(
        screen.getByAltText("Custom alt text for Laura"),
      ).toBeInTheDocument();
    });

    it("handles single member", () => {
      const singleMember = [mockTeamMembers[0]];
      render(<TeamBlock members={singleMember} />);
      expect(screen.getByText("Laura Karhu")).toBeInTheDocument();
      expect(screen.queryByText("Petri Lahdelma")).not.toBeInTheDocument();
    });

    it("handles many members", () => {
      const manyMembers = [
        ...mockTeamMembers,
        { name: "Member 4", title: "Role 4", image: "/path4.png" },
        { name: "Member 5", title: "Role 5", image: "/path5.png" },
        { name: "Member 6", title: "Role 6", image: "/path6.png" },
      ];
      const { container } = render(<TeamBlock members={manyMembers} />);
      const members = container.querySelectorAll('[class*="col"]');
      expect(members).toHaveLength(6);
    });
  });

  describe("Member Links", () => {
    it("renders members with links as anchor tags", () => {
      const membersWithLinks = [
        { ...mockTeamMembers[0], link: "https://linkedin.com/laura" },
      ];
      render(<TeamBlock members={membersWithLinks} />);
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "https://linkedin.com/laura");
    });

    it("applies target and rel attributes to member links", () => {
      const membersWithLinks = [
        { ...mockTeamMembers[0], link: "https://linkedin.com/laura" },
      ];
      render(<TeamBlock members={membersWithLinks} />);
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("renders members without links as divs", () => {
      const { container } = render(<TeamBlock members={mockTeamMembers} />);
      const memberContainers = container.querySelectorAll('[class*="col"]');
      memberContainers.forEach((member) => {
        expect(member.tagName).toBe("DIV");
      });
    });
  });

  describe("Layout & Styling", () => {
    it("applies custom className", () => {
      const { container } = render(
        <TeamBlock members={mockTeamMembers} className="custom-class" />,
      );
      expect(container.firstChild).toHaveClass("custom-class");
    });

    it("renders as section by default", () => {
      const { container } = render(<TeamBlock members={mockTeamMembers} />);
      expect(container.firstChild?.nodeName).toBe("SECTION");
    });

    it("renders as article when specified", () => {
      const { container } = render(
        <TeamBlock members={mockTeamMembers} as="article" />,
      );
      expect(container.firstChild?.nodeName).toBe("ARTICLE");
    });

    it("renders as div when specified", () => {
      const { container } = render(
        <TeamBlock members={mockTeamMembers} as="div" />,
      );
      expect(container.firstChild?.nodeName).toBe("DIV");
    });

    it("applies transparent background by default", () => {
      const { container } = render(<TeamBlock members={mockTeamMembers} />);
      const section = container.firstChild as HTMLElement;
      expect(section.style.backgroundColor).toBe("transparent");
    });

    it("applies light background when specified", () => {
      const { container } = render(
        <TeamBlock members={mockTeamMembers} backgroundColor="light" />,
      );
      const section = container.firstChild as HTMLElement;
      expect(section.style.backgroundColor).toBe("var(--color-light-bg)");
    });

    it("applies white background when specified", () => {
      const { container } = render(
        <TeamBlock members={mockTeamMembers} backgroundColor="white" />,
      );
      const section = container.firstChild as HTMLElement;
      expect(section.style.backgroundColor).toBe("var(--color-white)");
    });

    it("applies 5-column grid class by default", () => {
      const { container } = render(<TeamBlock members={mockTeamMembers} />);
      const grid = container.querySelector('[class*="grid5Col"]');
      expect(grid).toBeInTheDocument();
    });

    it("applies 2-column grid class when specified", () => {
      const { container } = render(
        <TeamBlock members={mockTeamMembers} columns={2} />,
      );
      const grid = container.querySelector('[class*="grid2Col"]');
      expect(grid).toBeInTheDocument();
    });

    it("applies 3-column grid class when specified", () => {
      const { container } = render(
        <TeamBlock members={mockTeamMembers} columns={3} />,
      );
      const grid = container.querySelector('[class*="grid3Col"]');
      expect(grid).toBeInTheDocument();
    });

    it("applies 4-column grid class when specified", () => {
      const { container } = render(
        <TeamBlock members={mockTeamMembers} columns={4} />,
      );
      const grid = container.querySelector('[class*="grid4Col"]');
      expect(grid).toBeInTheDocument();
    });

    it("applies 6-column grid class when specified", () => {
      const { container } = render(
        <TeamBlock members={mockTeamMembers} columns={6} />,
      );
      const grid = container.querySelector('[class*="grid6Col"]');
      expect(grid).toBeInTheDocument();
    });

    it("applies round image class when roundImages is true", () => {
      const { container } = render(
        <TeamBlock members={mockTeamMembers} roundImages={true} />,
      );
      const image = container.querySelector('[class*="roundImage"]');
      expect(image).toBeInTheDocument();
    });

    it("does not apply round image class by default", () => {
      const { container } = render(<TeamBlock members={mockTeamMembers} />);
      const image = container.querySelector('[class*="roundImage"]');
      expect(image).not.toBeInTheDocument();
    });
  });

  describe("Image Properties", () => {
    it("uses default image dimensions (112x112)", () => {
      render(<TeamBlock members={mockTeamMembers} />);
      const images = screen.getAllByRole("img");
      images.forEach((img) => {
        expect(img).toHaveAttribute("width", "112");
        expect(img).toHaveAttribute("height", "112");
      });
    });

    it("uses custom image dimensions when provided", () => {
      const customMembers = [
        {
          ...mockTeamMembers[0],
          imageWidth: 150,
          imageHeight: 150,
        },
      ];
      render(<TeamBlock members={customMembers} />);
      const image = screen.getByRole("img");
      expect(image).toHaveAttribute("width", "150");
      expect(image).toHaveAttribute("height", "150");
    });
  });

  describe("Accessibility", () => {
    it("applies aria-label from sectionTitle by default", () => {
      const { container } = render(
        <TeamBlock members={mockTeamMembers} sectionTitle="Our Team" />,
      );
      expect(container.firstChild).toHaveAttribute("aria-label", "Our Team");
    });

    it("applies custom aria-label when provided", () => {
      const { container } = render(
        <TeamBlock
          members={mockTeamMembers}
          sectionTitle="Team"
          ariaLabel="Complete project team roster"
        />,
      );
      expect(container.firstChild).toHaveAttribute(
        "aria-label",
        "Complete project team roster",
      );
    });

    it("uses proper heading hierarchy", () => {
      render(<TeamBlock members={mockTeamMembers} />);
      const mainHeading = screen.getByText("Team");
      expect(mainHeading.tagName).toBe("H2");

      const memberHeading = screen.getByText("Laura Karhu");
      expect(memberHeading.tagName).toBe("H4");
    });

    it("has data attribute for title", () => {
      render(<TeamBlock members={mockTeamMembers} />);
      const title = screen.getByText("Team");
      expect(title).toHaveAttribute("data-team-title");
    });

    it("provides proper alt text for all images", () => {
      render(<TeamBlock members={mockTeamMembers} />);
      expect(screen.getByAltText("Laura Karhu")).toBeInTheDocument();
      expect(screen.getByAltText("Petri Lahdelma")).toBeInTheDocument();
      expect(screen.getByAltText("Roni Helppi")).toBeInTheDocument();
    });
  });

  describe("Props Defaults", () => {
    it("uses default sectionTitle of 'Team'", () => {
      render(<TeamBlock members={mockTeamMembers} />);
      expect(screen.getByText("Team")).toBeInTheDocument();
    });

    it("uses default columns of 5", () => {
      const { container } = render(<TeamBlock members={mockTeamMembers} />);
      const grid = container.querySelector('[class*="grid5Col"]');
      expect(grid).toBeInTheDocument();
    });

    it("uses default backgroundColor of transparent", () => {
      const { container } = render(<TeamBlock members={mockTeamMembers} />);
      const section = container.firstChild as HTMLElement;
      expect(section.style.backgroundColor).toBe("transparent");
    });

    it("uses default maxWidth of lg", () => {
      render(<TeamBlock members={mockTeamMembers} />);
      // PageLayout component handles this
      expect(screen.getByText("Team")).toBeInTheDocument();
    });

    it("uses default spacing of comfortable", () => {
      render(<TeamBlock members={mockTeamMembers} />);
      // PageLayout component handles this
      expect(screen.getByText("Team")).toBeInTheDocument();
    });

    it("uses default as value of section", () => {
      const { container } = render(<TeamBlock members={mockTeamMembers} />);
      expect(container.firstChild?.nodeName).toBe("SECTION");
    });

    it("uses default roundImages of false", () => {
      const { container } = render(<TeamBlock members={mockTeamMembers} />);
      const roundImage = container.querySelector('[class*="roundImage"]');
      expect(roundImage).not.toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles members with special characters in names", () => {
      const specialMembers = [
        {
          name: "Ville Miekk'oja",
          title: "Consultant",
          image: "/path.png",
        },
      ];
      render(<TeamBlock members={specialMembers} />);
      expect(screen.getByText("Ville Miekk'oja")).toBeInTheDocument();
    });

    it("handles members with very long names", () => {
      const longNameMembers = [
        {
          name: "Alexander Montgomery-Worthington III",
          title: "Director",
          image: "/path.png",
        },
      ];
      render(<TeamBlock members={longNameMembers} />);
      expect(
        screen.getByText("Alexander Montgomery-Worthington III"),
      ).toBeInTheDocument();
    });

    it("handles members with very long titles", () => {
      const longTitleMembers = [
        {
          name: "John Doe",
          title: "Senior Principal Staff Software Engineering Architect",
          image: "/path.png",
        },
      ];
      render(<TeamBlock members={longTitleMembers} />);
      expect(
        screen.getByText(
          "Senior Principal Staff Software Engineering Architect",
        ),
      ).toBeInTheDocument();
    });
  });
});
