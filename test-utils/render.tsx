import React, { type ReactElement, type ReactNode } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import type { i18n as I18n } from "i18next";
import i18n from "@/nextjs-app/shared/i18n";
import { I18nProvider } from "../providers/I18nProvider";

const testI18n = i18n as unknown as I18n;

type WrapperProps = { children: ReactNode };

function AllProviders({ children }: WrapperProps) {
  return <I18nProvider>{children}</I18nProvider>;
}

/** Render with real i18n, theme, and animation context (matches production shell). */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) {
  return render(ui, { wrapper: AllProviders, ...options });
}

export { i18n };
