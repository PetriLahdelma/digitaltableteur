import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ChatMessages from "./ChatMessages";
import { I18nextProvider } from "react-i18next";
import i18n from "../../i18n";
import en from "../../locales/en/translation.json";

if (!i18n.isInitialized) {
  i18n.init({
    resources: { en: { translation: en as any } },
    lng: "en",
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });
}

const assistantMsg = (text: string) => ({
  id: Math.random().toString(36).slice(2),
  role: "assistant" as const,
  parts: [{ type: "text", text }],
});

const userMsg = (text: string) => ({
  id: Math.random().toString(36).slice(2),
  role: "user" as const,
  parts: [{ type: "text", text }],
});

const renderWithProviders = (messages: any[]) => {
  return render(
    <I18nextProvider i18n={i18n}>
      <ChatMessages messages={messages} isStreaming={false} />
    </I18nextProvider>,
  );
};

describe("ChatMessages ServicesGrid injection", () => {
  it("renders ServicesGrid for assistant explicit token", () => {
    renderWithProviders([assistantMsg("Here they are: [[servicesGrid]]")]);
    expect(screen.getByTestId("services-grid")).toBeInTheDocument();
  });

  it("renders ServicesGrid for assistant heuristic mention", () => {
    renderWithProviders([
      assistantMsg("Can you list your services and capabilities?"),
    ]);
    expect(screen.getByTestId("services-grid")).toBeInTheDocument();
  });

  it("does NOT render ServicesGrid for user explicit token", () => {
    renderWithProviders([userMsg("Show [[servicesGrid]] now")]);
    expect(screen.queryByTestId("services-grid")).not.toBeInTheDocument();
  });

  it("does NOT render ServicesGrid for user heuristic mention", () => {
    renderWithProviders([userMsg("What services do you provide?")]);
    expect(screen.queryByTestId("services-grid")).not.toBeInTheDocument();
  });
});
