import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nextProvider } from "react-i18next";
import i18n from "../../i18n";
import { ContactInquiryPanel } from "./ContactInquiryPanel";

vi.mock("../../lib/donny-booking", () => ({
  resolveSiteBookingConfig: vi.fn(() => ({
    configured: false,
    provider: "none",
    meetingLabel: "discovery",
    embedUrl: "",
    fallbackUrl: "/contact",
    prefillApplied: false,
  })),
}));

function renderPanel(initialMode: "message" | "book" = "message") {
  return render(
    <I18nextProvider i18n={i18n}>
      <ContactInquiryPanel
        initialMode={initialMode}
        messagePanel={<div>Contact form body</div>}
      />
    </I18nextProvider>,
  );
}

describe("ContactInquiryPanel", () => {
  it("shows message tab by default with both tabs visible when booking is not configured", () => {
    renderPanel("message");

    expect(screen.getByText("Contact form body")).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: /Book a call/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("NEW!")).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: /Send a message/i }),
    ).toHaveAttribute("aria-selected", "true");
  });

  it("links tabs to tabpanels with matching ids", () => {
    renderPanel("message");

    expect(screen.getByRole("tablist")).toHaveAttribute(
      "aria-label",
      "Contact options",
    );
    expect(
      screen.getByRole("tab", { name: /Send a message/i }),
    ).toHaveAttribute("aria-controls", "tabpanel-message");
    expect(document.getElementById("tabpanel-message")).toBeTruthy();
    expect(document.getElementById("contact-form")).toBeTruthy();
  });

  it("shows booking coming-soon state when opened via ?mode=book", async () => {
    renderPanel("book");

    expect(
      screen.getByRole("tab", { name: /Book a call/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("NEW!")).toBeInTheDocument();
    expect(
      screen.getByText(/Online scheduling is not live yet/i),
    ).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /Use the contact form/i }));

    expect(screen.getByText("Contact form body")).toBeInTheDocument();
  });
});
