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

describe("ChatMessages OpenHours injection", () => {
  it("renders OpenHours for assistant heuristic mention", () => {
    renderWithProviders([
      assistantMsg("Can you tell me your open hours and closing time?"),
    ]);
    expect(screen.getByTestId("open-hours")).toBeInTheDocument();
  });

  it("renders OpenHours for assistant explicit token", () => {
    renderWithProviders([assistantMsg("Here they are: [[openHours]]")]);
    expect(screen.getByTestId("open-hours")).toBeInTheDocument();
  });

  it("does NOT render OpenHours for user heuristic mention", () => {
    renderWithProviders([userMsg("What are your open hours today?")]);
    expect(screen.queryByTestId("open-hours")).not.toBeInTheDocument();
  });

  it("does NOT render OpenHours for user explicit token", () => {
    renderWithProviders([userMsg("Please show [[openHours]] now")]);
    expect(screen.queryByTestId("open-hours")).not.toBeInTheDocument();
  });
});
