import React from "react";
import Title from "./Title";
import { within } from "@storybook/testing-library";

export default {
  title: "Components/Title",
  component: Title,
};

export const AllSizes = () => (
  <>
    <Title size="S">Small Title</Title>
    <Title size="M">Medium Title</Title>
    <Title size="L">Large Title</Title>
    <Title size="XL">Extra Large Title</Title>
  </>
);

export const AllLevels = () => (
  <>
    <Title level={1}>Heading 1</Title>
    <Title level={2}>Heading 2</Title>
    <Title level={3}>Heading 3</Title>
    <Title level={4}>Heading 4</Title>
    <Title level={5}>Heading 5</Title>
    <Title level={6}>Heading 6</Title>
  </>
);

export const CustomTagAndClass = () => (
  <Title as="div" className="custom-class" size="M">
    Custom Tag (div) with custom class
  </Title>
);

export const Playground = (args: any) => <Title {...args} />;
Playground.args = {
  level: 2,
  size: "M",
  children: "Play with the Title component!",
};
Playground.argTypes = {
  level: {
    control: { type: "select" },
    options: [1, 2, 3, 4, 5, 6],
    defaultValue: 2,
  },
  size: {
    control: { type: "select" },
    options: ["XS", "S", "M", "L", "XL"],
    defaultValue: "M",
  },
  children: {
    control: "text",
    defaultValue: "Playground Title",
  },
  className: { control: "text" },
  terminals: {
    control: { type: "select" },
    options: ["serif", "sans"],
    defaultValue: "serif",
  },
  as: { control: "text" },
};

AllSizes.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  await canvas.findByText(/small title/i);
};

AllLevels.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  await canvas.findByText(/heading 1/i);
};
