import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { ArticleShareSection } from "./ArticleShareSection";

expect.extend(toHaveNoViolations);

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback ?? key,
  }),
}));

const props = {
  url: "https://digitaltableteur.com/blog/designing-in-2025",
  title: "Designing in 2025",
};

describe("ArticleShareSection", () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
  });

  it("renders labelled share links pointing at the encoded url", () => {
    render(<ArticleShareSection {...props} />);
    const x = screen.getByRole("link", { name: "Share on X" });
    const linkedin = screen.getByRole("link", { name: "Share on LinkedIn" });
    const facebook = screen.getByRole("link", { name: "Share on Facebook" });
    expect(x).toHaveAttribute("href", expect.stringContaining(encodeURIComponent(props.url)));
    expect(linkedin).toHaveAttribute("target", "_blank");
    expect(facebook).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("copies the url to the clipboard and confirms", async () => {
    render(<ArticleShareSection {...props} />);
    await userEvent.click(screen.getByRole("button", { name: "Copy link" }));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(props.url);
    await waitFor(() =>
      expect(screen.getByText("Link copied!")).toBeInTheDocument(),
    );
  });

  it("hides the section title when showTitle is false", () => {
    render(<ArticleShareSection {...props} showTitle={false} />);
    expect(
      screen.queryByRole("heading", { name: /share this article/i }),
    ).not.toBeInTheDocument();
  });

  it("renders the section title by default", () => {
    render(<ArticleShareSection {...props} />);
    expect(
      screen.getByRole("heading", { name: /share this article/i }),
    ).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = render(<ArticleShareSection {...props} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations in the vertical layout", async () => {
    const { container } = render(<ArticleShareSection {...props} layout="vertical" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
