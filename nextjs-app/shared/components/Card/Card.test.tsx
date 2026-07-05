import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import Card from "./Card";

describe("Card", () => {
  it("renders children on the default surface", () => {
    const { container } = render(<Card>Body</Card>);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("card");
    expect(el.className).toContain("default");
    expect(screen.getByText("Body")).toBeInTheDocument();
  });

  it("maps variant and padding to classes", () => {
    const { container } = render(
      <Card variant="muted" padding="lg">
        x
      </Card>,
    );
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("muted");
    expect(el.className).toContain("paddingLg");
    expect(el.className).not.toContain("default");
  });

  it("renders the title as a level-3 heading by default", () => {
    render(<Card title="Design tokens">x</Card>);
    expect(
      screen.getByRole("heading", { level: 3, name: "Design tokens" }),
    ).toBeInTheDocument();
  });

  it("honors titleProps.level for the document outline", () => {
    render(<Card title="Hero card" titleProps={{ level: 2 }}>x</Card>);
    expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
  });

  it("renders description and the extra slot", () => {
    render(
      <Card title="T" description="Supporting line" extra={<span>Meta</span>}>
        x
      </Card>,
    );
    expect(screen.getByText("Supporting line")).toBeInTheDocument();
    expect(screen.getByText("Meta")).toBeInTheDocument();
  });

  it("renders the semantic element from as", () => {
    const { container } = render(<Card as="article">x</Card>);
    expect((container.firstChild as HTMLElement).tagName).toBe("ARTICLE");
  });

  it("link mode renders exactly one anchor named by the title", () => {
    render(
      <Card title="Case study" link="/work/case-study">
        body
      </Card>,
    );
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAccessibleName("Case study");
    expect(links[0]).toHaveAttribute("href", "/work/case-study");
  });

  it("linkLabel overrides an ambiguous title as the accessible name", () => {
    render(
      <Card title="Read more" link="/blog/post" linkLabel="Read the launch post">
        body
      </Card>,
    );
    expect(screen.getByRole("link")).toHaveAccessibleName(
      "Read the launch post",
    );
  });

  it("link mode without a title still exposes one named anchor", () => {
    render(<Card link="/somewhere" linkLabel="Open somewhere">body</Card>);
    expect(screen.getByRole("link")).toHaveAccessibleName("Open somewhere");
  });

  it("does not decorate the card link with an underline (no site squiggle)", () => {
    render(
      <Card title="Case study" link="/work/x">
        body
      </Card>,
    );
    expect(screen.getByRole("link").className).toContain("cardLink");
  });

  it("loading replaces content with a skeleton and announces status", () => {
    const { container } = render(
      <Card loading title="Hidden while loading">
        Hidden body
      </Card>,
    );
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveAttribute("role", "status");
    expect(el).toHaveAttribute("aria-busy", "true");
    expect(screen.queryByText("Hidden body")).not.toBeInTheDocument();
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it("plain cards add no role and are not focusable", () => {
    const { container } = render(<Card>x</Card>);
    const el = container.firstChild as HTMLElement;
    expect(el).not.toHaveAttribute("role");
    expect(el).not.toHaveAttribute("tabindex");
  });

  it("defaults the header-start region to the title heading", () => {
    render(<Card title="Card title" />);
    expect(
      screen.getByRole("heading", { name: "Card title" }),
    ).toBeInTheDocument();
  });

  it("renders custom headerStart instead of the title block", () => {
    render(<Card headerStart={<span>Custom lead</span>} title="Ignored" />);
    expect(screen.getByText("Custom lead")).toBeInTheDocument();
    expect(screen.queryByText("Ignored")).not.toBeInTheDocument();
  });

  it("renders headerEnd content in the trailing region", () => {
    const { container } = render(
      <Card title="T" headerEnd={<span>badge-slot</span>} />,
    );
    expect(screen.getByText("badge-slot")).toBeInTheDocument();
    expect(container.querySelector('[class*="headerEnd"]')).toBeTruthy();
  });

  it("keeps the deprecated extra prop working as a headerEnd alias", () => {
    render(<Card title="T" extra={<span>legacy-extra</span>} />);
    expect(screen.getByText("legacy-extra")).toBeInTheDocument();
  });

  it("prefers headerEnd over extra when both are set", () => {
    render(
      <Card title="T" headerEnd={<span>new-end</span>} extra={<span>old-extra</span>} />,
    );
    expect(screen.getByText("new-end")).toBeInTheDocument();
    expect(screen.queryByText("old-extra")).not.toBeInTheDocument();
  });

  it("renders footerStart and footerEnd regions", () => {
    const { container } = render(
      <Card
        title="T"
        footerStart={<button type="button">Destroy</button>}
        footerEnd={<button type="button">Yes</button>}
      />,
    );
    expect(screen.getByRole("button", { name: "Destroy" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Yes" })).toBeInTheDocument();
    expect(container.querySelector('[class*="footerStart"]')).toBeTruthy();
    expect(container.querySelector('[class*="footerEnd"]')).toBeTruthy();
  });

  it("renders no footer when neither footer slot is set", () => {
    const { container } = render(<Card title="T">body</Card>);
    expect(container.querySelector('[class*="footer"]')).toBeNull();
  });

  it("renders footerEnd alone (buttons-only footer)", () => {
    const { container } = render(
      <Card title="T" footerEnd={<button type="button">Only</button>} />,
    );
    expect(container.querySelector('[class*="footerEnd"]')).toBeTruthy();
    expect(container.querySelector('[class*="footerStart"]')).toBeNull();
  });
});
