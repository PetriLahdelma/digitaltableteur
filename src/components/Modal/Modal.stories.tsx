import React, { useState } from "react";
import { Meta, StoryFn } from "@storybook/react-vite";
import Modal, { ModalProps } from "./Modal";
import Button from "@dt/Button";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  return (
    <>
      <Button onClick={() => setOpen(true)}>{t("storyModalOpen")}</Button>
      <Modal
        {...args}
        isOpen={open}
        onClose={() => setOpen(false)}
        icon={args.icon}
        title={t(args.title as string)}
        /* eslint-disable react/no-children-prop */
        children={
          typeof args.children === "string" ? t(args.children) : args.children
        }
        /* eslint-enable react/no-children-prop */
      />
    </>
  );
};

export const Default = Template.bind({});
Default.args = {
  title: "storyModalDefault",
  variant: "default",
  icon: null,
  showCloseIcon: true,
};

export const Loading = Template.bind({});
Loading.args = {
  variant: "loading",
  title: "storyModalLoading",
  children: <p>{"storyModalPleaseWait"}</p>,
  showCloseIcon: false,
};

export const ErrorDialog = Template.bind({});
ErrorDialog.args = {
  isOpen: true,
  title: "storyModalErrorTitle",
  icon: MdOutlineError({ style: { color: "var(--color-error)" } }),
  variant: "error",
  children: "storyModalErrorBody",
  onClose: () => alert("Closed"),
};

export const SuccessDialog = Template.bind({});
SuccessDialog.args = {
  isOpen: true,
  title: "storyModalSuccessTitle",
  icon: FaCheckCircle({ style: { color: "var(--color-success)" } }),
  variant: "success",
  children: "storyModalSuccessBody",
  onClose: () => alert("Closed"),
};

export const InfoDialog = Template.bind({});
InfoDialog.args = {
  isOpen: true,
  title: "storyModalInfoTitle",
  icon: FaInfoCircle({ style: { color: "var(--color-info)" } }), // Updated icon format with style prop
  variant: "info",
  children: "storyModalInfoBody",
  onClose: () => alert("Closed"),
};

export const BusyDialog = Template.bind({});
BusyDialog.args = {
  variant: "loading",
  title: "storyModalBusyTitle",
  children: <p>{"storyModalBusyBody"}</p>,
  showCloseIcon: false,
};
