import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ChatMessages from "@dt/ChatMessages";
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

const dummyDispatch = () => {};
const idleWorkflow = { step: "idle" } as any;
const renderWithProviders = (messages: any[], workflow: any = idleWorkflow) => {
  return render(
    <I18nextProvider i18n={i18n}>
      <ChatMessages
        messages={messages}
        isStreaming={false}
        emailWorkflow={workflow}
        dispatchEmailWorkflow={dummyDispatch}
      />
    </I18nextProvider>,
  );
};

describe("ChatMessages OpenHours injection (user-triggered only)", () => {
  it("does NOT render when assistant mentions hours without prior user trigger", () => {
    renderWithProviders([
      assistantMsg("Can you tell me your open hours and closing time?"),
    ]);
    expect(screen.queryByTestId("open-hours")).not.toBeInTheDocument();
  });

  it("injects after user heuristic query then assistant reply", () => {
    renderWithProviders([
      userMsg("What are your open hours today?"),
      assistantMsg("Our studio operates weekdays."),
    ]);
    expect(screen.getByTestId("open-hours")).toBeInTheDocument();
  });

  it("injects after user explicit token then assistant reply (token sanitized in user part)", () => {
    renderWithProviders([
      userMsg("Please show [[openHours]] now"),
      assistantMsg("Certainly, here they are."),
    ]);
    expect(screen.getByTestId("open-hours")).toBeInTheDocument();
  });

  it("does NOT render for user explicit token without assistant follow-up", () => {
    renderWithProviders([userMsg("Please show [[openHours]] now")]);
    expect(screen.queryByTestId("open-hours")).not.toBeInTheDocument();
  });

  it("injects after Finnish user heuristic then assistant reply", () => {
    renderWithProviders([
      userMsg("Mitkä ovat tämän päivän aukioloajat?"),
      assistantMsg("Voin kertoa aukioloajat."),
    ]);
    expect(screen.getByTestId("open-hours")).toBeInTheDocument();
  });

  it("injects after Swedish user heuristic then assistant reply", () => {
    renderWithProviders([
      userMsg("Vilka är dagens öppettider?"),
      assistantMsg("Här kommer tiderna."),
    ]);
    expect(screen.getByTestId("open-hours")).toBeInTheDocument();
  });

  it("sanitizes Finnish keyword + token in assistant when injected", () => {
    renderWithProviders([
      userMsg("Näytä [[openHours]]"),
      assistantMsg("Aukioloajat [[openHours]] ovat tässä."),
    ]);
    const comp = screen.getByTestId("open-hours");
    expect(comp).toBeInTheDocument();
    const assistantTexts = screen.getAllByText(/./); // grab all text nodes
    const joined = assistantTexts.map((n) => n.textContent || "").join(" ");
    expect(joined).not.toMatch(/\[\[openHours\]\]/);
    expect(/aukioloajat/i.test(joined)).toBe(false);
  });

  it("sanitizes English keyword + token in assistant when injected", () => {
    renderWithProviders([
      userMsg("Please show [[openHours]]"),
      assistantMsg("Open hours [[openHours]] are shown."),
    ]);
    const comp = screen.getByTestId("open-hours");
    expect(comp).toBeInTheDocument();
    // Find the assistant raw text node (excluding component content)
    const rawAssistant = screen.getAllByText(/are shown\./i)[0];
    const raw = rawAssistant.textContent || "";
    expect(raw).not.toMatch(/\[\[openHours\]\]/);
    expect(/open\s*hours/i.test(raw)).toBe(false);
  });
});
