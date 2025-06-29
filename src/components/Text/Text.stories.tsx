import React from "react";
import Text from "./Text";
import { within } from "@storybook/testing-library";

export default {
  title: "Components/Text",
  component: Text,
  argTypes: {
    as: {
      control: { type: "select" },
      options: ["p", "span", "div", "strong", "em"],
      description: "HTML tag to render",
    },
    size: {
      control: { type: "radio" },
      options: ["S", "M", "L"],
      description: "Text size variant",
    },
    terminals: {
      control: { type: "radio" },
      options: ["sans", "serif"],
      description: "Font family (sans or serif)",
    },
    className: { control: "text", description: "Custom class name" },
    children: { control: "text", description: "Text content" },
  },
};

const Template = (args: any) => <Text {...args} />;

export const Playground: any = Template.bind({});
Playground.args = {
  children: "Play with the Text component!",
  as: "p",
  size: "M",
  terminals: "sans",
  className: "",
};

Playground.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  await canvas.findByText(/play with the text component!/i);
};

export const Default = () => <Text>This is default text.</Text>;

export const AsSpan = () => <Text as="span">This is a span text.</Text>;

export const CustomClass = () => (
  <Text className="custom-class">Text with custom class</Text>
);

export const AllTags = () => (
  <>
    <Text as="p">Paragraph</Text>
    <Text as="span">Span</Text>
    <Text as="div">Div</Text>
    <Text as="strong">Strong</Text>
    <Text as="em">Emphasized</Text>
  </>
);

export const Sizes = () => (
  <>
    <Text size="S">Small text (S)</Text>
    <Text size="M">Medium text (M, default)</Text>
    <Text size="L">Large text (L)</Text>
  </>
);

export const SerifAndSans = () => (
  <>
    <Text terminals="sans">Sans-serif text</Text>
    <Text terminals="serif">Serif text</Text>
  </>
);
