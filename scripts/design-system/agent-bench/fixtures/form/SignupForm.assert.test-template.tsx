import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SignupForm from "./SignupForm";

function setup() {
  const user = userEvent.setup();
  const onSubmit = vi.fn();
  render(<SignupForm onSubmit={onSubmit} />);
  return {
    user,
    onSubmit,
    name: () => screen.getByRole("textbox", { name: /^Name/ }),
    email: () => screen.getByRole("textbox", { name: /^Email/ }),
    submit: () => screen.getByRole("button", { name: "Create account" }),
  };
}

describe("bench: form acceptance", () => {
  it("flags every empty required field with a described error", async () => {
    const { user, onSubmit, name, email, submit } = setup();
    await user.click(submit());
    expect(onSubmit).not.toHaveBeenCalled();
    expect(name()).toHaveAttribute("aria-invalid", "true");
    expect(name()).toHaveAccessibleDescription(
      expect.stringContaining("Enter your name"),
    );
    expect(email()).toHaveAttribute("aria-invalid", "true");
    expect(email()).toHaveAccessibleDescription(
      expect.stringContaining("Enter a valid email address"),
    );
  });

  it("moves focus to the first invalid field on submit", async () => {
    const { user, name, submit } = setup();
    await user.click(submit());
    await waitFor(() => expect(name()).toHaveFocus());
  });

  it("clears a fixed field and focuses the remaining invalid one", async () => {
    const { user, onSubmit, name, email, submit } = setup();
    await user.type(name(), "Ada");
    await user.type(email(), "ada-at-example");
    await user.click(submit());
    expect(onSubmit).not.toHaveBeenCalled();
    expect(name()).not.toHaveAttribute("aria-invalid", "true");
    expect(email()).toHaveAttribute("aria-invalid", "true");
    expect(email()).toHaveAccessibleDescription(
      expect.stringContaining("Enter a valid email address"),
    );
    await waitFor(() => expect(email()).toHaveFocus());
  });

  it("submits valid data once, without error state", async () => {
    const { user, onSubmit, name, email, submit } = setup();
    await user.type(name(), "Ada");
    await user.type(email(), "ada@example.com");
    await user.click(submit());
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({
      name: "Ada",
      email: "ada@example.com",
    });
    expect(name()).not.toHaveAttribute("aria-invalid", "true");
    expect(email()).not.toHaveAttribute("aria-invalid", "true");
  });
});
