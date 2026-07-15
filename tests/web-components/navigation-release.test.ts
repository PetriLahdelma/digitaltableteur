import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { DtLinkElement } from "../../packages/web-components/src/native/link";
import { DtNavLinkElement } from "../../packages/web-components/src/native/nav-link";

beforeAll(() => {
  if (!customElements.get("dt-link")) {
    customElements.define("dt-link", DtLinkElement);
  }
  if (!customElements.get("dt-nav-link")) {
    customElements.define("dt-nav-link", DtNavLinkElement);
  }
});

afterEach(() => {
  document.body.replaceChildren();
  document.documentElement.removeAttribute("lang");
});

describe("native navigation release regressions", () => {
  it.each([
    { lang: "en", expected: "External link" },
    { lang: "fi", expected: "Ulkoinen linkki" },
    { lang: "sv", expected: "Extern länk" },
  ])(
    "localizes the external-link announcement for %s hosts",
    ({ lang, expected }) => {
      const link = document.createElement("dt-link") as DtLinkElement;
      link.lang = lang;
      link.href = "https://example.com/docs";
      link.label = "Documentation";
      document.body.append(link);

      expect(
        link.shadowRoot?.querySelector("dt-icon")?.getAttribute("aria-label"),
      ).toBe(expected);
    },
  );

  it("prefers explicit host overrides over locale defaults", () => {
    const link = document.createElement("dt-link") as DtLinkElement;
    link.lang = "fi";
    link.href = "https://example.com/docs";
    link.label = "Documentation";
    link.setAttribute("external-label-fi", "Poistut sivustolta");
    link.setAttribute("external-label", "Leaves the product");
    document.body.append(link);

    expect(
      link.shadowRoot?.querySelector("dt-icon")?.getAttribute("aria-label"),
    ).toBe("Leaves the product");
  });

  it("forwards hreflang and referrerpolicy using the standard attribute names", () => {
    const link = document.createElement("dt-link") as DtLinkElement;
    link.href = "https://example.com/docs";
    link.label = "Documentation";
    link.hrefLang = "sv";
    link.referrerPolicy = "no-referrer";
    document.body.append(link);

    const anchor = link.shadowRoot?.querySelector("a");
    expect(anchor).toHaveAttribute("hreflang", "sv");
    expect(anchor).toHaveAttribute("referrerpolicy", "no-referrer");
  });

  it("keeps active current-page nav links on the configured size and underline classes", () => {
    const link = document.createElement("dt-nav-link") as DtNavLinkElement;
    link.href = "/work";
    link.label = "Work";
    link.currentPath = "/work";
    link.size = "lg";
    link.underline = "always";
    document.body.append(link);

    const current = link.shadowRoot?.querySelector("span[part='current']");
    expect(link.shadowRoot?.querySelector("dt-link")).toBeNull();
    expect(current).toHaveAttribute("aria-current", "page");
    expect(current?.className).toContain("lg");
    expect(current?.className).toContain("always");
  });
});
