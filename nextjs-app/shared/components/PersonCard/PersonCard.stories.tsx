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
  argTypes: {
    imageSrc: {
      control: "text",
      description: "Portrait image URL",
      table: { category: "Media" },
    },

    imageAlt: {
      description: "Image Alt",
      control: "text",
    },

    name: {
      description: "Name",
      control: "text",
    },

    title: {
      description: "Title",
      control: "text",
    },

    email: {
      description: "Email",
      control: "text",
    },

    linkedinUrl: {
      description: "Linkedin URL",
      control: "text",
    },

    linkedinLabel: {
      description: "Linkedin Label",
      control: "text",
    },

    githubUrl: {
      description: "Github URL",
      control: "text",
    },

    githubLabel: {
      description: "Github Label",
      control: "text",
    },

    facebookUrl: {
      description: "Facebook URL",
      control: "text",
    },

    facebookLabel: {
      description: "Facebook Label",
      control: "text",
    },

    twitterUrl: {
      description: "Twitter URL",
      control: "text",
    },

    twitterLabel: {
      description: "Twitter Label",
      control: "text",
    },

    dribbbleUrl: {
      description: "Dribbble URL",
      control: "text",
    },

    dribbbleLabel: {
      description: "Dribbble Label",
      control: "text",
    },

    mediumUrl: {
      description: "Medium URL",
      control: "text",
    },

    mediumLabel: {
      description: "Medium Label",
      control: "text",
    },

    instagramUrl: {
      description: "Instagram URL",
      control: "text",
    },

    instagramLabel: {
      description: "Instagram Label",
      control: "text",
    },

    className: {
      description: "Class Name",
      control: "text",
    },
      as: { table: { disable: true } },
      asChild: { table: { disable: true } },
      children: { table: { disable: true } },
      id: { table: { disable: true } },
      imageDecoding: { control: { type: "inline-radio" }, options: ["auto", "sync", "async"], description: "Native img decoding hint for the portrait.", table: { category: "Content" } },
      imageLoading: { control: { type: "inline-radio" }, options: ["lazy", "eager"], description: "Native img loading strategy for the portrait.", table: { category: "Content", defaultValue: { summary: "lazy" } } },
      imageSizes: { control: "text", description: "Native img sizes attribute for the portrait.", table: { category: "Content" } },
      imageSrcSet: { control: "text", description: "Native img srcSet for responsive portrait densities.", table: { category: "Content" } },
      loading: { control: "boolean", description: "Show skeleton placeholders while content is loading", table: { category: "Content" } },
      ref: { table: { disable: true } },
      style: { table: { disable: true } },
      substackLabel: { control: "text", description: "Accessible name for the Substack link.", table: { category: "Accessibility" } },
      substackUrl: { control: "text", description: "Substack profile URL; the link renders only when set.", table: { category: "Content" } }
},
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

export const Playground = Default;
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
