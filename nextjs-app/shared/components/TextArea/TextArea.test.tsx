import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import TextArea from "./TextArea";
import styles from "./TextArea.module.css";

describe("TextArea", () => {
  it("renders with label", () => {
    render(<TextArea label="Description" />);
    expect(screen.getByText("Description")).toBeInTheDocument();
    expect(screen.getByLabelText("Description")).toBeInTheDocument();
  });

  it("renders with placeholder", () => {
    render(
      <TextArea label="Description" placeholder="Enter your description" />,
    );
    expect(
      screen.getByPlaceholderText("Enter your description"),
    ).toBeInTheDocument();
  });

  it("renders with initial value", () => {
    render(<TextArea label="Description" value="Initial text" />);
    const textarea = screen.getByLabelText(
      "Description",
    ) as HTMLTextAreaElement;
    expect(textarea.value).toBe("Initial text");
  });

  it("calls onChange when text is entered", () => {
    const handleChange = vi.fn();
    render(<TextArea label="Description" onChange={handleChange} />);

    const textarea = screen.getByLabelText("Description");
    fireEvent.change(textarea, { target: { value: "New text" } });

    expect(handleChange).toHaveBeenCalledWith("New text");
  });

  it("displays error message when error prop is provided", () => {
    render(<TextArea label="Description" error="This field is required" />);
    expect(screen.getByText("This field is required")).toBeInTheDocument();
  });

  it("displays helper text when provided and no error", () => {
    render(
      <TextArea label="Description" helperText="Maximum 500 characters" />,
    );
    expect(screen.getByText("Maximum 500 characters")).toBeInTheDocument();
  });

  it("displays helper text alongside the error", () => {
    render(
      <TextArea
        label="Description"
        error="Required"
        helperText="Helper text"
      />,
    );
    expect(screen.getByText("Required")).toBeInTheDocument();
    expect(screen.getByText("Helper text")).toBeInTheDocument();
    const textarea = screen.getByLabelText("Description");
    expect(textarea.getAttribute("aria-describedby")).toContain(
      screen.getByText("Required").id,
    );
    expect(textarea.getAttribute("aria-describedby")).toContain(
      screen.getByText("Helper text").id,
    );
  });

  it("disables textarea when disabled prop is true", () => {
    render(<TextArea label="Description" disabled />);
    const textarea = screen.getByLabelText("Description");
    expect(textarea).toBeDisabled();
  });

  it("applies custom rows attribute", () => {
    render(<TextArea label="Description" rows={10} />);
    const textarea = screen.getByLabelText("Description");
    expect(textarea).toHaveAttribute("rows", "10");
  });

  it("updates value when controlled value changes", () => {
    const { rerender } = render(<TextArea label="Description" value="First" />);
    let textarea = screen.getByLabelText("Description") as HTMLTextAreaElement;
    expect(textarea.value).toBe("First");

    rerender(<TextArea label="Description" value="Second" />);
    textarea = screen.getByLabelText("Description") as HTMLTextAreaElement;
    expect(textarea.value).toBe("Second");
  });

  it("applies error styling when error prop is provided", () => {
    render(<TextArea label="Description" error="Error" />);
    const textarea = screen.getByRole("textbox");
    expect(textarea.className).toContain(styles.error);
  });

  it("wires aria-invalid and aria-describedby to the error message", () => {
    render(<TextArea label="Description" error="This field is required" />);
    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveAttribute("aria-invalid", "true");
    const describedBy = textarea.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    const message = document.getElementById(describedBy as string);
    expect(message).toHaveTextContent("This field is required");
    expect(message).toHaveAttribute("role", "alert");
  });

  it("links aria-describedby to the helper text when there is no error", () => {
    render(<TextArea label="Description" helperText="Maximum 500 characters" />);
    const textarea = screen.getByRole("textbox");
    expect(textarea).not.toHaveAttribute("aria-invalid");
    const describedBy = textarea.getAttribute("aria-describedby");
    expect(document.getElementById(describedBy as string)).toHaveTextContent(
      "Maximum 500 characters",
    );
  });

  it("shows the required marker from the required prop, not the error state", () => {
    const { rerender } = render(<TextArea label="Description" />);
    expect(screen.queryByText("(required)")).not.toBeInTheDocument();

    // Error alone must NOT imply required.
    rerender(<TextArea label="Description" error="Bad value" />);
    expect(screen.queryByText("(required)")).not.toBeInTheDocument();

    rerender(<TextArea label="Description" required />);
    expect(screen.getByText("(required)")).toBeInTheDocument();
  });

  it("gives two same-labelled fields distinct ids (no duplicate-id collision)", () => {
    render(
      <>
        <TextArea label="Message" />
        <TextArea label="Message" />
      </>,
    );
    const [first, second] = screen.getAllByRole("textbox");
    expect(first.id).toBeTruthy();
    expect(second.id).toBeTruthy();
    expect(first.id).not.toBe(second.id);
  });
});
