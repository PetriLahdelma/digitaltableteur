import contract from "./AuthorBio.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import AuthorBio from "@dt/AuthorBio";
import { getAuthors } from "../../data/authors";
import peteVaultBoy from "../../assets/images/pete-vault-boy.jpg";

const meta: Meta<typeof AuthorBio> = {
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts).
  title: "Content/AuthorBio",
  component: AuthorBio,
  tags: ["stable", "!autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-author-bio",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
    layout: "centered",
  },
};

export default meta;

type Story = StoryObj<typeof AuthorBio>;

const [defaultAuthor] = getAuthors();

export const Default: Story = {
  tags: ["beta-matrix"],
  args: { slug: defaultAuthor?.slug ?? "petri-lahdelma" },
};

export const CustomHeading: Story = {
  args: {
    slug: defaultAuthor?.slug ?? "petri-lahdelma",
    heading: "Meet the author",
  },
};

/** showContact renders the author's email as a mailto link after the bio. */
export const WithContact: Story = {
  args: {
    slug: defaultAuthor?.slug ?? "petri-lahdelma",
    showContact: true,
  },
};

/**
 * Fully input-driven: no registry slug, every detail passed directly. This is
 * the reusable-component path for authors outside the site's registry.
 */
export const CustomAuthor: Story = {
  args: {
    name: "Jane Doe",
    imageUrl: peteVaultBoy,
    role: "Design Lead",
    bio: "Jane leads design systems work at Example Co.\n\nShe writes about **component APIs** and accessibility.",
    email: "jane@example.com",
    showContact: true,
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
