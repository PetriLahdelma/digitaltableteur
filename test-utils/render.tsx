import React, { type ReactElement, type ReactNode } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import type { i18n as I18n } from "i18next";
import { I18nextProvider } from "react-i18next";
import i18n from "@/nextjs-app/shared/i18n";

const testI18n = i18n as unknown as I18n;

type WrapperProps = { children: ReactNode };

function AllProviders({ children }: WrapperProps) {
  return <I18nextProvider i18n={testI18n}>{children}</I18nextProvider>;
}

/** Render with real i18n, theme, and animation context (matches production shell). */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) {
  return render(ui, { wrapper: AllProviders, ...options });
}

export { i18n };
