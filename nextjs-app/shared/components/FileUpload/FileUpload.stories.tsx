import contract from "./FileUpload.contract.json";
import React, { useState } from "react";
import { Meta, StoryFn } from "@storybook/react-vite";
import FileUpload from "@dt/FileUpload";
import { expect, userEvent, waitFor, within } from "storybook/test";
import schema from "./schema.json";

export default {
  title: "Forms/FileUpload",
  component: FileUpload,
  tags: ["beta", "autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=384-26",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
    llm: { schema },
  },
  argTypes: {
    label: { control: "text", description: "Field label" },

    placeholder: {
      control: "text",
      description: "Placeholder when no file selected",
    },

    helperText: {
      control: "text",
      description: "Helper copy below the control",
    },

    uploadButtonLabel: { control: "text", description: "Upload button label" },

    clearButtonLabel: {
      control: "text",
      description: "Clear/remove button label",
    },

    accept: { control: "text", description: "Accepted file extensions/MIME" },

    maxSizeInBytes: {
      control: "number",
      description: "Maximum file size in bytes",
    },

    sizeErrorMessage: {
      control: "text",
      description: "Error when file exceeds max size",
    },

    error: { control: "text", description: "External error message" },

    disabled: { control: "boolean", description: "Disables the control" },

    required: { control: "boolean", description: "Marks field as required" },

    appearance: {
      control: "select",
      options: ["default", "editorial"],
      description:
        "Visual variant — editorial matches FormFieldEditorial / Combobox",
    },
    value: {
      table: { disable: true },
      description: "Controlled File value (managed in stories)",
    },
    onFileChange: {
      action: "file change",
      description: "Called when a file is selected or cleared",
    },
  },
} as Meta<typeof FileUpload>;

const Template: StoryFn<typeof FileUpload> = (
  args: React.ComponentProps<typeof FileUpload>,
) => {
  const [file, setFile] = useState<File | null>(null);
  return (
    <div style={{ maxWidth: "28rem" }}>
      <FileUpload {...args} value={file} onFileChange={setFile} />
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {
  label: "Attachment (optional)",
  placeholder: "No file selected",
  helperText: "Optional. Max 5 MB. Accepted formats: PDF, PNG, JPG.",
  uploadButtonLabel: "Choose file",
  clearButtonLabel: "Remove file",
  accept: ".pdf,.png,.jpg,.jpeg",
  maxSizeInBytes: 5 * 1024 * 1024,
  sizeErrorMessage: "File exceeds the 5 MB limit.",
};
Default.tags = ["example"];
Default.parameters = {
  docs: {
    description: {
      story:
        "The full recipe: accept filter, size cap, helper stating both, and a clear label so a wrong pick is undoable.",
    },
  },
};
Default.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);

  // Test that upload button is present and clickable
  const uploadButton = canvas.getByRole("button", { name: /choose file/i });
  await userEvent.click(uploadButton);
};

/** Picks a file through the hidden input, then clears it. */
export const SelectAndClear = Template.bind({});
SelectAndClear.args = { ...Default.args };
SelectAndClear.tags = ["example"];
SelectAndClear.parameters = {
  docs: {
    description: {
      story:
        "After a pick, the readonly field shows \"name (size)\" and the Clear button appears; clearing emits onFileChange(null).",
    },
  },
};
SelectAndClear.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const hiddenInput =
    canvasElement.querySelector<HTMLInputElement>("input[type='file']");
  if (!hiddenInput) throw new Error("hidden file input not found");

  const file = new File(["hello"], "brief.pdf", { type: "application/pdf" });
  await userEvent.upload(hiddenInput, file);

  await waitFor(() =>
    expect(canvas.getByDisplayValue(/brief\.pdf/)).toBeInTheDocument(),
  );

  const clearButton = await canvas.findByRole("button", {
    name: /remove file/i,
  });
  await userEvent.click(clearButton);
  await waitFor(() =>
    expect(canvas.queryByDisplayValue(/brief\.pdf/)).not.toBeInTheDocument(),
  );
};

/** A file over maxSizeInBytes is rejected and removed with an error. */
export const SizeRejection = Template.bind({});
SizeRejection.args = {
  ...Default.args,
  maxSizeInBytes: 10,
  sizeErrorMessage: "File exceeds the 10 byte demo limit.",
};
SizeRejection.tags = ["example"];
SizeRejection.parameters = {
  docs: {
    description: {
      story:
        "Rejection state: an oversized pick is dropped, the input resets, and sizeErrorMessage replaces the helper until the next pick.",
    },
  },
};
SizeRejection.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const hiddenInput =
    canvasElement.querySelector<HTMLInputElement>("input[type='file']");
  if (!hiddenInput) throw new Error("hidden file input not found");

  const bigFile = new File(["x".repeat(64)], "too-big.pdf", {
    type: "application/pdf",
  });
  await userEvent.upload(hiddenInput, bigFile);

  await waitFor(() =>
    expect(
      canvas.getByText(/exceeds the 10 byte demo limit/i),
    ).toBeInTheDocument(),
  );
  expect(canvas.queryByDisplayValue(/too-big\.pdf/)).not.toBeInTheDocument();
};

export const Editorial = Template.bind({});
Editorial.args = {
  ...Default.args,
  appearance: "editorial",
};
Editorial.tags = ["example"];
Editorial.parameters = {
  docs: {
    description: {
      story:
        "appearance=editorial swaps the TextInput+Button pair for the Combobox-style field used on editorial forms.",
    },
  },
};

export const Disabled = Template.bind({});
Disabled.args = {
  ...Default.args,
  disabled: true,
};

export const Playground: Story = {
  parameters: { a11y: { disable: true, test: "off" } },
  tags: ["beta-matrix"],
  render: Template,
  args: Default.args,
};

export const Example: Story = {
  globals: { forcedColors: "none" },
  tags: ["beta-matrix"],
  parameters: { a11y: { disable: true }, controls: { disable: true } },
  render: Template,
  args: Default.args,
};

export const ForcedColors: Story = {
  parameters: { a11y: { disable: true, test: "off" } },
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  render: Template,
  args: Default.args,
};
