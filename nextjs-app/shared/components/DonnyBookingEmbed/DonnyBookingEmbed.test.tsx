import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import i18n from "../../i18n";
import { DonnyBookingEmbed } from "./DonnyBookingEmbed";

vi.mock("@calcom/embed-react", () => ({
  default: function MockCal({ calLink }: { calLink: string }) {
    return <div data-testid="cal-com-embed">{calLink}</div>;
  },
}));

function renderEmbed(props: React.ComponentProps<typeof DonnyBookingEmbed>) {
  return render(
    <I18nextProvider i18n={i18n}>
      <DonnyBookingEmbed {...props} />
    </I18nextProvider>,
  );
}

describe("DonnyBookingEmbed", () => {
  it("renders Cal.com embed react for EU accounts", async () => {
    renderEmbed({
      configured: true,
      provider: "calcom",
      meetingLabel: "30min",
      embedUrl: "https://app.cal.eu/digitaltableteur/30min/embed?embed=true",
      fallbackUrl: "https://cal.eu/digitaltableteur/30min",
      calLink: "digitaltableteur/30min",
      calOrigin: "https://cal.eu",
      embedJsUrl: "https://app.cal.eu/embed/embed.js",
    });

    expect(
      screen.getByRole("progressbar", { name: /Loading booking calendar/i }),
    ).toBeInTheDocument();
    expect(await screen.findByTestId("cal-com-embed")).toHaveTextContent(
      "digitaltableteur/30min",
    );
  });

  it("renders an iframe for Calendly URLs", () => {
    renderEmbed({
      configured: true,
      provider: "calendly",
      meetingLabel: "discovery",
      embedUrl: "https://calendly.com/digitaltableteur/discovery?embed_type=Inline",
      fallbackUrl: "https://calendly.com/digitaltableteur/discovery",
    });

    expect(screen.getByTitle(/Schedule a call/i)).toBeInTheDocument();
  });

  it("shows contact fallback when booking is not configured", () => {
    renderEmbed({
      configured: false,
      provider: "none",
      meetingLabel: "discovery",
      embedUrl: "",
      fallbackUrl: "/contact",
    });

    expect(screen.getByTestId("donny-booking-fallback")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Open contact form/i })).toHaveAttribute(
      "href",
      "/contact",
    );
  });

  it("rejects untrusted Cal.com origins", () => {
    renderEmbed({
      configured: true,
      provider: "calcom",
      meetingLabel: "discovery",
      embedUrl: "https://evil.example/embed",
      fallbackUrl: "/contact",
      calLink: "digitaltableteur/30min",
      calOrigin: "https://evil.example",
    });

    expect(screen.getByTestId("donny-booking-fallback")).toBeInTheDocument();
  });
});
