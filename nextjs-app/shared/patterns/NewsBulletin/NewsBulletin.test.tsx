import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { I18nextProvider } from "react-i18next";
import i18n from "../../../../i18n/config";
import { NewsBulletin } from "./NewsBulletin";
import {
  NEWS_BULLETIN_ITEMS,
  type NewsBulletinItem,
} from "@/nextjs-app/shared/data/news-bulletin";

const sampleItems: NewsBulletinItem[] = [
  {
    id: "a",
    badge: { kind: "percent", value: "50%" },
    body: "Internal link item",
    link: { kind: "internal", href: "/blog" },
  },
  {
    id: "b",
    badge: { kind: "npm", version: "v1.0.0" },
    body: "External link item",
    link: { kind: "external", href: "https://example.com" },
  },
  {
    id: "c",
    badge: { kind: "placeholder" },
    body: "Static item only",
    link: { kind: "static" },
  },
];

function renderBulletin(items = sampleItems) {
  return render(
    <I18nextProvider i18n={i18n}>
      <NewsBulletin items={items} />
    </I18nextProvider>,
  );
}

describe("NewsBulletin", () => {
  it("renders three items with correct link semantics", () => {
    renderBulletin();

    expect(
      screen.getByRole("region", { name: /current highlights/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /50%\. internal link item/i }),
    ).toHaveAttribute("href", "/blog");
    expect(
      screen.getByRole("link", { name: /npm v1\.0\.0\. external link item/i }),
    ).toHaveAttribute("href", "https://example.com");
    expect(screen.getByText("Static item only")).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /static item only/i }),
    ).toBeNull();
  });

  it("renders production copy from Figma", () => {
    renderBulletin(NEWS_BULLETIN_ITEMS);

    expect(
      screen.getByRole("link", {
        name: /2027\. now booking for q1/i,
      }),
    ).toHaveAttribute("href", "/contact");
    expect(screen.getByText("Rhythmguard 2.0 out now")).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: /vertaaux\. 2026 state of digital accessibility/i,
      }),
    ).toHaveAttribute(
      "href",
      "https://vertaaux.ai/articles/state-of-digital-accessibility-2026-eu",
    );
    expect(
      screen.getByRole("link", { name: /rhythmguard 2\.0 out now/i }),
    ).toHaveAttribute(
      "href",
      "https://www.npmjs.com/package/stylelint-plugin-rhythmguard",
    );
  });
});
