import { afterEach, describe, it, expect } from "vitest";
import { fireEvent, screen, within } from "@testing-library/react";
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
    expect(screen.getAllByText(/Helsinki Design System/i).length).toBeGreaterThan(0);
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
    for (const title of screen.getAllByText("KnobSmith Audio")) {
      expect(title).toHaveAttribute("lang", "en");
    }
    expect(screen.getAllByText("Tulossa pian")[0]).not.toHaveAttribute(
      "lang",
      "en",
    );
  });

  it("offers a Cards and List view toggle and shows the project count", () => {
    renderWithProviders(<WorkIndexPage />);
    // One toggle per breakpoint (list default on phones, cards from tablet up).
    const groups = screen.getAllByRole("radiogroup", { name: "Project view" });
    expect(groups).toHaveLength(2);
    expect(within(groups[0]!).getByRole("radio", { name: "List" })).toHaveAttribute("aria-checked", "true");
    expect(within(groups[1]!).getByRole("radio", { name: "Cards" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByText(/^\d+ projects$/)).toBeInTheDocument();
  });

  it("keeps a picked view in the URL and storage, on both toggles", () => {
    window.localStorage.removeItem("dt-work-view");
    renderWithProviders(<WorkIndexPage />);
    const [phone] = screen.getAllByRole("radiogroup", { name: "Project view" });
    fireEvent.click(within(phone!).getByRole("radio", { name: "Cards" }));
    expect(window.location.search).toBe("?view=cards");
    expect(window.localStorage.getItem("dt-work-view")).toBe("cards");
    for (const group of screen.getAllByRole("radiogroup", { name: "Project view" })) {
      expect(within(group).getByRole("radio", { name: "Cards" })).toHaveAttribute("aria-checked", "true");
    }
    window.history.replaceState(null, "", "/");
    window.localStorage.removeItem("dt-work-view");
  });

  it("lists every project as a row linking to its case study", () => {
    renderWithProviders(<WorkIndexPage />);
    // The card grid and the row list share the name; only one is displayed.
    const rows = screen
      .getAllByRole("list", { name: "Project gallery" })
      .find((list) => list.tagName === "UL")!;
    expect(within(rows).getAllByRole("link")[0]).toHaveAttribute("href");
  });
});
