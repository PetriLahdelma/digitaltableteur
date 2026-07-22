import { waitFor } from "@testing-library/dom";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import {
  defineNativeElements,
  DtAuthorElement,
  DtBlogMediaImageElement,
  DtBlogNavElement,
  DtLogoElement,
  DtPersonCardElement,
  DtSocialShareElement,
  DtTestimonialElement,
  DtWorkNavElement,
} from "../../packages/web-components/src/native";

beforeAll(() => defineNativeElements());

afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

describe("native editorial, identity, and section-navigation batch", () => {
  it("renders the accessible logo at its canonical default size", () => {
    const element = document.createElement("dt-logo") as DtLogoElement;
    document.body.append(element);

    const logo = element.shadowRoot?.querySelector("svg");
    expect(logo).toHaveAttribute("role", "img");
    expect(logo).toHaveAttribute("aria-label", "Digitaltableteur");
    expect(logo).toHaveAttribute("width", "24");
    expect(logo).toHaveAttribute("height", "24");

    element.background = true;
    element.animated = true;
    expect(element.shadowRoot?.querySelector("circle")).toBeTruthy();
    expect(element.shadowRoot?.querySelector("svg")).toHaveClass("animated");

    element.decorative = true;
    expect(element.shadowRoot?.querySelector("svg")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    expect(element.shadowRoot?.querySelector("title")).toBeNull();
  });

  it("renders a custom logo image with alt semantics when src is set", () => {
    const element = document.createElement("dt-logo") as DtLogoElement;
    element.setAttribute("src", "/logos/clients/dsharp.svg");
    element.setAttribute("accessible-title", "DSharp");
    document.body.append(element);

    const img = element.shadowRoot?.querySelector("img");
    expect(img).toHaveAttribute("src", "/logos/clients/dsharp.svg");
    expect(img).toHaveAttribute("alt", "DSharp");
    expect(img).toHaveAttribute("width", "24");
    expect(element.shadowRoot?.querySelector("svg")).toBeNull();

    element.decorative = true;
    const decorativeImg = element.shadowRoot?.querySelector("img");
    expect(decorativeImg).toHaveAttribute("alt", "");
    expect(decorativeImg).toHaveAttribute("aria-hidden", "true");

    element.src = "";
    expect(element.shadowRoot?.querySelector("img")).toBeNull();
    expect(element.shadowRoot?.querySelector("svg")).toBeTruthy();
  });

  it("preserves native article-image sizing, priority, and lifecycle events", () => {
    const element = document.createElement(
      "dt-blog-media-image",
    ) as DtBlogMediaImageElement;
    element.src = "/studio.jpg";
    element.alt = "Digitaltableteur studio";
    element.priority = true;
    element.fluid = true;
    const loaded = vi.fn();
    element.addEventListener("image-load", loaded);
    document.body.append(element);

    const image = element.shadowRoot?.querySelector("img");
    expect(image).toHaveAttribute("alt", "Digitaltableteur studio");
    expect(image).toHaveAttribute("width", "800");
    expect(image).toHaveAttribute("height", "400");
    expect(image?.loading).toBe("eager");
    expect(image?.fetchPriority).toBe("high");
    expect(image).toHaveClass("fluid", "cover");

    image?.dispatchEvent(new Event("load"));
    expect(loaded).toHaveBeenCalledOnce();
  });

  it("composes Author from the native Avatar and optional profile link", () => {
    const element = document.createElement("dt-author") as DtAuthorElement;
    element.name = "Petri Lahdelma";
    element.imageUrl = "/pete.png";
    element.profileUrl = "/authors/petri";
    element.size = "3rem";
    document.body.append(element);

    const avatar = element.shadowRoot?.querySelector("dt-avatar");
    const link = element.shadowRoot?.querySelector("a");
    expect(avatar).toHaveAttribute("name", "Petri Lahdelma");
    expect(avatar).toHaveAttribute("image-url", "/pete.png");
    expect(avatar).toHaveAttribute("size", "3rem");
    expect(link).toHaveAttribute("href", "/authors/petri");
    expect(link).toHaveTextContent("By Petri Lahdelma");
  });

  it("derives BlogNav edge state from host-supplied pages", () => {
    const element = document.createElement("dt-blog-nav") as DtBlogNavElement;
    element.pages = [{ path: "/blog/first" }, { path: "/blog/last" }];
    element.currentPath = "/blog/first/";
    document.body.append(element);

    const buttons = element.shadowRoot?.querySelectorAll("dt-button");
    expect(buttons?.[0]).toHaveAttribute("href", "/blog");
    expect(buttons?.[0]).toHaveAttribute("accessible-name", "Articles");
    expect(buttons?.[1]).toHaveAttribute("disabled");
    expect(buttons?.[1]).toHaveAttribute("accessible-name", "Prev");
    expect(buttons?.[2]).toHaveAttribute("href", "/blog/last");
    expect(buttons?.[2]).toHaveAttribute("accessible-name", "Next");
  });

  it("emits a cancelable WorkNav request before host routing", () => {
    const element = document.createElement("dt-work-nav") as DtWorkNavElement;
    element.pages = [{ path: "/work/first" }, { path: "/work/last" }];
    element.currentPath = "/work/first";
    const navigate = vi.fn((event: Event) => event.preventDefault());
    element.addEventListener("navigate", navigate);
    document.body.append(element);

    const next = element.shadowRoot?.querySelectorAll("dt-button")[2] as
      | HTMLElement
      | undefined;
    next?.click();

    expect(navigate).toHaveBeenCalledOnce();
    expect((navigate.mock.calls[0][0] as CustomEvent).detail).toEqual({
      path: "/work/last",
    });
  });

  it("renders valid share targets and copies through the native fallback action", async () => {
    const previousClipboard = Object.getOwnPropertyDescriptor(
      navigator,
      "clipboard",
    );
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    const share = vi
      .spyOn(navigator, "share")
      .mockRejectedValue(new Error("Native share unavailable"));

    try {
      const element = document.createElement(
        "dt-social-share",
      ) as DtSocialShareElement;
      element.url = "https://digitaltableteur.com/article";
      element.shareTitle = "A useful article";
      element.channels = ["linkedin", "reddit"];
      const copied = vi.fn();
      element.addEventListener("link-copy", copied);
      document.body.append(element);

      const links = element.shadowRoot?.querySelectorAll("a");
      expect(links).toHaveLength(2);
      expect(links?.[0].href).toContain("linkedin.com/sharing/share-offsite");
      expect(links?.[1].href).toContain("title=A%20useful%20article");

      const button = element.shadowRoot?.querySelector(
        "dt-button",
      ) as HTMLElement;
      button.click();
      await waitFor(() => expect(writeText).toHaveBeenCalledWith(element.url));
      expect(share).toHaveBeenCalledOnce();
      expect(copied).toHaveBeenCalledOnce();
      expect(element.shadowRoot?.querySelector("dt-toast")).toHaveAttribute(
        "open",
      );
    } finally {
      if (previousClipboard) {
        Object.defineProperty(navigator, "clipboard", previousClipboard);
      } else {
        delete (navigator as { clipboard?: unknown }).clipboard;
      }
    }
  });

  it("renders PersonCard content, social labels, and loading semantics", () => {
    const element = document.createElement(
      "dt-person-card",
    ) as DtPersonCardElement;
    element.imageSrc = "/pete.png";
    element.imageAlt = "Portrait of Petri Lahdelma";
    element.name = "Petri Lahdelma";
    element.personTitle = "Designer and developer";
    element.email = "petri@digitaltableteur.com";
    element.linkedinUrl = "https://linkedin.com/in/petri";
    element.linkedinLabel = "Connect on LinkedIn";
    element.substackUrl = "https://example.substack.com";
    document.body.append(element);

    expect(element.shadowRoot?.querySelector("h3")).toHaveTextContent(
      "Petri Lahdelma",
    );
    expect(element.shadowRoot?.querySelector("img")).toHaveAttribute(
      "alt",
      "Portrait of Petri Lahdelma",
    );
    expect(
      element.shadowRoot?.querySelector('a[aria-label="Connect on LinkedIn"]'),
    ).toBeTruthy();
    expect(
      element.shadowRoot?.querySelector('dt-icon[name="newspaper-clipping"]'),
    ).toBeTruthy();

    element.loading = true;
    expect(
      element.shadowRoot?.querySelector('[role="status"]'),
    ).toHaveAttribute("aria-busy", "true");
  });

  it("renders semantic Testimonial attribution with optional identity media", () => {
    const element = document.createElement(
      "dt-testimonial",
    ) as DtTestimonialElement;
    element.quote = "The system made delivery predictable.";
    element.name = "Sarah Johnson";
    element.personTitle = "Product Manager";
    element.company = "TechCorp";
    element.avatarUrl = "/sarah.jpg";
    element.linkedinUrl = "https://linkedin.com/in/sarah";
    document.body.append(element);

    expect(element.shadowRoot?.querySelector("blockquote")).toBeTruthy();
    expect(element.shadowRoot?.querySelector("cite")).toHaveTextContent(
      "Sarah Johnson",
    );
    expect(element.shadowRoot?.querySelector("img")).toHaveAttribute(
      "alt",
      "Portrait of Sarah Johnson",
    );
    expect(element.shadowRoot?.querySelector(".meta")).toHaveTextContent(
      "Product Manager • TechCorp",
    );
    expect(element.shadowRoot?.querySelector("a")).toHaveAttribute(
      "rel",
      "noopener noreferrer",
    );
  });
});

describe("editorial batch review regressions (#1228)", () => {
  it("treats a dismissed share sheet as a no-op instead of clobbering the clipboard", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    const abort = new Error("Share canceled");
    abort.name = "AbortError";
    vi.spyOn(navigator, "share").mockRejectedValue(abort);
    try {
      const element = document.createElement(
        "dt-social-share",
      ) as DtSocialShareElement;
      element.url = "https://digitaltableteur.com/article";
      element.shareTitle = "A useful article";
      const copied = vi.fn();
      const errored = vi.fn();
      element.addEventListener("link-copy", copied);
      element.addEventListener("share-error", errored);
      document.body.append(element);

      element.shadowRoot?.querySelector<HTMLElement>("dt-button")?.click();
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(writeText).not.toHaveBeenCalled();
      expect(copied).not.toHaveBeenCalled();
      expect(errored).not.toHaveBeenCalled();
      expect(
        element.shadowRoot?.querySelector("dt-toast"),
      ).not.toHaveAttribute("open");
    } finally {
      delete (navigator as { clipboard?: unknown }).clipboard;
    }
  });

  it("trims comma-separated channels and uses vowel-harmony-correct Finnish labels", () => {
    const element = document.createElement(
      "dt-social-share",
    ) as DtSocialShareElement;
    element.setAttribute("channels", "facebook, twitter");
    element.setAttribute("lang", "fi");
    element.url = "https://digitaltableteur.com/article";
    document.body.append(element);

    const links = element.shadowRoot?.querySelectorAll("a") ?? [];
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute("aria-label", "Jaa Facebookissa");
    expect(links[1]).toHaveAttribute("aria-label", "Jaa Twitterissä");
  });

  it("neutralizes unsafe hrefs across the editorial batch", () => {
    const nav = document.createElement("dt-work-nav") as DtWorkNavElement;
    nav.setAttribute("current-path", "/work/a");
    nav.pages = [{ path: "/work/a" }, { path: "javascript:alert(1)" }];
    document.body.append(nav);
    const next = nav.shadowRoot?.querySelectorAll("dt-button")[2];
    expect(next).toHaveAttribute("href", "#");

    const author = document.createElement("dt-author") as DtAuthorElement;
    author.name = "Petri";
    author.profileUrl = "javascript:alert(1)";
    document.body.append(author);
    expect(author.shadowRoot?.querySelector("a")).toHaveAttribute("href", "#");

    const card = document.createElement(
      "dt-person-card",
    ) as DtPersonCardElement;
    card.setAttribute("name", "Petri");
    card.setAttribute("linkedin-url", "javascript:alert(1)");
    document.body.append(card);
    expect(card.shadowRoot?.querySelector(".social a")).toHaveAttribute(
      "href",
      "#",
    );
  });

  it("moves the uncontrolled section-nav optimistically when a SPA host cancels navigate", () => {
    const nav = document.createElement("dt-work-nav") as DtWorkNavElement;
    nav.pages = [{ path: "/" }, { path: "/work/a" }, { path: "/work/b" }];
    document.body.append(nav); // jsdom pathname is "/"
    nav.addEventListener("navigate", (event) => event.preventDefault());

    let buttons = nav.shadowRoot?.querySelectorAll("dt-button");
    expect(buttons?.[1]).toHaveAttribute("disabled"); // prev at list start
    buttons?.[2]?.click(); // next -> /work/a

    buttons = nav.shadowRoot?.querySelectorAll("dt-button");
    expect(buttons?.[1]).not.toHaveAttribute("disabled");
    expect(buttons?.[2]).toHaveAttribute("href", "/work/b");
  });

  it("re-syncs the uncontrolled section-nav from Navigation API currententrychange", () => {
    const navigationMock = new EventTarget();
    Object.defineProperty(window, "navigation", {
      value: navigationMock,
      configurable: true,
    });
    try {
      const nav = document.createElement("dt-work-nav") as DtWorkNavElement;
      nav.pages = [{ path: "/" }, { path: "/work/a" }, { path: "/work/b" }];
      document.body.append(nav);

      window.history.pushState({}, "", "/work/b");
      navigationMock.dispatchEvent(new Event("currententrychange"));

      const buttons = nav.shadowRoot?.querySelectorAll("dt-button");
      expect(buttons?.[2]).toHaveAttribute("disabled"); // next at list end
    } finally {
      delete (window as Window & { navigation?: unknown }).navigation;
      window.history.pushState({}, "", "/");
    }
  });

  it("renders empty section-nav actions for malformed pages JSON instead of this site's articles", () => {
    const nav = document.createElement("dt-blog-nav") as DtBlogNavElement;
    nav.setAttribute("pages", "{not json");
    document.body.append(nav);
    const buttons = nav.shadowRoot?.querySelectorAll("dt-button") ?? [];
    expect(buttons[1]).toHaveAttribute("disabled");
    expect(buttons[2]).toHaveAttribute("disabled");
  });

  it("keeps the global title attribute out of testimonial and logo semantics", () => {
    const testimonial = document.createElement(
      "dt-testimonial",
    ) as DtTestimonialElement;
    testimonial.quote = "Great";
    testimonial.name = "Sarah";
    testimonial.setAttribute("person-title", "Product Manager");
    testimonial.title = "just a tooltip";
    document.body.append(testimonial);
    expect(
      testimonial.shadowRoot?.querySelector(".meta"),
    ).toHaveTextContent(/^Product Manager$/);

    const logo = document.createElement("dt-logo") as DtLogoElement;
    logo.setAttribute("accessible-title", "Custom brand");
    logo.title = "just a tooltip";
    document.body.append(logo);
    expect(logo.shadowRoot?.querySelector("svg")).toHaveAttribute(
      "aria-label",
      "Custom brand",
    );
  });

  it("omits orphaned separators, bylines, and email stubs for missing data", () => {
    const testimonial = document.createElement(
      "dt-testimonial",
    ) as DtTestimonialElement;
    testimonial.name = "Sarah";
    testimonial.company = "TechCorp";
    document.body.append(testimonial);
    expect(
      testimonial.shadowRoot?.querySelector(".meta"),
    ).toHaveTextContent(/^TechCorp$/);

    const author = document.createElement("dt-author") as DtAuthorElement;
    document.body.append(author);
    expect(author.shadowRoot?.querySelector("p")?.textContent).toBe("");
    author.bylinePrefix = "Kirjoittaja";
    author.name = "Petri";
    expect(author.shadowRoot?.querySelector("p")?.textContent).toBe(
      "Kirjoittaja Petri",
    );

    const card = document.createElement(
      "dt-person-card",
    ) as DtPersonCardElement;
    card.setAttribute("name", "Petri");
    document.body.append(card);
    expect(card.shadowRoot?.querySelector(".email")).toBeNull();
  });

  it("localizes the person-card skeleton and social fallbacks", () => {
    const card = document.createElement(
      "dt-person-card",
    ) as DtPersonCardElement;
    card.setAttribute("lang", "fi");
    card.setAttribute("name", "Petri");
    card.setAttribute("linkedin-url", "https://linkedin.com/in/petri");
    card.loading = true;
    document.body.append(card);
    expect(card.shadowRoot?.querySelector('[role="status"]')).toHaveAttribute(
      "aria-label",
      "Ladataan henkilöä",
    );

    card.loading = false;
    expect(card.shadowRoot?.querySelector(".social a")).toHaveAttribute(
      "aria-label",
      "LinkedIn-profiili",
    );
  });

  it("applies sizes only alongside a srcset on blog media images", () => {
    const image = document.createElement(
      "dt-blog-media-image",
    ) as DtBlogMediaImageElement;
    image.src = "/cover.jpg";
    image.alt = "Cover";
    image.sizes = "(max-width: 768px) 100vw, 800px";
    document.body.append(image);
    expect(image.shadowRoot?.querySelector("img")).not.toHaveAttribute(
      "sizes",
    );

    image.srcSet = "/cover.jpg 1x, /cover@2x.jpg 2x";
    const img = image.shadowRoot?.querySelector("img");
    expect(img).toHaveAttribute("srcset", "/cover.jpg 1x, /cover@2x.jpg 2x");
    expect(img).toHaveAttribute("sizes", "(max-width: 768px) 100vw, 800px");
  });
});
