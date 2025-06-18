import React from "react";
import Text from "./Text";

export default {
  title: "Components/Text",
  component: Text,
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
