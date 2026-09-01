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
        name: /transparent price tags/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 3, name: /design system lift-off/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /book ux sprint/i })).toHaveAttribute(
      "href",
      "/contact?mode=book&package=ux-sprint",
    );
    expect(
      screen.getByRole("link", { name: /book design system lift-off/i }),
    ).toHaveAttribute("href", "/contact?mode=book&package=design-system-lift-off");
    expect(
      screen.getByRole("button", { name: /aaas \(agents as a service\)/i }),
    ).toHaveAttribute("aria-expanded", "false");
  });

  it("has no accessibility violations", async () => {
    const { container } = renderPricing();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
