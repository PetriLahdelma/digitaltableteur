import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import Accordion from "./Accordion";

const meta: Meta<typeof Accordion> = {
  title: "Content/Accordion",
  component: Accordion,
};

export default meta;
type Story = StoryObj<typeof Accordion>;

export const Default: Story = {
  args: {
    items: [
      { id: "one", title: "What is Digitaltableteur?", content: "We are a design and engineering studio." },
      { id: "two", title: "Do you work with AI?", content: "Yes, responsibly—with human oversight." },
      { id: "three", title: "How can I contact you?", content: "Email mail@digitaltableteur.com." },
    ],
  },
};
