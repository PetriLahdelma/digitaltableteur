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

    element.badge = true;
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
