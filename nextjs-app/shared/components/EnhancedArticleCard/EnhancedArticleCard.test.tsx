import { afterEach, describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { i18n, renderWithProviders } from "../../../../test-utils/render";
import { EnhancedArticleCard } from "./EnhancedArticleCard";

describe("EnhancedArticleCard", () => {
  afterEach(async () => {
    await i18n.changeLanguage("en");
  });

  it("keeps localized action text separate from English article copy", async () => {
    await i18n.changeLanguage("fi");
    renderWithProviders(
      <EnhancedArticleCard
        slug="english-article"
        title="An English article"
        excerpt="An English summary."
        contentLanguage="en"
      />,
    );

    const link = screen.getByRole("link", {
      name: "An English article Lue artikkeli",
    });
    expect(
      screen.getByRole("heading", { name: "An English article" }),
    ).toHaveAttribute("lang", "en");
    expect(screen.getByText("An English summary.")).toHaveAttribute(
      "lang",
      "en",
    );
    expect(screen.getByText("Lue artikkeli")).not.toHaveAttribute("lang", "en");
    expect(link).toHaveAccessibleDescription("An English summary.");
  });
});
