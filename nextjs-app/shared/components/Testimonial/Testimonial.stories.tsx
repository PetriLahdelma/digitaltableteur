import contract from "./Testimonial.contract.json";
import React from "react";
import Testimonial from "@dt/Testimonial";
import Icon from "@dt/Icon";
import ComplianceCard from "@dt/ComplianceCard";
import type { ComplianceRule } from "@dt/ComplianceCard";
import type { Meta, StoryFn } from "@storybook/react-vite";

const testimonialComplianceRules: ComplianceRule[] = [
  {
    id: "file-structure",
    rule: "Complete file structure",
    status: "pass",
    details: "All 5 files present",
  },
  {
    id: "typescript-strict",
    rule: "TypeScript strict",
    status: "pass",
    details: "Proper typing with TestimonialProps",
  },
  {
    id: "translation-support",
    rule: "Translation support",
    status: "pass",
    details: "Content passed as props",
  },
  {
    id: "css-modules",
    rule: "CSS Modules",
    status: "pass",
    details: "No inline styles",
  },
  {
    id: "design-tokens",
    rule: "Design tokens",
    status: "pass",
    details: "Replaced --primary-body-font with var(--font-text)",
  },
  {
    id: "logical-properties",
    rule: "Logical properties",
    status: "pass",
    details: "Uses gap for layout",
  },
  {
    id: "theme-support",
    rule: "Theme support",
    status: "pass",
    details: "Dark theme support with custom properties",
  },
  {
    id: "composition",
    rule: "Component composition",
    status: "pass",
    details: "Optional avatar, LinkedIn link",
  },
  {
    id: "accessibility",
    rule: "Accessibility",
    status: "pass",
    details: "Semantic markup, link labels",
  },
  {
    id: "storybook-stories",
    rule: "Storybook stories",
    status: "pass",
    details: "Multiple variants with ComplianceCard",
  },
  { id: "tests", rule: "Tests", status: "pass", details: "Test file exists" },
];

export default {
  argTypes: {
      as: { table: { disable: true } },
      asChild: { table: { disable: true } },
      avatarUrl: { control: "text", description: "Avatar image URL (optional)", table: { category: "Content" } },
      children: { table: { disable: true } },
      className: { control: "text", description: "Additional CSS classes", table: { category: "Advanced" } },
      company: { control: "text", description: "Company name", table: { category: "Content" } },
      id: { table: { disable: true } },
      linkedinUrl: { control: "text", description: "LinkedIn URL (optional)", table: { category: "Content" } },
      name: { control: "text", description: "Name of the person giving the testimonial", table: { category: "Content" } },
      quote: { control: "text", description: "The testimonial quote text", table: { category: "Content" } },
      ref: { table: { disable: true } },
      style: { table: { disable: true } },
      title: { control: "text", description: "Title/position of the person", table: { category: "Content" } }
},
  title: "Site/Testimonial",
  component: Testimonial,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-testimonial",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
    layout: "padded",
  },
} as Meta;

export const Z_TestimonialCompliance: StoryFn = () => (
  <ComplianceCard
    title="Compliance: 11/11"
    titleIcon={
      <Icon name="check-fat" color="var(--color-success)" weight="fill" />
    }
    rules={testimonialComplianceRules}
  />
);

export const Default = () => (
  <Testimonial
    quote="Working with Digitaltableteur was an exceptional experience. Petri delivered exactly what we needed with incredible attention to detail and professionalism."
    name="Sarah Johnson"
    title="Product Manager"
    company="TechCorp"
    linkedinUrl="https://linkedin.com/in/sarahjohnson"
  />
);

export const WithAvatar = () => (
  <Testimonial
    quote="The design system created by Petri transformed our entire product line. The quality and consistency exceeded our expectations."
    name="Marcus Chen"
    title="Design Director"
    company="InnovateNow"
    linkedinUrl="https://linkedin.com/in/marcuschen"
    avatarUrl="/pete.png"
  />
);

export const LongTestimonial = () => (
  <Testimonial
    quote="Digitaltableteur brought a level of expertise and creativity to our project that we hadn't experienced before. The combination of technical skill and design vision resulted in a product that not only met our requirements but significantly enhanced our user experience."
    name="Elena Korhonen"
    title="Chief Technology Officer"
    company="Nordic Solutions"
    linkedinUrl="https://linkedin.com/in/elenakorhonen"
  />
);

export const WithoutLinkedIn = () => (
  <Testimonial
    quote="Outstanding work on our rebranding project. The results speak for themselves."
    name="David Wilson"
    title="CEO"
    company="StartupHub"
  />
);

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
