import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import enTranslations from "@/nextjs-app/shared/locales/en/translation.json";
import fiTranslations from "@/nextjs-app/shared/locales/fi/translation.json";
import svTranslations from "@/nextjs-app/shared/locales/sv/translation.json";
import { ToastRuntimeProvider } from "@/nextjs-app/shared/lib/toast";
import { TranslationProvider } from "@/nextjs-app/shared/lib/translation";
import { LanguageNotice } from "./LanguageNotice";

const bundles = {
  en: enTranslations,
  fi: fiTranslations,
  sv: svTranslations,
} as const;

function renderNotice({
  contentLanguage = "en",
  resolvedLanguage,
  showToast = vi.fn(),
}: {
  contentLanguage?: string;
  resolvedLanguage: keyof typeof bundles;
  showToast?: ReturnType<typeof vi.fn>;
}) {
  render(
    <TranslationProvider
      language={resolvedLanguage}
      resolvedLanguage={resolvedLanguage}
      getResourceBundle={(language) =>
        bundles[language as keyof typeof bundles]
      }
    >
      <ToastRuntimeProvider value={{ showToast }}>
        <LanguageNotice contentLanguage={contentLanguage} />
      </ToastRuntimeProvider>
    </TranslationProvider>,
  );

  return { showToast };
}

describe("LanguageNotice", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("announces direct English-only article visits in the current UI language", async () => {
    const { showToast } = renderNotice({ resolvedLanguage: "fi" });

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith(
        "Tämä sisältö on saatavilla vain englanniksi.",
        { duration: 5000 },
      );
    });
  });

  it("does not announce when content and UI language match", async () => {
    const { showToast } = renderNotice({ resolvedLanguage: "en" });

    await waitFor(() => {
      expect(showToast).not.toHaveBeenCalled();
    });
  });
});
