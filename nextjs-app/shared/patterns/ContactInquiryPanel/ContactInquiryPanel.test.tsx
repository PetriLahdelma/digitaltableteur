import { useMemo, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TranslationProvider, type Translate } from "../../lib/translation";
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

const translations = {
  en: {
    contactInquiryModeLabel: "Contact options",
    contactInquiryMessageTab: "Send a message",
    contactInquiryBookTab: "Book a call",
    contactInquiryBookTabNew: "NEW!",
    contactBookingComingSoon:
      "Online scheduling is not live yet. Send a message and we will reply with times — usually within one business day.",
    contactBookingUseForm: "Use the contact form",
    contactBookingEmail: "Email us instead",
    donnyBookingLoading: "Loading booking calendar",
  },
  fi: {
    contactInquiryModeLabel: "Yhteydenottotavat",
    contactInquiryMessageTab: "Lähetä viesti",
    contactInquiryBookTab: "Varaa puhelu",
    contactInquiryBookTabNew: "UUSI!",
    contactBookingComingSoon:
      "Ajanvaraus ei ole vielä käytössä. Lähetä viesti, niin ehdotamme aikoja yleensä yhden arkipäivän kuluessa.",
    contactBookingUseForm: "Käytä yhteydenottolomaketta",
    contactBookingEmail: "Lähetä sähköpostia",
    donnyBookingLoading: "Ladataan varauskalenteria",
  },
} as const;

type TestLanguage = keyof typeof translations;

function createTranslate(language: TestLanguage): Translate {
  return (key, fallbackOrOptions) => {
    const fallback =
      typeof fallbackOrOptions === "string"
        ? fallbackOrOptions
        : fallbackOrOptions?.defaultValue;
    return (
      translations[language][key as keyof (typeof translations)[TestLanguage]] ??
      fallback ??
      key
    ).toString();
  };
}

function ContactPanelHarness({
  initialMode = "message",
}: {
  initialMode?: "message" | "book";
}) {
  const [language, setLanguage] = useState<TestLanguage>("en");
  const translate = useMemo(() => createTranslate(language), [language]);

  return (
    <TranslationProvider
      translate={translate}
      language={language}
      resolvedLanguage={language}
    >
      <button type="button" onClick={() => setLanguage("fi")}>
        Finnish
      </button>
      <ContactInquiryPanel
        initialMode={initialMode}
        messagePanel={<div>Contact form body</div>}
      />
    </TranslationProvider>
  );
}

function renderPanel(initialMode: "message" | "book" = "message") {
  return render(
    <ContactPanelHarness initialMode={initialMode} />,
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

  it("updates tab labels without a page reload when language changes", async () => {
    renderPanel("message");

    expect(
      screen.getByRole("tab", { name: /Send a message/i }),
    ).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Finnish" }));

    expect(
      screen.getByRole("tab", { name: /Lähetä viesti/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("tab", { name: /Send a message/i }),
    ).not.toBeInTheDocument();
  });
});
