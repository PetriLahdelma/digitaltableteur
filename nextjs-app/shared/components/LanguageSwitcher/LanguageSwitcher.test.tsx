import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nextProvider } from "react-i18next";
import i18n from "../../i18n";
import { LanguageSwitcher } from "./LanguageSwitcher";

const languages = [
  { code: "en", label: "EN", ariaLabel: "English" },
  { code: "fi", label: "FI", ariaLabel: "Finnish" },
  { code: "sv", label: "SV", ariaLabel: "Swedish" },
];

function renderSwitcher(currentLang = "en") {
  const onLanguageChange = vi.fn();
  render(
    <I18nextProvider i18n={i18n}>
      <LanguageSwitcher
        languages={languages}
        currentLang={currentLang}
        onLanguageChange={onLanguageChange}
      />
    </I18nextProvider>,
  );
  return { onLanguageChange };
}

describe("LanguageSwitcher", () => {
  it("shows only the current language by default", () => {
    renderSwitcher("en");
    expect(
      screen.getByRole("button", { name: /english/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /^finnish$/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /^swedish$/i }),
    ).not.toBeInTheDocument();
  });

  it("fans out other languages on trigger click", async () => {
    renderSwitcher("en");
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /english/i }));

    expect(screen.getByRole("button", { name: /^finnish$/i })).toBeVisible();
    expect(screen.getByRole("button", { name: /^swedish$/i })).toBeVisible();
    expect(screen.getByText("FI")).toBeVisible();
    expect(screen.getByText("SV")).toBeVisible();
  });

  it("changes language and collapses when an option is chosen", async () => {
    const { onLanguageChange } = renderSwitcher("en");
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /english/i }));
    await user.click(screen.getByRole("button", { name: /^finnish$/i }));

    expect(onLanguageChange).toHaveBeenCalledWith("fi");
    expect(
      screen.queryByRole("button", { name: /^swedish$/i }),
    ).not.toBeInTheDocument();
  });
});
