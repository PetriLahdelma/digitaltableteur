import React, { useState } from "react";
import { Meta, StoryFn } from "@storybook/react";
import Modal, { ModalProps } from "./Modal";
import Button from "../Button/Button";
import { FaInfoCircle, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { MdOutlineError } from "react-icons/md";

export default {
  title: "Components/Modal",
  component: Modal,
  argTypes: {
    title: { control: "text" },
    variant: {
      control: {
        type: "select",
        options: ["default", "success", "error", "loading", "info"],
      },
    },
    icon: {
      control: {
        type: "select",
        options: {
          None: null,
          Error: FaTimesCircle({}),
          Success: FaCheckCircle({}),
          Info: FaInfoCircle({}),
        },
      },
    },
    children: { control: "text" },
    onClose: { action: "closed" },
  },
} as Meta;

const Template: StoryFn<ModalProps> = (args: ModalProps) => {
  const [open, setOpen] = useState(true);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open modal</Button>
      <Modal
        {...args}
        isOpen={open}
        onClose={() => setOpen(false)}
        icon={args.icon} // Pass icon directly as ReactNode
      />
    </>
  );
};

export const Default = Template.bind({});
Default.args = {
  title: "Default Modal",
  variant: "default",
  icon: null,
};

export const Loading = Template.bind({});
Loading.args = {
  variant: "loading",
  title: "Loading",
  children: <p>Please wait...</p>,
};

export const ErrorDialog = Template.bind({});
ErrorDialog.args = {
  isOpen: true,
  title: "Error",
  icon: MdOutlineError({ style: { color: "var(--color-error)" } }),
  variant: "error",
  children: "An error occurred while processing your request.",
  onClose: () => alert("Closed"),
};

export const SuccessDialog = Template.bind({});
SuccessDialog.args = {
  isOpen: true,
  title: "Success",
  icon: FaCheckCircle({ style: { color: "var(--color-success)" } }),
  variant: "success",
  children: "Your operation was successful!",
  onClose: () => alert("Closed"),
};

export const InfoDialog = Template.bind({});
InfoDialog.args = {
  isOpen: true,
  title: "Information",
  icon: FaInfoCircle({ style: { color: "var(--color-info)" } }), // Updated icon format with style prop
  variant: "info",
  children: "Here is some important information.",
  onClose: () => alert("Closed"),
};
