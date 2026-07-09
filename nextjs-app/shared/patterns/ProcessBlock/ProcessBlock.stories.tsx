import contract from "./ProcessBlock.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";
import ProcessBlock from "./ProcessBlock";

const meta: Meta<typeof ProcessBlock> = {
  title: "Patterns/ProcessBlock",
  component: ProcessBlock,
  tags: ["stable", "autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-process-block",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
    layout: "fullscreen",
    vitest: {
      skip: true, // Skip Vitest tests for this complex pattern component
    },
  },
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts);
  // composite-slot mapping presets live on the Playground story below.
};

export default meta;
type Story = StoryObj<typeof ProcessBlock>;

// Default UX process phases
const uxDesignPhases = [
  {
    title: "Discover",
    activities: [
      "Stakeholder Workshops",
      "Contextual Inquiry",
      "User Research",
      "User Interviews",
      "Benchmark Analysis",
      "Brand Application and Restrictions",
    ],
  },
  {
    title: "Define",
    activities: [
      "User Personas",
      "Empathy Map",
      "User Journey Mapping",
      "Accessibility",
      "CI/CD process",
      "Information Architecture",
      "Definition of Done",
    ],
  },
  {
    title: "Ideate",
    activities: [
      "User Flows",
      "Component Structures",
      "Accessibility and inclusivity guidelines",
      "Sync with stakeholders",
      "User Research",
      "Wireframes",
      "Prototypes",
    ],
  },
  {
    title: "Design",
    activities: [
      "Reusable Components",
      "Token base",
      "Patterns and templates",
      "Accessibility Reviews",
      "Documentation",
      "Design Reviews",
      "Feedback Loops",
      "Maintenance",
    ],
  },
];

/**
 * Default story showing a complete 4-phase UX design process
 */
export const Default: Story = {
  tags: ["beta-matrix"],
  args: {
    phases: uxDesignPhases,
    sectionTitle: "Process",
    backgroundColor: "light",
    columns: 4,
  },
};

/**
 * Development process with 3 phases
 */
export const DevelopmentProcess: Story = {
  args: {
    phases: [
      {
        title: "Planning",
        activities: [
          "Requirements Gathering",
          "Technical Architecture",
          "Sprint Planning",
          "Risk Assessment",
        ],
      },
      {
        title: "Development",
        activities: [
          "Component Development",
          "Unit Testing",
          "Code Reviews",
          "Integration Testing",
          "Documentation",
        ],
      },
      {
        title: "Deployment",
        activities: [
          "CI/CD Pipeline",
          "Production Deployment",
          "Monitoring & Analytics",
          "Bug Fixes & Maintenance",
        ],
      },
    ],
    sectionTitle: "Development Workflow",
    columns: 3,
    backgroundColor: "white",
  },
};

/**
 * Simplified 2-column layout
 */
export const TwoColumnLayout: Story = {
  args: {
    phases: [
      {
        title: "Research & Planning",
        activities: [
          "User Research",
          "Competitive Analysis",
          "Stakeholder Interviews",
          "Requirements Definition",
        ],
      },
      {
        title: "Design & Delivery",
        activities: [
          "Wireframing",
          "Visual Design",
          "Prototyping",
          "User Testing",
          "Handoff & Documentation",
        ],
      },
    ],
    sectionTitle: "Our Approach",
    columns: 2,
  },
};

/**
 * Process without section title
 */
export const NoTitle: Story = {
  args: {
    phases: uxDesignPhases,
    sectionTitle: "",
    backgroundColor: "transparent",
    columns: 4,
  },
};

/**
 * With descriptive introduction text
 */
export const WithDescription: Story = {
  args: {
    phases: uxDesignPhases,
    sectionTitle: "Our UX Process",
    description:
      "We follow a human-centered design approach that puts users at the heart of every decision. Our iterative process ensures that we deliver solutions that are both beautiful and functional.",
    backgroundColor: "light",
    columns: 4,
  },
};

/**
 * Compact spacing variant
 */
export const CompactSpacing: Story = {
  args: {
    phases: [
      {
        title: "Analyze",
        activities: ["Data Collection", "User Insights", "Problem Definition"],
      },
      { title: "Create", activities: ["Ideation", "Sketching", "Prototyping"] },
      { title: "Test", activities: ["User Testing", "Feedback", "Iteration"] },
      {
        title: "Launch",
        activities: ["Final Review", "Deployment", "Monitoring"],
      },
    ],
    sectionTitle: "Rapid Design Sprint",
    spacing: "compact",
    columns: 4,
  },
};

/**
 * Wide layout with full width
 */
export const WideLayout: Story = {
  args: {
    phases: uxDesignPhases,
    sectionTitle: "Comprehensive Process",
    maxWidth: "xl",
    backgroundColor: "white",
    columns: 4,
  },
};

/**
 * Article semantic variant
 */
export const ArticleVariant: Story = {
  args: {
    phases: uxDesignPhases,
    sectionTitle: "Methodology",
    as: "article",
    ariaLabel: "UX Design Methodology Overview",
    columns: 4,
  },
};

/**
 * Agile sprint process
 */
export const AgileSprint: Story = {
  args: {
    phases: [
      {
        title: "Sprint Planning",
        activities: [
          "Backlog Refinement",
          "Story Estimation",
          "Sprint Goal Definition",
          "Capacity Planning",
        ],
      },
      {
        title: "Sprint Execution",
        activities: [
          "Daily Standups",
          "Development Work",
          "Continuous Testing",
          "Pair Programming",
          "Code Reviews",
        ],
      },
      {
        title: "Sprint Review",
        activities: [
          "Demo to Stakeholders",
          "Feedback Collection",
          "Acceptance Testing",
        ],
      },
      {
        title: "Sprint Retrospective",
        activities: [
          "Team Reflection",
          "Process Improvements",
          "Action Items",
          "Celebration",
        ],
      },
    ],
    sectionTitle: "Agile Sprint Cycle",
    description:
      "Our 2-week sprint cycle ensures rapid delivery and continuous improvement.",
    backgroundColor: "light",
    columns: 4,
  },
};

/**
 * Minimal process with few activities
 */
export const MinimalProcess: Story = {
  args: {
    phases: [
      { title: "Research", activities: ["User Interviews", "Data Analysis"] },
      { title: "Design", activities: ["Wireframes", "Visual Design"] },
      { title: "Test", activities: ["User Testing", "Iteration"] },
    ],
    sectionTitle: "Lean UX Process",
    columns: 3,
    backgroundColor: "white",
  },
};

/**
 * Content strategy process
 */
export const ContentStrategy: Story = {
  args: {
    phases: [
      {
        title: "Audit & Analysis",
        activities: [
          "Content Inventory",
          "Gap Analysis",
          "Competitor Review",
          "User Needs Assessment",
        ],
      },
      {
        title: "Strategy Development",
        activities: [
          "Content Guidelines",
          "Tone & Voice",
          "Information Architecture",
          "SEO Strategy",
        ],
      },
      {
        title: "Content Creation",
        activities: [
          "Writing & Editing",
          "Visual Assets",
          "Localization",
          "Quality Assurance",
        ],
      },
      {
        title: "Distribution & Optimization",
        activities: [
          "Publishing",
          "Performance Monitoring",
          "A/B Testing",
          "Continuous Improvement",
        ],
      },
    ],
    sectionTitle: "Content Strategy Framework",
    backgroundColor: "transparent",
    columns: 4,
  },
};

export const Playground: Story = {
  tags: ["beta-matrix"],
  argTypes: {
    phases: {
      control: { type: "select" },
      options: ["ux", "twoPhases"],
      mapping: { ux: uxDesignPhases, twoPhases: uxDesignPhases.slice(0, 2) },
      description:
        "Process phases (title + activities). Pick a preset here; compose your own in code.",
      table: { category: "Content", type: { summary: "ProcessPhase[]" } },
    },
    description: {
      control: { type: "select" },
      options: ["none", "intro"],
      mapping: {
        none: undefined,
        intro: "How we run engagements from research to launch.",
      },
      description:
        "Optional lead copy under the section title. Pick a preset here; compose your own in code.",
      table: { category: "Content", type: { summary: "React.ReactNode" } },
    },
  },
  args: {
    ...Default.args,
    phases: "ux" as never,
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
