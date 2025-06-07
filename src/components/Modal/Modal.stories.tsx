import React, { useState } from "react";
import { Meta, StoryFn } from "@storybook/react-webpack5";
import Modal, { ModalProps } from "./Modal";
import Button from "../Button/Button";

export default {
  title: "Components/Modal",
  component: Modal,
} as Meta<ModalProps>;

const Template: StoryFn<ModalProps> = (args) => {
  const [open, setOpen] = useState(true);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open modal</Button>
      <Modal {...args} isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
};

export const Default = Template.bind({});
Default.args = {
  title: "Default Modal",
  children: <p>This is a regular modal dialog.</p>,
};

export const Success = Template.bind({});
Success.args = {
  variant: "success",
  title: "Success",
  children: <p>Action completed successfully!</p>,
};

export const Error = Template.bind({});
Error.args = {
  variant: "error",
  title: "Error",
  children: <p>Something went wrong.</p>,
};

export const Loading = Template.bind({});
Loading.args = {
  variant: "loading",
  title: "Loading",
  children: <p>Please wait...</p>,
};
