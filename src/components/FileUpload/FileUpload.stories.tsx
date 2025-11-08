import React, { useState } from "react";
import { Meta, StoryFn } from "@storybook/react-vite";
import FileUpload from "./FileUpload";

export default {
  title: "Components/FileUpload",
  component: FileUpload,
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
