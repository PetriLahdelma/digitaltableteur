import React from "react";
import { StoryFn, Meta } from "@storybook/react-vite";
import PersonCard from "./PersonCard";
import { PersonCardProps } from "./PersonCard";
import peteVaultBoy from "../../assets/images/pete-vault-boy.jpg";
import { within, userEvent } from "@storybook/testing-library";

export default {
  title: "Components/PersonCard",
  component: PersonCard,
  args: {
    imageSrc: peteVaultBoy,
    imageAlt: "Portrait of Petri Lahdelma",
    name: "Petri Lahdelma",
    title: "Digital Designer & Developer",
    email: "petri@digitaltableteur.com",
    linkedinUrl: "https://linkedin.com/in/petrilahdelma",
    linkedinLabel: "Connect on LinkedIn",
  },
  argTypes: {
    imageSrc: { control: "text" },
    imageAlt: { control: "text" },
    name: { control: "text" },
    title: { control: "text" },
    email: { control: "text" },
    linkedinUrl: { control: "text" },
    linkedinLabel: { control: "text" },
    className: { control: "text" },
  },
} as Meta<typeof PersonCard>;

const Template: StoryFn<PersonCardProps> = (args: PersonCardProps) => (
  <PersonCard {...args} />
);

export const Default = Template.bind({});
Default.args = {};

export const WithoutLinkedIn = Template.bind({});
WithoutLinkedIn.args = {
  linkedinUrl: undefined,
  linkedinLabel: undefined,
};

export const WithCustomClass = Template.bind({});
WithCustomClass.args = {
  className: "custom-person-card",
};

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
  await canvas.findByRole("img", {
    name: /portrait of petri lahdelma/i,
  });
  await canvas.findByRole("heading", { name: /petri lahdelma/i });
  await canvas.findByText(/digital designer & developer/i);
  await canvas.findByRole("link", {
    name: /petri@digitaltableteur.com/i,
  });
  await canvas.findByRole("link", {
    name: /connect on linkedin/i,
  });

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
};

WithoutLinkedIn.play = async ({
  canvasElement,
}: {
  canvasElement: HTMLElement;
}) => {
  const canvas = within(canvasElement);

  // Check that LinkedIn link is not rendered
  const linkedinLinks = canvas.queryAllByRole("link", { name: /linkedin/i });
  if (linkedinLinks.length > 0) {
    throw new Error(
      "LinkedIn link should not be present when linkedinUrl is undefined",
    );
  }

  // Check that other elements are still rendered
  await canvas.findByRole("img", {
    name: /portrait of petri lahdelma/i,
  });
  await canvas.findByRole("heading", { name: /petri lahdelma/i });
  await canvas.findByText(/digital designer & developer/i);
  await canvas.findByRole("link", {
    name: /petri@digitaltableteur.com/i,
  });
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