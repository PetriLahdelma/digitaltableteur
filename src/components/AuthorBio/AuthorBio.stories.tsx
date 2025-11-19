import type { Meta, StoryObj } from "@storybook/react";
import AuthorBio from "./AuthorBio";
import { getAuthors } from "../../data/authors";

const meta: Meta<typeof AuthorBio> = {
  title: "Components/AuthorBio",
  component: AuthorBio,
  parameters: {
    layout: "centered",
  },
};

export default meta;

type Story = StoryObj<typeof AuthorBio>;

const [defaultAuthor] = getAuthors();

export const Default: Story = {
  args: {
    slug: defaultAuthor?.slug ?? "petri-lahdelma",
  },
};

export const CustomHeading: Story = {
  args: {
    slug: defaultAuthor?.slug ?? "petri-lahdelma",
    heading: "Meet the author",
  },
};
