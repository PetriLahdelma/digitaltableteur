import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { I18nextProvider } from "react-i18next";

import i18n from "../../i18n";
import { PricingPageContent } from "./PricingPageContent";

function renderPricing() {
  return render(
    <I18nextProvider i18n={i18n}>
      <PricingPageContent />
    </I18nextProvider>
  );
}

describe("PricingPageContent", () => {
  it("renders hero and package cards", () => {
    renderPricing();
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /design systems/i,
      })
    ).toBeInTheDocument();
    expect(screen.getByText(/Design System Lift-Off/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /book a call/i })).toHaveAttribute(
      "href",
      "/contact"
    );
  });

  it("has no accessibility violations", async () => {
    const { container } = renderPricing();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
