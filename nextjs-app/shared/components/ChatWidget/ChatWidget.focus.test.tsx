import React from "react";
import { describe, it, expect } from "vitest";
import { render, fireEvent, waitFor } from "@testing-library/react";
import ChatWidget from "@dt/ChatWidget";

// Basic provider wrappers could be added if needed; relying on internal i18n fallback keys.

describe("ChatWidget focus behavior", () => {
  it("focuses textarea when chat is opened via toggle", async () => {
    const { getByRole, findByLabelText } = render(<ChatWidget />);
    const toggle = getByRole("button", { name: /chat with donny/i });
    fireEvent.click(toggle);
    expect(getByRole("dialog")).toHaveAttribute("aria-modal", "false");
    const textarea = await findByLabelText(/ask donny a question/i);
    await waitFor(() => expect(textarea).toHaveFocus());
  });
});
