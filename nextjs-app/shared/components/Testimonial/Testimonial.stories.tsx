import contract from "./Testimonial.contract.json";
import React from "react";
import Testimonial from "@dt/Testimonial";
import Icon from "@dt/Icon";
import type { Meta, StoryFn } from "@storybook/react-vite";

export default {
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts).
  title: "Site/Testimonial",
  component: Testimonial,
  tags: ["beta", "autodocs"],
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

// Args-driven (Default is a fixed showcase closure that ignores the panel).
export const Playground: Story = {
  tags: ["beta-matrix"],
  args: {
    quote:
      "Working with Digitaltableteur was an exceptional experience. Petri delivered exactly what we needed with incredible attention to detail and professionalism.",
    name: "Sarah Johnson",
    title: "Product Manager",
    company: "TechCorp",
    linkedinUrl: "https://linkedin.com/in/sarahjohnson",
  },
};
// Default is a StoryFn (a function): spreading it copies nothing, so
// `...Default` produced render-less stories that mounted an empty
// Testimonial. Use it as the render function instead.
export const Example = {
  tags: ["beta-matrix"],
  parameters: { controls: { disable: true } },
  render: Default,
};
export const ForcedColors = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  render: Default,
};
