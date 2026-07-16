import {
  DigitaltableteurElement,
  reflectAttribute,
  reflectBooleanAttribute,
  safeHref,
  stringAttribute,
} from "./base";
import { localizedText } from "./localization";

export type DtSectionNavPage = { path: string };

/**
 * Structural subset of the Navigation API — typed locally so strict builds
 * don't depend on lib.dom shipping `Window.navigation`.
 */
type NavigationLike = {
  addEventListener(type: "currententrychange", listener: () => void): void;
  removeEventListener(type: "currententrychange", listener: () => void): void;
};

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
  // A malformed attribute renders empty rather than falling back to this
  // site's own article list on a stranger's page — visible, not misleading.
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];
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
    return [];
  }
}

abstract class DtSectionNavElement extends DigitaltableteurElement {
  static observedAttributes = ["current-path", "pages", "disabled", "lang"];
  protected abstract readonly section: "blog" | "work";
  protected abstract readonly fallbackPages: DtSectionNavPage[];
  private assignedPages: DtSectionNavPage[] | null = null;

  /**
   * Uncontrolled-mode guess at the current path after a host-cancelled link
   * click: SPA routers pushState without firing popstate, so until a location
   * event confirms the change this is the only signal the element has.
   */
  private optimisticPath: string | null = null;

  private get navigationApi(): NavigationLike | null {
    const view = this.ownerDocument.defaultView as
      | (Window & { navigation?: NavigationLike })
      | null;
    return view?.navigation ?? null;
  }

  connectedCallback(): void {
    this.ownerDocument.defaultView?.addEventListener(
      "popstate",
      this.handleLocationChange,
    );
    this.navigationApi?.addEventListener(
      "currententrychange",
      this.handleLocationChange,
    );
    this.render();
  }
  disconnectedCallback(): void {
    this.ownerDocument.defaultView?.removeEventListener(
      "popstate",
      this.handleLocationChange,
    );
    this.navigationApi?.removeEventListener(
      "currententrychange",
      this.handleLocationChange,
    );
    super.disconnectedCallback();
  }
  attributeChangedCallback(name: string): void {
    if (name === "pages") this.assignedPages = null;
    if (name === "current-path") this.optimisticPath = null;
    if (this.isConnected) this.render();
  }
  private readonly handleLocationChange = (): void => {
    this.optimisticPath = null;
    if (!this.hasAttribute("current-path")) this.render();
  };
  get currentPath(): string {
    return (
      stringAttribute(this, "current-path") ||
      this.optimisticPath ||
      this.ownerDocument.defaultView?.location.pathname ||
      "/"
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
    else button.setAttribute("href", safeHref(path));
    if (path) button.dataset.path = path;
    button.addEventListener("click", (event) => {
      if (unavailable) {
        event.preventDefault();
        return;
      }
      // Modified/secondary clicks keep native open-in-new-tab semantics; an
      // always-cancelling SPA host must not swallow them.
      if (
        event instanceof MouseEvent &&
        (event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          event.button !== 0)
      ) {
        return;
      }
      const navigation = new CustomEvent("navigate", {
        bubbles: true,
        cancelable: true,
        composed: true,
        detail: { path },
      });
      if (!this.dispatchEvent(navigation)) {
        event.preventDefault();
        // Host-cancelled = SPA routing; move the highlight/boundaries now
        // instead of waiting for a popstate that pushState never fires.
        if (!this.hasAttribute("current-path") && path) {
          this.optimisticPath = path;
          this.render();
        }
      }
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
