import React from "react";
import Title from "./Title";

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
