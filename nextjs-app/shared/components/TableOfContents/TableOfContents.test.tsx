import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";

import { TableOfContents, type TOCItem } from "./TableOfContents";

expect.extend(toHaveNoViolations);

vi.mock("../../lib/translation", () => ({
  useTranslate: () => (_key: string, fallback?: string) => fallback ?? _key,
}));

const items: TOCItem[] = [
  { id: "intro", text: "Introduction", level: 2 },
  { id: "setup", text: "Setup", level: 3 },
  { id: "api", text: "API", level: 2 },
];

describe("TableOfContents", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("renders nothing for an empty item list", () => {
    const { container } = render(<TableOfContents items={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders a labelled navigation landmark", () => {
    render(<TableOfContents items={items} activeId="setup" />);

    expect(
      screen.getByRole("navigation", { name: "Table of Contents" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Setup" })).toHaveAttribute(
      "aria-current",
      "location",
    );
  });

  it("pins mobile disclosure aria-expanded and aria-controls", async () => {
    render(<TableOfContents items={items} />);
    const user = userEvent.setup();
    const toggle = screen.getByRole("button", { name: "Table of Contents" });
    const controlsId = toggle.getAttribute("aria-controls");

    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(controlsId).toBeTruthy();
    expect(document.getElementById(controlsId as string)).toBeInTheDocument();

    await user.click(toggle);

    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(toggle).toHaveAttribute("aria-controls", controlsId);
  });

  it("calls onItemClick with the selected heading id and collapses", async () => {
    const onItemClick = vi.fn();
    render(<TableOfContents items={items} onItemClick={onItemClick} />);
    const user = userEvent.setup();
    const toggle = screen.getByRole("button", { name: "Table of Contents" });

    await user.click(toggle);
    await user.click(screen.getByRole("button", { name: "API" }));

    expect(onItemClick).toHaveBeenCalledTimes(1);
    expect(onItemClick).toHaveBeenCalledWith("api");
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  it("scrolls to the matching heading when no callback is supplied", async () => {
    const scrollIntoView = vi.fn();
    const heading = document.createElement("h2");
    heading.id = "api";
    heading.scrollIntoView = scrollIntoView;
    document.body.appendChild(heading);

    render(<TableOfContents items={items} />);
    await userEvent.click(screen.getByRole("button", { name: "API" }));

    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "start",
    });
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <TableOfContents items={items} activeId="intro" />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
