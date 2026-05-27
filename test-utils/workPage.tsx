import type { ReactElement } from "react";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "./render";

/** Shared render for work/case-study pages under test. */
export function renderWorkPage(ui: React.ReactElement) {
  return renderWithProviders(ui);
}

export function expectBackToWorkLink() {
  expect(
    screen.getByRole("link", { name: /Back to work/i }),
  ).toBeInTheDocument();
}

export function expectProjectNotFound() {
  expect(screen.getByText(/Project not found/i)).toBeInTheDocument();
}
