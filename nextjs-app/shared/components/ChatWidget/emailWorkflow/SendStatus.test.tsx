import type { ComponentProps } from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nextProvider } from "react-i18next";
import i18n from "../../../i18n";
import SendStatus from "./SendStatus";

function renderStatus(
  props: ComponentProps<typeof SendStatus>,
) {
  return render(
    <I18nextProvider i18n={i18n}>
      <SendStatus {...props} />
    </I18nextProvider>,
  );
}

describe("SendStatus", () => {
  it("renders sending state", () => {
    const dispatch = vi.fn();
    renderStatus({ step: "sending", dispatch });

    expect(screen.getByText(/Sending email/i)).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveAttribute("aria-busy", "true");
  });

  it("renders success state", () => {
    const dispatch = vi.fn();
    renderStatus({ step: "success", dispatch });

    expect(screen.getByText(/Email sent/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Done/i })).toBeInTheDocument();
  });

  it("renders error state", () => {
    const dispatch = vi.fn();
    renderStatus({ step: "error", dispatch });

    expect(screen.getByText(/Unable to send/i)).toBeInTheDocument();
  });

  it("renders edit button on error", () => {
    const dispatch = vi.fn();
    renderStatus({ step: "error", dispatch });

    expect(screen.getByRole("button", { name: /Edit/i })).toBeInTheDocument();
  });

  it("renders cancel button on error", () => {
    const dispatch = vi.fn();
    renderStatus({ step: "error", dispatch });

    expect(screen.getByRole("button", { name: /Cancel/i })).toBeInTheDocument();
  });

  it("dispatches CANCEL when done is clicked on success", async () => {
    const user = userEvent.setup();
    const dispatch = vi.fn();
    renderStatus({ step: "success", dispatch });

    await user.click(screen.getByRole("button", { name: /Done/i }));
    expect(dispatch).toHaveBeenCalledWith({ type: "CANCEL" });
  });

  it("dispatches EDIT when edit is clicked on error", async () => {
    const user = userEvent.setup();
    const dispatch = vi.fn();
    renderStatus({ step: "error", dispatch });

    await user.click(screen.getByRole("button", { name: /Edit/i }));
    expect(dispatch).toHaveBeenCalledWith({ type: "EDIT", field: "message" });
  });
});
