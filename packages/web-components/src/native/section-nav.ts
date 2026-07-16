import {
  DigitaltableteurElement,
  reflectAttribute,
  reflectBooleanAttribute,
  stringAttribute,
} from "./base";
import { localizedText } from "./localization";

export type DtSectionNavPage = { path: string };

const BLOG_PAGES: DtSectionNavPage[] = [
  { path: "/blog/petri-lahdelma-bio" },
  { path: "/blog/digital-craftsmanship" },
  { path: "/blog/figma-mcp-design-systems" },
  { path: "/blog/thoughts-on-future-branding" },
  { path: "/blog/designing-in-2025" },
  { path: "/blog/in-search-of-impact" },
  { path: "/blog/workflow-tips" },
  {
    path: "/blog/design-system-meets-ai-building-the-self-evolving-component-library-pt-1",
  },
  {
    path: "/blog/design-system-meets-ai-building-the-self-evolving-component-library-pt-2",
  },
];
const WORK_PAGES: DtSectionNavPage[] = [
  { path: "/work/helsinki-design-system" },
  { path: "/work/new-things-co" },
  { path: "/work/illustrations" },
  { path: "/work/garage-junction" },
];

const styles = `
  :host { display: block; }
  :host([hidden]) { display: none; }
  nav { display: flex; position: relative; justify-content: space-between; align-items: center; gap: 1rem; }
  .work { z-index: 40; }
  .actions { display: flex; gap: var(--dt-section-nav-gap, .5rem); }
  dt-button { flex: none; }
  @media (width < 768px) { .blog dt-button::part(label) { display: none; } }
`;

function parsePages(
  value: string | null,
  fallback: DtSectionNavPage[],
): DtSectionNavPage[] {
  if (!value) return fallback.map((page) => ({ ...page }));
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return fallback.map((page) => ({ ...page }));
    return parsed
      .filter(
        (page): page is DtSectionNavPage =>
          Boolean(page) &&
          typeof page === "object" &&
          typeof (page as DtSectionNavPage).path === "string" &&
          Boolean((page as DtSectionNavPage).path.trim()),
      )
      .map((page) => ({ path: page.path }));
  } catch {
    return fallback.map((page) => ({ ...page }));
  }
}

abstract class DtSectionNavElement extends DigitaltableteurElement {
  static observedAttributes = ["current-path", "pages", "disabled", "lang"];
  protected abstract readonly section: "blog" | "work";
  protected abstract readonly fallbackPages: DtSectionNavPage[];
  private assignedPages: DtSectionNavPage[] | null = null;

  connectedCallback(): void {
    this.render();
  }
  attributeChangedCallback(name: string): void {
    if (name === "pages") this.assignedPages = null;
    if (this.isConnected) this.render();
  }
  get currentPath(): string {
    return stringAttribute(
      this,
      "current-path",
      this.ownerDocument.defaultView?.location.pathname ?? "/",
    );
  }
  set currentPath(value: string) {
    reflectAttribute(this, "current-path", value || null);
  }
  get pages(): DtSectionNavPage[] {
    return (
      this.assignedPages?.map((page) => ({ ...page })) ??
      parsePages(this.getAttribute("pages"), this.fallbackPages)
    );
  }
  set pages(value: DtSectionNavPage[]) {
    this.assignedPages = Array.isArray(value)
      ? value
          .filter((page) => typeof page?.path === "string")
          .map((page) => ({ ...page }))
      : [];
    reflectAttribute(this, "pages", JSON.stringify(this.assignedPages));
  }
  get disabled(): boolean {
    return this.hasAttribute("disabled");
  }
  set disabled(value: boolean) {
    reflectBooleanAttribute(this, "disabled", value);
  }

  private labels() {
    if (this.section === "blog") {
      return {
        nav: localizedText(this, {
          en: "Blog article navigation",
          fi: "Blogiartikkelien navigointi",
          sv: "Navigering för bloggartiklar",
        }),
        back: localizedText(this, {
          en: "Articles",
          fi: "Artikkeleihin",
          sv: "Artiklar",
        }),
        previous: localizedText(this, {
          en: "Prev",
          fi: "Edellinen",
          sv: "Föregående",
        }),
        next: localizedText(this, { en: "Next", fi: "Seuraava", sv: "Nästa" }),
      };
    }
    return {
      nav: localizedText(this, {
        en: "Work project navigation",
        fi: "Työprojektien navigointi",
        sv: "Navigering för arbetsprojekt",
      }),
      back: localizedText(this, { en: "Work", fi: "Töihin", sv: "Arbete" }),
      previous: localizedText(this, {
        en: "Prev",
        fi: "Edellinen",
        sv: "Föregående",
      }),
      next: localizedText(this, { en: "Next", fi: "Seuraava", sv: "Nästa" }),
    };
  }

  private button(
    label: string,
    path: string | null,
    icon: string,
    endIcon = false,
  ): HTMLElement {
    const button = this.ownerDocument.createElement("dt-button");
    button.setAttribute("variant", "tertiary");
    button.setAttribute("size", "md");
    button.setAttribute("label", label);
    button.setAttribute("accessible-name", label);
    button.setAttribute(endIcon ? "end-icon" : "icon", icon);
    const unavailable = this.disabled || !path;
    if (unavailable) button.setAttribute("disabled", "");
    else button.setAttribute("href", path);
    if (path) button.dataset.path = path;
    button.addEventListener("click", (event) => {
      if (unavailable) {
        event.preventDefault();
        return;
      }
      const navigation = new CustomEvent("navigate", {
        bubbles: true,
        cancelable: true,
        composed: true,
        detail: { path },
      });
      if (!this.dispatchEvent(navigation)) event.preventDefault();
    });
    return button;
  }

  private render(): void {
    const pages = this.pages;
    const normalize = (value: string) => value.replace(/\/+$/, "") || "/";
    const currentPath = normalize(this.currentPath);
    const currentIndex = pages.findIndex(
      (page) => normalize(page.path) === currentPath,
    );
    const labels = this.labels();
    const nav = this.ownerDocument.createElement("nav");
    nav.className = this.section;
    nav.setAttribute("part", "navigation");
    nav.setAttribute("aria-label", labels.nav);
    const indexPath = this.section === "blog" ? "/blog" : "/work";
    const indexIcon = this.section === "blog" ? "text-align-left" : "briefcase";
    nav.append(this.button(labels.back, indexPath, indexIcon));
    const actions = this.ownerDocument.createElement("div");
    actions.className = "actions";
    actions.setAttribute("part", "actions");
    const previous =
      currentIndex > 0 ? (pages[currentIndex - 1]?.path ?? null) : null;
    const next =
      currentIndex >= 0 && currentIndex < pages.length - 1
        ? (pages[currentIndex + 1]?.path ?? null)
        : null;
    actions.append(
      this.button(labels.previous, previous, "arrow-left"),
      this.button(labels.next, next, "arrow-right", true),
    );
    nav.append(actions);
    if (this.section === "work")
      nav.style.setProperty("--dt-section-nav-gap", "1rem");
    this.replaceShadow(styles, nav);
  }
}

export class DtBlogNavElement extends DtSectionNavElement {
  protected readonly section = "blog" as const;
  protected readonly fallbackPages = BLOG_PAGES;
}

export class DtWorkNavElement extends DtSectionNavElement {
  protected readonly section = "work" as const;
  protected readonly fallbackPages = WORK_PAGES;
}
