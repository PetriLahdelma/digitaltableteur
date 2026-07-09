import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import i18n from "../i18n/config";
import { useLocalization } from "../nextjs-app/shared/lib/translation";
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
