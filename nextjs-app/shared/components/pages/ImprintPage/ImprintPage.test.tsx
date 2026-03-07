import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { ImprintPage } from "./ImprintPage";

const translations = {
  en: {
    imprintHeading: "Imprint",
    imprintIntro:
      "This page provides the business identity and contact information for Digitaltableteur so that it is easily, directly, and permanently accessible online.",
    imprintLegalBusinessNameLabel: "Legal business name",
    imprintLegalBusinessNameValue: "digitaltableteur",
    imprintBusinessFormLabel: "Business form",
    imprintBusinessFormValue: "Sole trader",
    imprintAddressLabel: "Address",
    imprintAddressValue: "Hämeentie 8 C 26\n00530 Helsinki\nFinland",
    imprintEmailLabel: "Email",
    imprintBusinessIdValue:
      "Business ID (Y-tunnus): 2264455-2\nRegistered in the Finnish Trade Register (Kaupparekisteri), Finland",
    imprintBusinessIdLabel: "Business ID / Trade Register details",
    imprintVatIdLabel: "VAT ID",
    imprintVatIdValue: "FI22644552",
    imprintEmailValue: "mail@digitaltableteur.com",
  },
  fi: {
    imprintBusinessFormValue: "Yksityinen elinkeinonharjoittaja",
  },
} as const;

let currentLanguage: keyof typeof translations = "en";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) =>
      translations[currentLanguage][
        key as keyof (typeof translations)[typeof currentLanguage]
      ] ?? translations.en[key as keyof typeof translations.en] ?? key,
  }),
}));

describe("ImprintPage", () => {
  it("renders the page title and core business details in English", () => {
    currentLanguage = "en";
    render(<ImprintPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Imprint" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Legal business name")).toBeInTheDocument();
    expect(screen.getByText(/^digitaltableteur$/i)).toBeInTheDocument();
    expect(screen.getByText(/2264455-2/)).toBeInTheDocument();
    expect(screen.getByText(/FI22644552/)).toBeInTheDocument();
  });

  it("renders the contact email as a mailto link", () => {
    currentLanguage = "en";
    render(<ImprintPage />);

    expect(
      screen.getByRole("link", { name: /mail@digitaltableteur.com/i }),
    ).toHaveAttribute("href", "mailto:mail@digitaltableteur.com");
  });

  it("renders the business form in Finnish", () => {
    currentLanguage = "fi";
    render(<ImprintPage />);

    expect(screen.getByText("Yksityinen elinkeinonharjoittaja")).toBeInTheDocument();
  });
});
