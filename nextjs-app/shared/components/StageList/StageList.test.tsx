import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { StageList, type StageListProps } from "./StageList";

expect.extend(toHaveNoViolations);

const stages: StageListProps["stages"] = [
  { id: "scoping", label: "Scoping" },
  { id: "review", label: "Design review", phrase: "design review" },
  { id: "rc", label: "Release candidate", phrase: "release candidate" },
  { id: "launch", label: "Launch", phrase: "launch" },
];

const phases: StageListProps["phases"] = [
  { label: "Before you build", stages: ["scoping", "review"] },
  { label: "Before you ship", stages: ["rc", "launch"] },
];

const items: StageListProps["items"] = [
  {
    id: "forms",
    title: "Forms with error handling",
    lead: "Screen reader, voice control and magnifier users",
    description: "Give them a task that triggers every error state.",
    stages: ["rc"],
    tag: "design system team",
  },
  {
    id: "login",
    title: "Login, signup and verification",
    lead: "People with memory and attention disabilities",
    description: "Give them test accounts.",
    stages: ["review", "rc", "launch"],
    tag: "product team",
  },
  {
    id: "sign",
    title: "Content in sign language",
    lead: "Deaf signers and qualified interpreters",
    stages: ["scoping"],
  },
];

const props = { items, stages, phases };

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

describe("StageList sheet (default)", () => {
  it("heads each phase and each stage, one level apart", () => {
    render(<StageList {...props} />);
    expect(
      screen.getByRole("heading", { level: 3, name: "Before you build" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 4, name: "Release candidate" }),
    ).toBeInTheDocument();
  });

  it("places an entry under its first stage only", () => {
    render(<StageList {...props} />);
    expect(screen.getAllByText(items[1]!.lead)).toHaveLength(1);
  });

  it("says when an entry recurs, with no serial comma", () => {
    render(<StageList {...props} />);
    expect(
      screen.getByText(/Again at release candidate and launch\./),
    ).toBeInTheDocument();
  });

  it("names the entry and its tag in the kicker", () => {
    render(<StageList {...props} />);
    expect(
      screen.getByText("Forms with error handling, design system team"),
    ).toBeInTheDocument();
  });

  it("starts headings at headingLevel", () => {
    render(<StageList {...props} headingLevel={2} />);
    expect(
      screen.getByRole("heading", { level: 2, name: "Before you ship" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 3, name: "Scoping" }),
    ).toBeInTheDocument();
  });

  it("uses stage headings at the top level without phases", () => {
    render(<StageList items={items} stages={stages} />);
    expect(
      screen.getByRole("heading", { level: 3, name: "Scoping" }),
    ).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = render(<StageList {...props} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("StageList rail", () => {
  it("is an ordered list of stages with headings", () => {
    render(<StageList {...props} variant="rail" />);
    const rail = screen.getAllByRole("list")[0]!;
    expect(rail.tagName).toBe("OL");
    expect(
      screen.getByRole("heading", { level: 3, name: "Design review" }),
    ).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = render(<StageList {...props} variant="rail" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("StageList index", () => {
  it("links every listing to an entry that exists, under each stage it belongs to", () => {
    const { container } = render(<StageList {...props} variant="index" />);
    const nav = screen.getByRole("navigation", { name: "Entries by stage" });
    const links = within(nav).getAllByRole("link");
    // login is listed under three stages
    expect(links).toHaveLength(5);
    for (const link of links) {
      const target = link.getAttribute("href")!.slice(1);
      expect(container.querySelector(`[id="${target}"]`)).not.toBeNull();
    }
  });

  it("names each entry by its heading", () => {
    render(<StageList {...props} variant="index" />);
    expect(
      screen.getByRole("article", { name: "Login, signup and verification" }),
    ).toBeInTheDocument();
  });

  it("takes a custom navigation label", () => {
    render(<StageList {...props} variant="index" indexLabel="Calls by stage" />);
    expect(
      screen.getByRole("navigation", { name: "Calls by stage" }),
    ).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = render(<StageList {...props} variant="index" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("StageList checklist", () => {
  it("labels each tick box with the entry's lead and counts per group", () => {
    render(<StageList {...props} variant="checklist" />);
    const box = screen.getByRole("checkbox", { name: items[0]!.lead });
    expect(screen.getByText("0 of 1 done")).toBeInTheDocument();
    fireEvent.click(box);
    expect(box).toBeChecked();
    expect(screen.getByText("1 of 1 done")).toBeInTheDocument();
  });

  it("keeps ticks under storageKey and clears them all", () => {
    render(
      <StageList {...props} variant="checklist" storageKey="stage-list-test" />,
    );
    fireEvent.click(screen.getByRole("checkbox", { name: items[2]!.lead }));
    expect(window.localStorage.getItem("stage-list-test")).toBe('["sign"]');
    fireEvent.click(screen.getByRole("button", { name: "Clear all" }));
    expect(window.localStorage.getItem("stage-list-test")).toBe("[]");
    expect(
      screen.queryByRole("button", { name: "Clear all" }),
    ).not.toBeInTheDocument();
  });

  it("restores saved ticks", () => {
    window.localStorage.setItem("stage-list-test", '["forms"]');
    render(
      <StageList {...props} variant="checklist" storageKey="stage-list-test" />,
    );
    expect(
      screen.getByRole("checkbox", { name: items[0]!.lead }),
    ).toBeChecked();
  });

  it("groups each stage's boxes in a named fieldset", () => {
    render(<StageList {...props} variant="checklist" />);
    expect(screen.getByRole("group", { name: "Scoping" })).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = render(<StageList {...props} variant="checklist" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("StageList cards", () => {
  it("renders one card per entry with its stages as a badge", () => {
    render(<StageList {...props} variant="cards" />);
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(
      screen.getByText("Design review, Release candidate and Launch"),
    ).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = render(<StageList {...props} variant="cards" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("StageList styles", () => {
  const css = readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), "StageList.module.css"),
    "utf8",
  );

  it("adapts to its own width and to forced colours", () => {
    // Asserted on the source: the vitest CSS-module proxy fabricates classes.
    expect(css).toMatch(/container-type:\s*inline-size/);
    expect(css).toMatch(/@container \(width < 40rem\)/);
    expect(css).toMatch(/@media \(forced-colors: active\)/);
  });
});
