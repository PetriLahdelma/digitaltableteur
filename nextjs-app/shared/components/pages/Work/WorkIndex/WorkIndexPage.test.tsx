import { afterEach, describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { i18n, renderWithProviders } from "../../../../../../test-utils/render";
import { WorkIndexPage } from "./WorkIndexPage";

describe("WorkIndexPage", () => {
  afterEach(async () => {
    await i18n.changeLanguage("en");
  });

  it("renders page title", () => {
    renderWithProviders(<WorkIndexPage />);
    expect(
      screen.getByRole("heading", { name: /Selected projects/i }),
    ).toBeInTheDocument();
  });

  it("renders work examples", () => {
    renderWithProviders(<WorkIndexPage />);
    expect(screen.getByText(/Helsinki Design System/i)).toBeInTheDocument();
  });

  it("renders project links", () => {
    const { container } = renderWithProviders(<WorkIndexPage />);
    const projectLinks = screen.getAllByRole("link", {
      name: /design system|knobsmith|vertaaux/i,
    });
    expect(projectLinks.length).toBeGreaterThan(0);
    expect(container.querySelector("main")).toBeNull();
  });

  it("marks English project copy while keeping the localized status language", async () => {
    await i18n.changeLanguage("fi");
    renderWithProviders(<WorkIndexPage />);

    expect(screen.getAllByText("Tulossa pian").length).toBeGreaterThan(0);
    expect(screen.getByText("KnobSmith Audio")).toHaveAttribute("lang", "en");
    expect(screen.getAllByText("Tulossa pian")[0]).not.toHaveAttribute(
      "lang",
      "en",
    );
  });
});
