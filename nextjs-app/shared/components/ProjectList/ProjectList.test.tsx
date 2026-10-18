import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { ProjectList, type ProjectListItem } from "./ProjectList";

expect.extend(toHaveNoViolations);

const items: ProjectListItem[] = [
  {
    id: "hds",
    title: "Helsinki Design System",
    href: "/work/helsinki-design-system",
    thumbnail: "/images/hds.webp",
    client: "City of Helsinki",
    discipline: "Design systems",
    year: "2020–2022",
    tag: "Embedded partnership",
  },
  {
    id: "rhythmguard",
    title: "Rhythmguard",
    href: "/work/rhythmguard",
    discipline: "Tools and OSS",
    year: "Dec 2025 – Present",
  },
  {
    id: "vr",
    title: "VR Design System",
    client: "VR Group",
    discipline: "Design systems",
    year: "2026",
    comingSoon: true,
  },
];

describe("ProjectList", () => {
  afterEach(cleanup);

  it("renders a named list with one item per project", () => {
    render(<ProjectList items={items} ariaLabel="Projects" />);
    const list = screen.getByRole("list", { name: "Projects" });
    expect(within(list).getAllByRole("listitem")).toHaveLength(3);
  });

  it("makes each project with a page one link to its case study", () => {
    render(<ProjectList items={items} ariaLabel="Projects" />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute("href", "/work/helsinki-design-system");
    expect(links[0]).toHaveTextContent("Helsinki Design System");
  });

  it("writes the meta line as client (or discipline) then period", () => {
    render(<ProjectList items={items} ariaLabel="Projects" />);
    expect(screen.getByText("City of Helsinki, 2020–2022")).toBeInTheDocument();
    expect(screen.getByText("Tools and OSS, Dec 2025 – Present")).toBeInTheDocument();
  });

  it("renders teasers as muted rows without a link, with the coming-soon label", () => {
    render(
      <ProjectList items={items} ariaLabel="Projects" comingSoonLabel="Soon" />,
    );
    const teaser = screen.getByText("VR Design System").closest("li")!;
    expect(within(teaser).queryByRole("link")).toBeNull();
    expect(within(teaser).getByText("Soon")).toBeInTheDocument();
  });

  it("hides the visual column header from assistive technology", () => {
    const { container } = render(<ProjectList items={items} ariaLabel="Projects" />);
    const header = container.querySelector('[aria-hidden="true"]');
    expect(header).toHaveTextContent("Project");
  });

  it("marks titles with the content language when given", () => {
    render(<ProjectList items={items} ariaLabel="Projekti" contentLanguage="en" />);
    expect(screen.getByText("Rhythmguard")).toHaveAttribute("lang", "en");
    expect(screen.getByText("City of Helsinki, 2020–2022")).toHaveAttribute("lang", "en");
    // Labels and translated disciplines take the page language.
    expect(screen.getByText("Tools and OSS, Dec 2025 – Present")).not.toHaveAttribute("lang");
  });

  it("has no axe violations", async () => {
    const { container } = render(<ProjectList items={items} ariaLabel="Projects" />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("keeps a client label in the page language", () => {
    render(
      <ProjectList
        items={[{ id: "rg", title: "Rhythmguard", client: "Oma projekti", clientIsLabel: true, year: "2025" }]}
        ariaLabel="Projektit"
        contentLanguage="en"
      />,
    );
    expect(screen.getByText("Oma projekti, 2025")).not.toHaveAttribute("lang");
  });

  it("shows a tag beside the title, inside the row link, in the content language", () => {
    render(<ProjectList items={items} ariaLabel="Projektit" contentLanguage="en" />);
    const tag = screen.getByText("Embedded partnership");
    expect(tag).toHaveAttribute("lang", "en");
    expect(tag.closest("a")).toHaveAttribute("href", "/work/helsinki-design-system");
    expect(screen.getAllByText("Embedded partnership")).toHaveLength(1);
  });
});
