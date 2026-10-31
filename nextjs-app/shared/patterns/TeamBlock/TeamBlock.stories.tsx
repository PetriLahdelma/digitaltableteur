import contract from "./TeamBlock.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import TeamBlock from "./TeamBlock";
import Text from "@dt/Text";

const meta: Meta<typeof TeamBlock> = {
  title: "Patterns/TeamBlock",
  component: TeamBlock,
  tags: ["stable", "autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-team-block",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
    layout: "fullscreen",
    vitest: {
      // Skip Vitest tests for this complex pattern component
      skip: true,
    },
  },
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts);
  // composite-slot mapping presets live on the Playground story below.
};

export default meta;
type Story = StoryObj<typeof TeamBlock>;

// Mock team members for Helsinki Design System project
const helsinkiTeam = [
  {
    name: "Laura Karhu",
    title: "Project Lead (PM/PO)",
    image: "/images/portfolio/helsinki-design-system/team/laura.png",
  },
  {
    name: "Petri Lahdelma",
    title: "Senior UX Designer",
    image: "/images/portfolio/helsinki-design-system/team/petri.png",
  },
  {
    name: "Roni Helppi",
    title: "UX Designer",
    image: "/images/portfolio/helsinki-design-system/team/roni.png",
  },
  {
    name: "Mika Nevalainen",
    title: "Senior Software Developer",
    image: "/images/portfolio/helsinki-design-system/team/mika.png",
  },
  {
    name: "Ville Miekk'oja",
    title: "Freelance Consultant",
    image: "/images/portfolio/helsinki-design-system/team/ville.png",
  },
];

// Smaller team example
const smallTeam = [
  {
    name: "Sarah Johnson",
    title: "Product Designer",
  },
  {
    name: "Michael Chen",
    title: "Frontend Developer",
  },
  {
    name: "Emma Davis",
    title: "UX Researcher",
  },
];

// Large team example
const largeTeam = [
  { name: "Alex Rivera", title: "Creative Director" },
  { name: "Jordan Lee", title: "Lead Designer" },
  { name: "Taylor Brooks", title: "Senior Developer" },
  { name: "Casey Morgan", title: "UX Designer" },
  { name: "Jamie Park", title: "Frontend Engineer" },
  { name: "Riley Chen", title: "Product Manager" },
  { name: "Avery Johnson", title: "UI Designer" },
  { name: "Morgan Davis", title: "Backend Developer" },
];

/**
 * Default story showing a 5-person team (Helsinki Design System)
 */
export const Default: Story = {
  tags: ["beta-matrix"],
  args: {
    members: smallTeam,
    sectionTitle: "Team",
    columns: 5,
    backgroundColor: "transparent",
  },
};

/**
 * Small team with 3 members in 3-column layout
 */
export const SmallTeam: Story = {
  args: {
    members: smallTeam,
    sectionTitle: "Project Team",
    columns: 3,
    backgroundColor: "white",
  },
};

/**
 * Large team with 8 members in 4-column layout
 */
export const LargeTeam: Story = {
  args: {
    members: largeTeam,
    sectionTitle: "Our Team",
    columns: 4,
    backgroundColor: "light",
  },
};

/**
 * Team displayed in 2-column layout
 */
export const TwoColumnLayout: Story = {
  args: {
    members: smallTeam,
    sectionTitle: "Leadership Team",
    columns: 2,
    backgroundColor: "white",
  },
};

/**
 * Team displayed in 6-column layout
 */
export const SixColumnLayout: Story = {
  args: {
    members: largeTeam.slice(0, 6),
    sectionTitle: "Core Team",
    columns: 6,
    backgroundColor: "transparent",
  },
};

/**
 * Real portraits from the Helsinki Design System case study, as avatars
 */
export const WithPhotos: Story = {
  args: {
    members: helsinkiTeam,
    sectionTitle: "Team",
    columns: 5,
    backgroundColor: "light",
  },
};

/**
 * Team with description text
 */
export const WithDescription: Story = {
  args: {
    members: smallTeam,
    sectionTitle: "Meet Our Team",
    description:
      "A multidisciplinary team of designers, developers, and strategists working together to create exceptional digital experiences.",
    columns: 5,
    backgroundColor: "white",
  },
};

/**
 * Team without section title
 */
export const NoTitle: Story = {
  args: {
    members: smallTeam,
    sectionTitle: "",
    columns: 3,
    backgroundColor: "transparent",
  },
};

/**
 * Compact spacing variant
 */
export const CompactSpacing: Story = {
  args: {
    members: smallTeam,
    sectionTitle: "Team",
    columns: 5,
    spacing: "compact",
    backgroundColor: "light",
  },
};

/**
 * Wide layout with full width
 */
export const WideLayout: Story = {
  args: {
    members: largeTeam,
    sectionTitle: "Extended Team",
    columns: 4,
    maxWidth: "xl",
    backgroundColor: "white",
  },
};

/**
 * Team members with clickable links
 */
export const WithLinks: Story = {
  args: {
    members: [
      {
        name: "Sarah Johnson",
        title: "Product Designer",
        link: "https://linkedin.com",
      },
      {
        name: "Michael Chen",
        title: "Frontend Developer",
        link: "https://linkedin.com",
      },
      {
        name: "Emma Davis",
        title: "UX Researcher",
        link: "https://linkedin.com",
      },
    ],
    sectionTitle: "Connect With Our Team",
    columns: 3,
    backgroundColor: "light",
  },
};

/**
 * Article semantic variant
 */
export const ArticleVariant: Story = {
  args: {
    members: smallTeam,
    sectionTitle: "Project Contributors",
    as: "article",
    ariaLabel: "List of project contributors and their roles",
    columns: 5,
    backgroundColor: "white",
  },
};

/**
 * Design team example
 */
export const DesignTeam: Story = {
  args: {
    members: [
      { name: "Alex Rivera", title: "Design Director" },
      {
        name: "Jordan Lee",
        title: "Lead Product Designer",
      },
      { name: "Taylor Morgan", title: "UI/UX Designer" },
      { name: "Casey Park", title: "Visual Designer" },
    ],
    sectionTitle: "Design Team",
    description: "Our creative minds shaping exceptional user experiences.",
    columns: 4,
    backgroundColor: "light",
  },
};

/**
 * Development team example
 */
export const DevelopmentTeam: Story = {
  args: {
    members: [
      { name: "Jamie Chen", title: "Tech Lead" },
      {
        name: "Riley Johnson",
        title: "Senior Frontend Engineer",
      },
      { name: "Avery Davis", title: "Backend Developer" },
      { name: "Morgan Lee", title: "DevOps Engineer" },
      { name: "Dakota Smith", title: "QA Engineer" },
    ],
    sectionTitle: "Development Team",
    columns: 5,
    backgroundColor: "white",
  },
};

/**
 * Minimal duo team
 */
export const MinimalTeam: Story = {
  args: {
    members: [
      {
        name: "Sarah Williams",
        title: "Founder & Designer",
      },
      {
        name: "John Smith",
        title: "Co-founder & Developer",
      },
    ],
    sectionTitle: "Founders",
    columns: 2,
    backgroundColor: "transparent",
  },
};

export const Playground: Story = {
  tags: ["beta-matrix"],
  argTypes: {
    members: {
      control: { type: "select" },
      options: ["small", "large"],
      mapping: { small: smallTeam, large: largeTeam },
      description:
        "Team members (name, role, image). Pick a preset here; compose your own in code.",
      table: { category: "Content", type: { summary: "TeamMember[]" } },
    },
    description: {
      control: { type: "select" },
      options: ["none", "intro"],
      mapping: {
        none: undefined,
        intro: <Text size="s">The people behind the system.</Text>,
      },
      description:
        "Optional lead copy under the section title. Pick a preset here; compose your own in code.",
      table: { category: "Content", type: { summary: "React.ReactNode" } },
    },
  },
  args: {
    ...Default.args,
    members: "small" as never,
    description: "intro" as never,
  },
};
export const Example = {
  tags: ["beta-matrix"],
  parameters: { controls: { disable: true } },
  ...Default,
};
export const ForcedColors = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  ...Default,
};
