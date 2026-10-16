import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import en from "../../locales/en/translation.json";
import { ENGAGEMENTS } from "../../data/engagements";
import { projects } from "../../data/projects";
import { EngagementPageContent } from "./EngagementPageContent";

expect.extend(toHaveNoViolations);

describe("EngagementPageContent", () => {
  for (const engagement of ENGAGEMENTS) {
    const copy = en.engagementPages[engagement.id];

    describe(engagement.id, () => {
      it("leads with its own headline as the only h1", () => {
        render(<EngagementPageContent engagementId={engagement.id} />);
        const h1s = screen.getAllByRole("heading", { level: 1 });
        expect(h1s).toHaveLength(1);
        expect(h1s[0]).toHaveTextContent(copy.title);
      });

      it("books through its configured links", () => {
        render(<EngagementPageContent engagementId={engagement.id} />);
        const primary = screen.getAllByRole("link", { name: copy.cta1 });
        expect(primary.length).toBeGreaterThanOrEqual(2);
        for (const link of primary) {
          expect(link).toHaveAttribute("href", engagement.primaryHref);
        }
        for (const link of screen.getAllByRole("link", { name: copy.cta2 })) {
          expect(link).toHaveAttribute("href", engagement.secondaryHref);
        }
      });

      it("links each proof case to its work page, distinguishable by title", () => {
        render(<EngagementPageContent engagementId={engagement.id} />);
        for (const slug of engagement.proof) {
          const title = en.engagementPages.proof[slug as keyof typeof en.engagementPages.proof].title;
          const link = screen.getByRole("link", {
            name: `${en.engagementPages.common.proofLink}: ${title}`,
          });
          expect(link).toHaveAttribute("href", `/work/${slug}`);
        }
      });

      it("lists its signals, limits, steps and deliverables", () => {
        render(<EngagementPageContent engagementId={engagement.id} />);
        for (const line of [
          ...copy.signals,
          ...copy.limits,
          ...copy.steps,
          ...copy.deliverables,
        ]) {
          expect(screen.getByText(line)).toBeInTheDocument();
        }
      });

      it("leads with a breadcrumb back to Pricing, ending on this engagement", () => {
        render(<EngagementPageContent engagementId={engagement.id} />);
        const trail = screen.getByRole("navigation", {
          name: en.engagementPages.common.breadcrumbLabel,
        });
        expect(
          within(trail).getByRole("link", { name: en.engagementPages.common.breadcrumbPricing }),
        ).toHaveAttribute("href", "/pricing");
        expect(within(trail).getByText(copy.eyebrow)).toHaveAttribute("aria-current", "page");
      });

      it("links the other three engagements and not itself", () => {
        render(<EngagementPageContent engagementId={engagement.id} />);
        const section = screen
          .getByRole("heading", { level: 2, name: en.engagementPages.common.otherTitle })
          .closest("section") as HTMLElement;
        const hrefs = within(section)
          .getAllByRole("link")
          .map((link) => link.getAttribute("href"));
        expect(hrefs).toEqual(
          ENGAGEMENTS.filter((other) => other.id !== engagement.id).map(
            (other) => `/engagements/${other.slug}`,
          ),
        );
      });

      it("asks nothing the procurement FAQ already asks", () => {
        const procurement = new Set(en.procurementFaq.items.map((item) => item.question));
        for (const item of copy.faq) expect(procurement.has(item.question)).toBe(false);
      });

      it("shows the offer FAQ and the procurement FAQ", () => {
        render(<EngagementPageContent engagementId={engagement.id} />);
        for (const item of copy.faq) {
          expect(screen.getByRole("button", { name: item.question })).toBeInTheDocument();
        }
        expect(
          screen.getByRole("heading", { level: 2, name: en.procurementFaq.title }),
        ).toBeInTheDocument();
      });
    });
  }

  it("attributes each proof case to its own client, never another project's", () => {
    const proof = en.engagementPages.proof as Record<string, { eyebrow: string }>;
    for (const [slug, copy] of Object.entries(proof)) {
      const project = projects.find((p) => p.slug === slug);
      expect(project, `proof slug ${slug} has no project record`).toBeDefined();
      if (project?.client) expect(copy.eyebrow).toContain(project.client);
      for (const other of projects) {
        if (other.slug === slug || !other.client) continue;
        expect(copy.eyebrow, `${slug} names ${other.client}`).not.toContain(other.client);
      }
    }
  });

  it("states the price from the pricing page keys", () => {
    const { container } = render(<EngagementPageContent engagementId="liftoff" />);
    const facts = container.querySelector("dl") as HTMLElement;
    expect(within(facts).getByText(en.pricingPackage1Price)).toBeInTheDocument();
  });

  it("renders nothing for an unknown engagement", () => {
    const { container } = render(
      // @ts-expect-error deliberately invalid id
      <EngagementPageContent engagementId="nope" />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("has no axe violations", async () => {
    const { container } = render(<EngagementPageContent engagementId="audit" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
