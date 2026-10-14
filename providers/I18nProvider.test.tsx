import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import i18n from "../i18n/config";
import {
  useLocalization,
  useTranslate,
} from "../nextjs-app/shared/lib/translation";
import { I18nProvider } from "./I18nProvider";

function clearLanguageCookie() {
  document.cookie = "i18next=; max-age=0; path=/";
}

function setLanguageCookie(language: string) {
  document.cookie = `i18next=${language}; path=/; max-age=31536000`;
}

function getLanguageCookie() {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith("i18next="));
}

function LanguageProbe() {
  const { resolvedLanguage, changeLanguage } = useLocalization();

  return (
    <>
      <output data-testid="language">
        {resolvedLanguage.split("-")[0] ?? "en"}
      </output>
      <button type="button" onClick={() => void changeLanguage("en")}>
        English
      </button>
    </>
  );
}

describe("I18nProvider", () => {
  beforeEach(async () => {
    clearLanguageCookie();
    window.localStorage.clear();
    await i18n.changeLanguage("en");
  });

  afterEach(async () => {
    clearLanguageCookie();
    window.localStorage.clear();
    await i18n.changeLanguage("en");
  });

  it("returns arrays structurally for returnObjects lookups (hero randomization)", async () => {
    // Regression: the translate wrapper String()-coerced non-string i18next
    // results, so HomeHero's homeHeroGradientTitleOptions array arrived as
    // joined text and per-visit title randomization silently died.
    let captured: unknown;
    function ReturnObjectsProbe() {
      const t = useTranslate();
      captured = t("homeHeroGradientTitleOptions", {
        returnObjects: true,
        defaultValue: [],
      }) as unknown;
      return null;
    }

    render(
      <I18nProvider>
        <ReturnObjectsProbe />
      </I18nProvider>,
    );

    await waitFor(() => {
      expect(Array.isArray(captured)).toBe(true);
    });
    expect((captured as string[]).length).toBeGreaterThan(1);
    for (const entry of captured as unknown[]) {
      expect(typeof entry).toBe("string");
    }
  });

  it("translates with the committed language, not the live i18n singleton", async () => {
    // Regression (2026-10-14): the persisted language is applied in an effect.
    // A Suspense boundary that hydrated after that effect (BlogIndexContent)
    // read the already-switched singleton and rendered "Ajatuksia" against
    // server HTML "Thoughts", a hydration mismatch. A translate captured from a
    // committed render must keep that render's language until React re-renders.
    let latestT: ReturnType<typeof useTranslate> | undefined;
    function TitleProbe() {
      const t = useTranslate();
      latestT = t;
      return <output data-testid="title">{t("blogHeroTitle")}</output>;
    }

    render(
      <I18nProvider>
        <TitleProbe />
      </I18nProvider>,
    );
    expect(screen.getByTestId("title").textContent).toBe("Thoughts");

    const committedT = latestT!;
    await i18n.changeLanguage("fi");
    expect(committedT("blogHeroTitle")).toBe("Thoughts");

    // The switch still reaches the UI as a normal React update.
    await waitFor(() => {
      expect(screen.getByTestId("title").textContent).toBe("Ajatuksia");
    });
  });

  it("persists a user language switch across provider remounts", async () => {
    setLanguageCookie("fi");
    window.localStorage.setItem("i18nextLng", "fi");

    const { unmount } = render(
      <I18nProvider>
        <LanguageProbe />
      </I18nProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("language")).toHaveTextContent("fi");
    });

    await userEvent.click(screen.getByRole("button", { name: "English" }));

    await waitFor(() => {
      expect(screen.getByTestId("language")).toHaveTextContent("en");
    });

    expect(getLanguageCookie()).toBe("i18next=en");
    expect(window.localStorage.getItem("i18nextLng")).toBe("en");

    unmount();
    await i18n.changeLanguage("fi");

    render(
      <I18nProvider>
        <LanguageProbe />
      </I18nProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("language")).toHaveTextContent("en");
    });
  });

  it("uses localStorage before a stale language cookie", async () => {
    setLanguageCookie("fi");
    window.localStorage.setItem("i18nextLng", "en");
    await i18n.changeLanguage("fi");

    render(
      <I18nProvider>
        <LanguageProbe />
      </I18nProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("language")).toHaveTextContent("en");
    });
  });
});
