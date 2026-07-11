import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import FileUpload from "@dt/FileUpload";

const renderComponent = (
  props: Partial<React.ComponentProps<typeof FileUpload>> = {},
) =>
  render(
    <FileUpload
      label="Attachment"
      placeholder="Select a file"
      uploadButtonLabel="Choose file"
      clearButtonLabel="Remove"
      helperText="Max 5 MB"
      {...props}
    />,
  );

describe("FileUpload", () => {
  it("renders label and helper text", () => {
    renderComponent();
    expect(screen.getByLabelText(/attachment/i)).toBeInTheDocument();
    expect(screen.getByText(/Max 5 MB/i)).toBeInTheDocument();
  });

  it("renders editorial appearance with a combobox-style field", () => {
    renderComponent({ appearance: "editorial", placeholder: "No file selected" });
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.getByText("Attachment")).toBeInTheDocument();
    expect(screen.getByText("No file selected")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /choose file/i })).toBeInTheDocument();
  });

  it("calls onFileChange when file is selected", () => {
    const handleChange = vi.fn();
    const { container } = renderComponent({ onFileChange: handleChange });
    const fileInput = container.querySelector(
      "input[type='file']",
    ) as HTMLInputElement;
    const file = new File(["hello"], "hello.pdf", {
      type: "application/pdf",
    });

    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(handleChange).toHaveBeenCalledWith(file);
    const textField = screen.getByLabelText(/attachment/i) as HTMLInputElement;
    expect(textField.value).toContain("hello.pdf");
  });

  it("shows error when file exceeds max size", () => {
    const handleChange = vi.fn();
    const { container } = renderComponent({
      onFileChange: handleChange,
      maxSizeInBytes: 1024,
      sizeErrorMessage: "File too large",
    });
    const fileInput = container.querySelector(
      "input[type='file']",
    ) as HTMLInputElement;
    const largeFile = new File([new Uint8Array(2048)], "big.pdf", {
      type: "application/pdf",
    });

    fireEvent.change(fileInput, { target: { files: [largeFile] } });

    expect(handleChange).toHaveBeenLastCalledWith(null);
    expect(screen.getByText(/File too large/i)).toBeInTheDocument();
  });

  it("calls onFileChange with null when the selected file is cleared", () => {
    const handleChange = vi.fn();
    const { container } = renderComponent({ onFileChange: handleChange });
    const fileInput = container.querySelector(
      "input[type='file']",
    ) as HTMLInputElement;
    const file = new File(["hello"], "hello.pdf", {
      type: "application/pdf",
    });

    fireEvent.change(fileInput, { target: { files: [file] } });
    fireEvent.click(screen.getByRole("button", { name: /remove/i }));

    expect(handleChange).toHaveBeenLastCalledWith(null);
    const textField = screen.getByLabelText(/attachment/i) as HTMLInputElement;
    expect(textField.value).toBe("");
  });

  it("clicking the text field triggers the hidden file input", () => {
    const { container } = renderComponent();
    const fileInput = container.querySelector(
      "input[type='file']",
    ) as HTMLInputElement;
    const textField = screen.getByLabelText(/attachment/i);

    const clickSpy = vi.spyOn(fileInput, "click");
    fireEvent.click(textField);

    expect(clickSpy).toHaveBeenCalled();
    clickSpy.mockRestore();
  });
});
