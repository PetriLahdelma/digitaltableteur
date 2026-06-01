import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { I18nextProvider } from "react-i18next";
import i18n from "../../../../i18n/config";
import { NewsBulletin } from "./NewsBulletin";
import type { NewsBulletinItem } from "@/nextjs-app/shared/data/news-bulletin";

const sampleItems: NewsBulletinItem[] = [
  {
    id: "a",
    badge: {
      src: "/images/news-bulletin/go-24.svg",
      alt: "Award A1",
      width: 88,
      height: 56,
    },
    body: "Internal link item",
    link: { kind: "internal", href: "/blog" },
  },
  {
    id: "b",
    badge: {
      src: "/images/news-bulletin/go-23.svg",
      alt: "Award B2",
      width: 88,
      height: 56,
    },
    body: "External link item",
    link: { kind: "external", href: "https://example.com" },
  },
  {
    id: "c",
    badge: {
      src: "/images/news-bulletin/go-22.svg",
      alt: "Award C3",
      width: 88,
      height: 56,
    },
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
      screen.getByRole("link", { name: /award a1\. internal link item/i }),
    ).toHaveAttribute("href", "/blog");
    expect(
      screen.getByRole("link", { name: /award b2\. external link item/i }),
    ).toHaveAttribute("href", "https://example.com");
    expect(screen.getByText("Static item only")).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /static item only/i }),
    ).toBeNull();
  });
});
