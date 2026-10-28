import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import i18n from "../../i18n";
import { DonnyBookingEmbed } from "./DonnyBookingEmbed";

const siteTheme = vi.hoisted(() => ({ current: "light" }));

vi.mock("../ThemeProvider", () => ({
  useTheme: () => ({ theme: siteTheme.current }),
}));

const calApi = vi.hoisted(() => ({
  handlers: new Map<string, () => void>(),
  api: vi.fn(),
}));
calApi.api.mockImplementation((command: string, options: { action: string; callback: () => void }) => {
  if (command === "on") calApi.handlers.set(options.action, options.callback);
  if (command === "off") calApi.handlers.delete(options.action);
});

vi.mock("@calcom/embed-react", () => ({
  getCalApi: vi.fn(async () => calApi.api),
  default: function MockCal({
    calLink,
    config,
  }: {
    calLink: string;
    config?: { theme?: string };
  }) {
    return (
      <div data-testid="cal-com-embed" data-theme={config?.theme}>
        {calLink}
      </div>
    );
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

  it("names a duration slug by its length, not as a meeting name", () => {
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
      screen.getByRole("heading", { name: "Book a 30-minute call" }),
    ).toBeInTheDocument();
  });

  it("sets the title level to fit the page outline", () => {
    renderEmbed({
      configured: true,
      provider: "calcom",
      meetingLabel: "30min",
      embedUrl: "https://app.cal.eu/digitaltableteur/30min/embed?embed=true",
      fallbackUrl: "https://cal.eu/digitaltableteur/30min",
      calLink: "digitaltableteur/30min",
      calOrigin: "https://cal.eu",
      embedJsUrl: "https://app.cal.eu/embed/embed.js",
      headingLevel: "h2",
    });
    expect(
      screen.getByRole("heading", { level: 2, name: "Book a 30-minute call" }),
    ).toBeInTheDocument();
  });

  it.each([
    ["light", "light"],
    ["dark", "dark"],
    ["hcb", "dark"],
    ["hcw", "light"],
  ])("gives Cal.com the site theme (%s -> %s), not the OS one", async (site, cal) => {
    siteTheme.current = site;
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
    expect(await screen.findByTestId("cal-com-embed")).toHaveAttribute(
      "data-theme",
      cal,
    );
    siteTheme.current = "light";
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

  it("reports book_meeting when Cal confirms a booking, and stops listening on unmount", async () => {
    const gtag = vi.fn();
    (window as unknown as { gtag?: unknown }).gtag = gtag;
    try {
      const view = renderEmbed({
        configured: true,
        provider: "calcom",
        meetingLabel: "30min",
        embedUrl: "https://app.cal.eu/digitaltableteur/30min/embed?embed=true",
        fallbackUrl: "https://cal.eu/digitaltableteur/30min",
        calLink: "digitaltableteur/30min",
        calOrigin: "https://cal.eu",
        embedJsUrl: "https://app.cal.eu/embed/embed.js",
      });
      await vi.waitFor(() => expect(calApi.handlers.has("bookingSuccessfulV2")).toBe(true));
      calApi.handlers.get("bookingSuccessfulV2")?.();
      expect(gtag).toHaveBeenCalledWith("event", "book_meeting", { booking_source: "chat" });

      view.unmount();
      expect(calApi.handlers.has("bookingSuccessfulV2")).toBe(false);
    } finally {
      delete (window as unknown as { gtag?: unknown }).gtag;
    }
  });
});
