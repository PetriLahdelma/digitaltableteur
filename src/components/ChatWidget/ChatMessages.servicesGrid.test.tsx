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
  it("renders exactly one ServicesGrid when keyword triggers heuristic", () => {
    renderWithProviders([
      assistantMsg("Our services include design and development."),
    ]);
    const grids = screen.getAllByTestId("services-grid");
    expect(grids.length).toBe(1);
    const icons = screen.getAllByTestId("services-grid-icon");
    expect(icons.length).toBe(4);
  });

  it("renders explicit token without heuristic duplication", () => {
    renderWithProviders([
      assistantMsg(
        "Here is an overview:\n\n[[servicesGrid]]\nWe also do custom work.",
      ),
    ]);
    const grids = screen.getAllByTestId("services-grid");
    expect(grids.length).toBe(1);
  });

  it("renders multiple tokens if explicitly repeated", () => {
    renderWithProviders([
      assistantMsg("[[servicesGrid]] and again [[servicesGrid]]"),
    ]);
    const grids = screen.getAllByTestId("services-grid");
    // Dedup logic now limits to a single ServicesGrid per message even if multiple tokens.
    expect(grids.length).toBe(1);
  });

  it("does not inject heuristic when token present in same message", () => {
    renderWithProviders([
      assistantMsg(
        "Our services: [[servicesGrid]] design, strategy, and more services.",
      ),
    ]);
    const grids = screen.getAllByTestId("services-grid");
    expect(grids.length).toBe(1);
  });

  it("does not render grid for user keyword-only message", () => {
    renderWithProviders([
      userMsg("Tell me about your services and capabilities"),
    ]);
    const grids = screen.queryAllByTestId("services-grid");
    expect(grids.length).toBe(0);
  });

  it("does not render grid for user explicit token message", () => {
    renderWithProviders([userMsg("[[servicesGrid]] please show services")]);
    const grids = screen.queryAllByTestId("services-grid");
    expect(grids.length).toBe(0);
  });
});
