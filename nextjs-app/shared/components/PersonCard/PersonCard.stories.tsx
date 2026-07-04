import contract from "./PersonCard.contract.json";
import React from "react";
import { StoryFn, Meta } from "@storybook/react-vite";
import PersonCard from "@dt/PersonCard";
import { PersonCardProps } from "@dt/PersonCard";
import peteVaultBoy from "../../assets/images/pete-vault-boy.jpg";
import { userEvent, within } from "storybook/test";
import Icon from "@dt/Icon";
import ComplianceCard from "@dt/ComplianceCard";
import type { ComplianceRule } from "@dt/ComplianceCard";
const personCardComplianceRules: ComplianceRule[] = [
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
    details: "Proper typing with PersonCardProps",
  },
  {
    id: "translation-support",
    rule: "Translation support",
    status: "pass",
    details: "Props for social labels",
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
    details: "Replaced --primary-font with var(--font-text)",
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
    details: "CSS custom properties",
  },
  {
    id: "composition",
    rule: "Component composition",
    status: "pass",
    details: "Flexible social links, custom theme",
  },
  {
    id: "accessibility",
    rule: "Accessibility",
    status: "pass",
    details: "Alt text, link labels, semantic markup",
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
  title: "Site/PersonCard",
  component: PersonCard,
  args: {
    imageSrc: peteVaultBoy,
    imageAlt: "Portrait of Petri Lahdelma",
    name: "Petri Lahdelma",
    title: "Digital Designer & Developer",
    email: "petri@digitaltableteur.com",
    linkedinUrl: "https://linkedin.com/in/petrilahdelma",
    linkedinLabel: "Connect on LinkedIn",
    githubUrl: "https://github.com/petrilahdelma",
    githubLabel: "View GitHub Profile",
    facebookUrl: "",
    facebookLabel: "Connect on Facebook",
    twitterUrl: "https://twitter.com/petrilahdelma",
    twitterLabel: "Follow on Twitter",
    dribbbleUrl: "",
    dribbbleLabel: "View Dribbble Profile",
    mediumUrl: "https://medium.com/digitaltableteur",
    mediumLabel: "Read on Medium",
    instagramUrl: "",
    instagramLabel: "Follow on Instagram",
  },
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts).
} as Meta<typeof PersonCard>;

export const Z_PersonCardCompliance: StoryFn = () => (
  <ComplianceCard
    title="Compliance: 11/11"
    titleIcon={
      <Icon name="check-fat" color="var(--color-success)" weight="fill" />
    }
    rules={personCardComplianceRules}
  />
);

const Template: StoryFn<PersonCardProps> = (args: PersonCardProps) => (
  <PersonCard {...args} />
);

export const Default = Template.bind({});
Default.args = {};

export const WithoutSocialMedia = Template.bind({});
WithoutSocialMedia.args = {
  linkedinUrl: undefined,
  githubUrl: undefined,
  facebookUrl: undefined,
  twitterUrl: undefined,
  dribbbleUrl: undefined,
  mediumUrl: undefined,
  instagramUrl: undefined,
};

export const Loading = Template.bind({});
Loading.args = { loading: true };

export const AllSocialMedia = Template.bind({});
AllSocialMedia.args = {
  linkedinUrl: "https://linkedin.com/in/petrilahdelma",
  githubUrl: "https://github.com/petrilahdelma",
  facebookUrl: "https://facebook.com/petrilahdelma",
  twitterUrl: "https://twitter.com/petrilahdelma",
  dribbbleUrl: "https://dribbble.com/petrilahdelma",
  mediumUrl: "https://medium.com/digitaltableteur",
  instagramUrl: "https://instagram.com/petrilahdelma",
};

export const WithCustomClass = Template.bind({});
WithCustomClass.args = { className: "custom-person-card" };

export const LongTitle = Template.bind({});
LongTitle.args = {
  name: "Dr. Alexandra Catherine Thompson-Williams",
  title:
    "Senior Principal Software Engineering Manager & Technical Lead for Digital Innovation",
  email: "alexandra.thompson-williams@company.com",
};

// Interaction tests
Default.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);

  // Check that all elements are rendered
  await canvas.findByRole("img", { name: /portrait of petri lahdelma/i });
  await canvas.findByRole("heading", { name: /petri lahdelma/i });
  await canvas.findByText(/digital designer & developer/i);
  await canvas.findByRole("link", { name: /petri@digitaltableteur.com/i });
  await canvas.findByRole("link", { name: /connect on linkedin/i });

  // Test email link functionality
  const emailLink = await canvas.findByRole("link", {
    name: /petri@digitaltableteur.com/i,
  });
  await userEvent.hover(emailLink);

  // Test LinkedIn link functionality
  const linkedinLink = await canvas.findByRole("link", {
    name: /connect on linkedin/i,
  });
  await userEvent.hover(linkedinLink);

  // Test GitHub link functionality
  const githubLink = await canvas.findByRole("link", {
    name: /view github profile/i,
  });
  await userEvent.hover(githubLink);

  // Test Twitter link functionality
  const twitterLink = await canvas.findByRole("link", {
    name: /follow on twitter/i,
  });
  await userEvent.hover(twitterLink);

  // Test Medium link functionality
  const mediumLink = await canvas.findByRole("link", {
    name: /read on medium/i,
  });
  await userEvent.hover(mediumLink);
};

WithoutSocialMedia.play = async ({
  canvasElement,
}: {
  canvasElement: HTMLElement;
}) => {
  const canvas = within(canvasElement);

  // Check that no social media links are rendered
  const socialLinks = canvas
    .queryAllByRole("link")
    .filter((link) => !(link as HTMLAnchorElement).href.startsWith("mailto:"));
  if (socialLinks.length > 0) {
    throw new Error(
      "Social media links should not be present when URLs are undefined",
    );
  }

  // Check that other elements are still rendered
  await canvas.findByRole("img", { name: /portrait of petri lahdelma/i });
  await canvas.findByRole("heading", { name: /petri lahdelma/i });
  await canvas.findByText(/digital designer & developer/i);
  await canvas.findByRole("link", { name: /petri@digitaltableteur.com/i });
};

AllSocialMedia.play = async ({
  canvasElement,
}: {
  canvasElement: HTMLElement;
}) => {
  const canvas = within(canvasElement);

  // Check that all social media links are rendered
  await canvas.findByRole("link", { name: /connect on linkedin/i });
  await canvas.findByRole("link", { name: /view github profile/i });
  await canvas.findByRole("link", { name: /connect on facebook/i });
  await canvas.findByRole("link", { name: /follow on twitter/i });
  await canvas.findByRole("link", { name: /view dribbble profile/i });
  await canvas.findByRole("link", { name: /read on medium/i });
  await canvas.findByRole("link", { name: /follow on instagram/i });
};

LongTitle.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);

  // Test that long content still renders properly
  await canvas.findByRole("heading", {
    name: /dr. alexandra catherine thompson-williams/i,
  });
  await canvas.findByText(/senior principal software engineering manager/i);
  await canvas.findByRole("link", {
    name: /alexandra.thompson-williams@company.com/i,
  });
};

// Seed every social URL so the *Label controls (aria-labels on the social
// links) are effective — a link renders only when its URL is set, so the
// meta's empty facebook/dribbble/instagram + absent substack left those
// labels inert.
export const Playground = Template.bind({});
Playground.tags = ["beta-matrix"];
Playground.args = {
  facebookUrl: "https://facebook.com/petrilahdelma",
  dribbbleUrl: "https://dribbble.com/petrilahdelma",
  instagramUrl: "https://instagram.com/petrilahdelma",
  substackUrl: "https://petrilahdelma.substack.com",
};
export const Example = {
  tags: ["beta-matrix"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-person-card",
    },
    a11y: { test: "error" },
    contractStatus: contract.status,
    controls: { disable: true },
  },
  ...Default,
};
export const ForcedColors = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  ...Default,
};
