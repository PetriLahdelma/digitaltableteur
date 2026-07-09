import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  TranslationProvider,
  useTranslate,
  useLocalization,
  type Translate,
} from "./translation";

function TranslationProbe({
  fallback,
  options,
}: {
  fallback?: string;
  options?: Parameters<Translate>[1];
}) {
  const t = useTranslate();
  return <span>{t("component.label", fallback ?? options)}</span>;
}

function RuntimeProbe() {
  const runtime = useLocalization();
  return (
    <span>
      {runtime.language}:{runtime.resolvedLanguage}:
      {String(runtime.getResourceBundle(runtime.language)?.label ?? "")}
    </span>
  );
}

function DefaultTranslationProbe() {
  const t = useTranslate();
  return <span>{t("authorBio.ariaLabel", { name: "Petri" })}</span>;
}

function ExternalBridgeProbe() {
  const t = useTranslate();
  const runtime = useLocalization();
  return (
    <span data-testid="bridge-probe">
      {runtime.language}:{t("component.label")}
    </span>
  );
}

describe("translation", () => {
  it("uses bundled English translations without a provider", () => {
    render(<DefaultTranslationProbe />);
    expect(screen.getByText("About Petri")).toBeInTheDocument();
  });

  it("uses the explicit fallback string without a provider", () => {
    render(<TranslationProbe fallback="Fallback label" />);
    expect(screen.getByText("Fallback label")).toBeInTheDocument();
  });

  it("uses defaultValue options without a provider", () => {
    render(<TranslationProbe options={{ defaultValue: "Default label" }} />);
    expect(screen.getByText("Default label")).toBeInTheDocument();
  });

  it("falls back to the key when no fallback is available", () => {
    render(<TranslationProbe />);
    expect(screen.getByText("component.label")).toBeInTheDocument();
  });

  it("uses the injected translator when a provider is present", () => {
    const translate: Translate = (key, fallbackOrOptions) =>
      `${key}:${typeof fallbackOrOptions === "string" ? fallbackOrOptions : ""}`;

    render(
      <TranslationProvider translate={translate}>
        <TranslationProbe fallback="Injected label" />
      </TranslationProvider>,
    );

    expect(screen.getByText("component.label:Injected label")).toBeInTheDocument();
  });

  it("exposes injected language runtime state", () => {
    render(
      <TranslationProvider
        language="fi"
        resolvedLanguage="fi-FI"
        getResourceBundle={() => ({ label: "Suomi" })}
      >
        <RuntimeProbe />
      </TranslationProvider>,
    );

    expect(screen.getByText("fi:fi-FI:Suomi")).toBeInTheDocument();
  });

  it("notifies bridge consumers when the injected runtime changes", async () => {
    const translateEn: Translate = () => "English label";
    const translateFi: Translate = () => "Suomi label";

    const provider = render(
      <TranslationProvider
        translate={translateEn}
        language="en"
        resolvedLanguage="en"
      >
        <span />
      </TranslationProvider>,
    );

    render(<ExternalBridgeProbe />);
    expect(screen.getByTestId("bridge-probe")).toHaveTextContent(
      "en:English label",
    );

    provider.rerender(
      <TranslationProvider
        translate={translateFi}
        language="fi"
        resolvedLanguage="fi"
      >
        <span />
      </TranslationProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("bridge-probe")).toHaveTextContent(
        "fi:Suomi label",
      );
    });
  });

  it("re-renders translate consumers when only the language changes", async () => {
    let label = "English label";
    const translate: Translate = () => label;

    const view = render(
      <TranslationProvider
        translate={translate}
        language="en"
        resolvedLanguage="en"
      >
        <TranslationProbe />
      </TranslationProvider>,
    );

    expect(screen.getByText("English label")).toBeInTheDocument();

    label = "Suomi label";
    view.rerender(
      <TranslationProvider
        translate={translate}
        language="fi"
        resolvedLanguage="fi"
      >
        <TranslationProbe />
      </TranslationProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Suomi label")).toBeInTheDocument();
    });
  });
});
