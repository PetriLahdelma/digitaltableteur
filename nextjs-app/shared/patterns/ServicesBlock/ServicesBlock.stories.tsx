import contract from "./ServicesBlock.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import ServicesBlock from "./ServicesBlock";
import Text from "@dt/Text";
import {
  SiFigma,
  SiSketch,
  SiSlack,
  SiReact,
  SiTypescript,
  SiGithub,
  SiVercel,
} from "react-icons/si";
import { AdobeToolIcon } from "../../components/pages/Work/AdobeToolIcon";

/**
 * ServicesBlock is a reusable pattern component for displaying project metadata,
 * services, tools, and overview content. Commonly used in case studies and work pages.
 *
 * Features:
 * - Responsive two-column layout (stacks on mobile)
 * - Flexible metadata sections (services, duration, tools)
 * - Rich overview content support
 * - Design token integration
 * - Accessible icon labels
 */
const meta: Meta<typeof ServicesBlock> = {
  title: "Patterns/ServicesBlock",
  component: ServicesBlock,
  tags: ["beta", "autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-services-block",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
    layout: "fullscreen",
    vitest: {
      skip: true, // Skip Vitest tests for this complex pattern component
    },
  },
  argTypes: {
    services: {
      description: "List of services provided in the project",
      control: false,
      table: { disable: true },
    },
    duration: { description: "Project timeline or duration", control: "text" },
    tools: {
      description: "Array of tool icons with labels",
      control: false,
      table: { disable: true },
    },
    overview: {
      description: "Overview content (string or React node)",
      control: false,
      table: { disable: true },
    },
    overviewTitle: {
      description: "Title for overview section",
      control: "text",
      table: { defaultValue: { summary: "Overview" } },
    },
    servicesTitle: {
      description: "Title for services section",
      control: "text",
      table: { defaultValue: { summary: "Services" } },
    },
    durationTitle: {
      description: "Title for duration section",
      control: "text",
      table: { defaultValue: { summary: "Duration" } },
    },
    toolsTitle: {
      description: "Title for tools section",
      control: "text",
      table: { defaultValue: { summary: "Tools" } },
    },
    maxWidth: {
      description: "Maximum content width",
      control: "select",
      options: ["sm", "md", "lg", "xl", "full"],
      table: { defaultValue: { summary: "md" } },
    },
    spacing: {
      description: "Vertical spacing preset",
      control: "select",
      options: ["compact", "default", "comfortable", "spacious"],
      table: { defaultValue: { summary: "comfortable" } },
    },
    as: {
      description: "Semantic HTML element",
      control: false,
      table: { disable: true },
    },
    className: {
      description: "Additional CSS class",
      control: false,
      table: { disable: true },
    },
  },
};

export default meta;

type Story = StoryObj<typeof ServicesBlock>;

/**
 * Complete example with all sections populated.
 * Typical usage for a comprehensive case study.
 */
export const Default: Story = {
  tags: ["beta-matrix"],
  args: {
    services: [
      { label: "UX Design" },
      { label: "UI Design" },
      { label: "Service Design" },
      { label: "Design System" },
      { label: "Frontend Development" },
      { label: "Documentation" },
    ],
    duration: "January 2020–March 2022",
    tools: [
      { key: "slack", icon: <SiSlack size={24} />, ariaLabel: "Slack" },
      { key: "figma", icon: <SiFigma size={24} />, ariaLabel: "Figma" },
      { key: "sketch", icon: <SiSketch size={24} />, ariaLabel: "Sketch" },
      {
        key: "illustrator",
        icon: <AdobeToolIcon tool="illustrator" />,
        ariaLabel: "Adobe Illustrator",
      },
      {
        key: "photoshop",
        icon: <AdobeToolIcon tool="photoshop" />,
        ariaLabel: "Adobe Photoshop",
      },
    ],
    overview: (
      <Text size="s">
        <strong>The city of Helsinki</strong> offers hundreds of disparate
        digital services, from daycare applications to cultural services.
        Without a unified design system, each service risked looking and
        functioning differently, leading to user confusion.
        <br />
        <br />
        <strong>The goal:</strong> In a multivendor environment, provide a
        shared design foundation so that all services share a consistent visual
        identity, accessible UI, and predictable user experience.
      </Text>
    ),
  },
};

/**
 * Minimal example with only overview content.
 * Useful for simpler project summaries.
 */
export const MinimalOverview: Story = {
  args: {
    overview:
      "A focused design sprint to reimagine the user onboarding experience, resulting in a 40% increase in completion rates.",
  },
};

/**
 * Tech-focused project with development tools.
 */
export const DevelopmentProject: Story = {
  args: {
    services: [
      { label: "Frontend Development" },
      { label: "API Integration" },
      { label: "Testing & QA" },
      { label: "Performance Optimization" },
    ],
    duration: "June 2023–Present",
    tools: [
      { key: "react", icon: <SiReact size={24} />, ariaLabel: "React" },
      {
        key: "typescript",
        icon: <SiTypescript size={24} />,
        ariaLabel: "TypeScript",
      },
      { key: "github", icon: <SiGithub size={24} />, ariaLabel: "GitHub" },
      { key: "vercel", icon: <SiVercel size={24} />, ariaLabel: "Vercel" },
    ],
    overview:
      "Built a high-performance web application using modern React and TypeScript, achieving 95+ Lighthouse scores across all metrics.",
  },
};

/**
 * Design-only project without development tools.
 */
export const DesignOnlyProject: Story = {
  args: {
    services: [
      { label: "Brand Identity" },
      { label: "UI Design" },
      { label: "Prototyping" },
      { label: "User Testing" },
    ],
    duration: "March 2024–May 2024",
    tools: [
      { key: "figma", icon: <SiFigma size={24} />, ariaLabel: "Figma" },
      {
        key: "illustrator",
        icon: <AdobeToolIcon tool="illustrator" />,
        ariaLabel: "Adobe Illustrator",
      },
    ],
    overview: (
      <Text size="s">
        Created a comprehensive brand identity system including logo, color
        palette, typography guidelines, and UI component library for a
        sustainable fashion startup.
      </Text>
    ),
  },
};

/**
 * Project with custom section titles (multilingual support).
 */
export const CustomTitles: Story = {
  args: {
    services: [
      { label: "Käyttöliittymäsuunnittelu" },
      { label: "Käytettävyystestaus" },
      { label: "Prototyypit" },
    ],
    duration: "Tammikuu–Maaliskuu 2024",
    tools: [{ key: "figma", icon: <SiFigma size={24} />, ariaLabel: "Figma" }],
    overview:
      "Suunnittelimme käyttäjäystävällisen mobiilisovelluksen, joka helpottaa julkisen liikenteen käyttöä.",
    servicesTitle: "Palvelut",
    durationTitle: "Kesto",
    toolsTitle: "Työkalut",
    overviewTitle: "Yleiskatsaus",
  },
};

/**
 * Short-term sprint project.
 */
export const SprintProject: Story = {
  args: {
    services: [
      { label: "Workshop Facilitation" },
      { label: "Rapid Prototyping" },
      { label: "Usability Testing" },
    ],
    duration: "2-week sprint (October 2024)",
    tools: [
      { key: "figma", icon: <SiFigma size={24} />, ariaLabel: "Figma" },
      { key: "slack", icon: <SiSlack size={24} />, ariaLabel: "Slack" },
    ],
    overview:
      "Intensive design sprint to validate a new product concept, resulting in a tested prototype and clear go-to-market strategy.",
  },
};

/**
 * Project without tools section.
 */
export const NoTools: Story = {
  args: {
    services: [
      { label: "Strategic Consulting" },
      { label: "User Research" },
      { label: "Service Design" },
    ],
    duration: "Q1 2024",
    overview:
      "Conducted comprehensive user research and service design workshops to identify pain points and opportunities in the customer journey.",
  },
};

/**
 * Wide layout for detailed case studies.
 */
export const WideLayout: Story = {
  args: {
    maxWidth: "lg",
    services: [
      { label: "UX Research" },
      { label: "Information Architecture" },
      { label: "Interaction Design" },
      { label: "Visual Design" },
      { label: "Accessibility Audit" },
      { label: "Frontend Development" },
    ],
    duration: "January 2023–December 2023",
    tools: [
      { key: "figma", icon: <SiFigma size={24} />, ariaLabel: "Figma" },
      { key: "react", icon: <SiReact size={24} />, ariaLabel: "React" },
      { key: "github", icon: <SiGithub size={24} />, ariaLabel: "GitHub" },
    ],
    overview: (
      <Text size="s">
        Led a comprehensive redesign of an enterprise SaaS platform serving
        50,000+ users. The project involved extensive user research, information
        architecture restructuring, and implementation of a new design system.
        <br />
        <br />
        Key outcomes included a 60% reduction in support tickets, 45%
        improvement in task completion rates, and WCAG AA compliance across all
        features.
      </Text>
    ),
  },
};

/**
 * Compact spacing for dense layouts.
 */
export const CompactSpacing: Story = {
  args: {
    spacing: "compact",
    services: [{ label: "UI Design" }, { label: "Prototyping" }],
    duration: "1 week",
    tools: [{ key: "figma", icon: <SiFigma size={24} />, ariaLabel: "Figma" }],
    overview: "Quick UI refresh for a mobile app landing page.",
  },
};

/**
 * Rich overview content with multiple paragraphs and formatting.
 */
export const RichOverview: Story = {
  args: {
    services: [
      { label: "UX Design" },
      { label: "UI Design" },
      { label: "Design System" },
    ],
    duration: "March 2024–August 2024",
    tools: [
      { key: "figma", icon: <SiFigma size={24} />, ariaLabel: "Figma" },
      { key: "react", icon: <SiReact size={24} />, ariaLabel: "React" },
    ],
    overview: (
      <>
        <Text size="s">
          <strong>The Challenge:</strong> A growing e-commerce platform needed
          to scale its design language across web, mobile, and native apps while
          maintaining consistency and accessibility standards.
        </Text>
        <br />
        <Text size="s">
          <strong>Our Approach:</strong> We conducted a comprehensive audit of
          existing patterns, interviewed stakeholders across product teams, and
          built a modular design system with reusable components.
        </Text>
        <br />
        <Text size="s">
          <strong>The Result:</strong> Reduced design-to-development time by
          50%, improved cross-platform consistency, and achieved WCAG AAA
          compliance for core user flows.
        </Text>
      </>
    ),
  },
};

/**
 * Article variant for blog-style content.
 */
export const ArticleVariant: Story = {
  args: {
    as: "article",
    services: [{ label: "Content Strategy" }, { label: "Editorial Design" }],
    duration: "Ongoing since 2023",
    overview:
      "Managing content strategy and editorial design for a technology publication with 100,000+ monthly readers.",
    ariaLabel: "Project details: Editorial design case study",
  },
};

export const Playground = Default;
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
