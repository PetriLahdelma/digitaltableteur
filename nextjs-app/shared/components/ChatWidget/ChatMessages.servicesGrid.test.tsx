import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ChatMessages from "@dt/ChatWidget/ChatMessages";
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

describe("ChatMessages ServicesGrid injection (user-triggered only)", () => {
  it("does NOT render when assistant mentions services without prior user trigger", () => {
    renderWithProviders([
      assistantMsg("Can you list your services and capabilities?"),
    ]);
    expect(screen.queryByTestId("services-grid")).not.toBeInTheDocument();
  });

  it("injects after user heuristic query then assistant reply", () => {
    renderWithProviders([
      userMsg("What services do you provide?"),
      assistantMsg("We offer a comprehensive set."),
    ]);
    expect(screen.getByTestId("services-grid")).toBeInTheDocument();
  });

  it("injects after user explicit token then assistant reply (token sanitized in user part)", () => {
    renderWithProviders([
      userMsg("Show [[servicesGrid]] now"),
      assistantMsg("Here is the overview."),
    ]);
    expect(screen.getByTestId("services-grid")).toBeInTheDocument();
  });

  it("does NOT render for user explicit token without assistant follow-up", () => {
    renderWithProviders([userMsg("Show [[servicesGrid]] now")]);
    expect(screen.queryByTestId("services-grid")).not.toBeInTheDocument();
  });

  it("injects after Finnish user heuristic then assistant reply", () => {
    renderWithProviders([
      userMsg("Voitko kertoa palvelut?"),
      assistantMsg("Tässä palveluiden yleiskatsaus."),
    ]);
    expect(screen.getByTestId("services-grid")).toBeInTheDocument();
  });

  it("injects after Swedish user heuristic then assistant reply", () => {
    renderWithProviders([
      userMsg("Kan du lista era tjänster?"),
      assistantMsg("Här är en översikt."),
    ]);
    expect(screen.getByTestId("services-grid")).toBeInTheDocument();
  });

  it("sanitizes Swedish keyword + token in assistant when injected", () => {
    renderWithProviders([
      userMsg("Visa [[servicesGrid]]"),
      assistantMsg("Tjänster [[servicesGrid]] listas här."),
    ]);
    const comp = screen.getByTestId("services-grid");
    expect(comp).toBeInTheDocument();
    const assistantTexts = screen.getAllByText(/./);
    const joined = assistantTexts.map((n) => n.textContent || "").join(" ");
    expect(joined).not.toMatch(/\[\[servicesGrid\]\]/);
    expect(/tjänster/i.test(joined)).toBe(false);
  });

  it("sanitizes English keyword + token in assistant when injected", () => {
    renderWithProviders([
      userMsg("Show [[servicesGrid]]"),
      assistantMsg("Services [[servicesGrid]] overview."),
    ]);
    const comp = screen.getByTestId("services-grid");
    expect(comp).toBeInTheDocument();
    const assistantTexts = screen.getAllByText(/./);
    const joined = assistantTexts.map((n) => n.textContent || "").join(" ");
    expect(joined).not.toMatch(/\[\[servicesGrid\]\]/);
    expect(/services/i.test(joined)).toBe(false);
  });

  it("sanitizes Finnish keyword + token in assistant when injected", () => {
    renderWithProviders([
      userMsg("Näytä [[servicesGrid]]"),
      assistantMsg("Palvelut [[servicesGrid]] näkyvät alla."),
    ]);
    const comp = screen.getByTestId("services-grid");
    expect(comp).toBeInTheDocument();
    const assistantTexts = screen.getAllByText(/./);
    const joined = assistantTexts.map((n) => n.textContent || "").join(" ");
    expect(joined).not.toMatch(/\[\[servicesGrid\]\]/);
    expect(/palvelut/i.test(joined)).toBe(false);
  });
});
