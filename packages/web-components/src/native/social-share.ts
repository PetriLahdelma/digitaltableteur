import {
  DigitaltableteurElement,
  enumAttribute,
  reflectAttribute,
  reflectBooleanAttribute,
  stringAttribute,
} from "./base";
import { localizedText } from "./localization";

const CHANNELS = [
  "linkedin",
  "twitter",
  "facebook",
  "reddit",
  "whatsapp",
  "instagram",
] as const;
const VARIANTS = ["inline", "article"] as const;
export type DtSocialShareChannel = (typeof CHANNELS)[number];
export type DtSocialShareVariant = (typeof VARIANTS)[number];

const icons: Record<DtSocialShareChannel, string> = {
  linkedin: "linkedin-logo",
  twitter: "twitter-logo",
  facebook: "facebook-logo",
  reddit: "reddit-logo",
  whatsapp: "whatsapp-logo",
  instagram: "instagram-logo",
};

const styles = `
  :host { display: block; }
  :host([hidden]) { display: none; }
  section { display: flex; flex-direction: column; gap: var(--space-internal-12); }
  .article { margin-block-start: var(--space-layout-32); padding-block-start: var(--space-layout-24); border-block-start: 1px solid var(--color-border); }
  .heading { margin: 0; color: var(--color-gray); font-family: var(--font-display); font-size: var(--font-size-text-s, .875rem); font-weight: 600; letter-spacing: .04em; text-transform: uppercase; }
  .actions { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-internal-12); }
  .channel { display: inline-flex; box-sizing: border-box; inline-size: 2.5rem; block-size: 2.5rem; justify-content: center; align-items: center; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--main-body-background-color, var(--color-white)); color: var(--color-primary); text-decoration: none; transition: border-color var(--duration-fast) var(--ease-out-cubic), background-color var(--duration-fast) var(--ease-out-cubic); }
  .channel:hover { border-color: var(--color-primary); background: var(--color-light-bg); }
  .channel:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }
  dt-button::part(control) { min-block-size: 2.5rem; }
  @media (width < 768px) { .actions { gap: var(--space-internal-8); } .channel { inline-size: 2.25rem; block-size: 2.25rem; } dt-button::part(control) { inline-size: 2.75rem; min-block-size: 2.75rem; padding: 0; } dt-button::part(label) { display: none; } }
  @media (prefers-reduced-motion: reduce) { .channel { transition: none; } }
  @media (forced-colors: active) { .channel { border-color: ButtonText; background: ButtonFace; color: ButtonText; forced-color-adjust: none; } .channel:focus-visible { outline-color: Highlight; } }
`;

function supportsNativeShare(): boolean {
  return (
    typeof navigator !== "undefined" && typeof navigator.share === "function"
  );
}

function fallbackCopy(value: string, document: Document): boolean {
  try {
    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.insetBlockStart = "-9999px";
    document.body.append(textarea);
    const selection = document.defaultView?.getSelection() ?? null;
    const originalRange =
      selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
    textarea.select();
    textarea.setSelectionRange(0, value.length);
    const copied = document.execCommand("copy");
    textarea.remove();
    if (originalRange && selection) {
      selection.removeAllRanges();
      selection.addRange(originalRange);
    }
    return copied;
  } catch {
    return false;
  }
}

function parseChannels(value: string | null): DtSocialShareChannel[] {
  if (!value) return [...CHANNELS];
  let candidates: unknown = value.split(",");
  try {
    candidates = JSON.parse(value) as unknown;
  } catch {
    // Comma-separated attributes remain a convenient HTML form.
  }
  return Array.isArray(candidates)
    ? candidates.filter((channel): channel is DtSocialShareChannel =>
        CHANNELS.includes(String(channel) as DtSocialShareChannel),
      )
    : [...CHANNELS];
}

export class DtSocialShareElement extends DigitaltableteurElement {
  static observedAttributes = [
    "url",
    "share-title",
    "channels",
    "variant",
    "show-heading",
    "heading",
    "lang",
  ];
  private assignedChannels: DtSocialShareChannel[] | null = null;

  connectedCallback(): void {
    this.render();
  }
  attributeChangedCallback(name: string): void {
    if (name === "channels") this.assignedChannels = null;
    if (this.isConnected) this.render();
  }
  get url(): string {
    return stringAttribute(this, "url");
  }
  set url(value: string) {
    reflectAttribute(this, "url", value || null);
  }
  get shareTitle(): string {
    return stringAttribute(this, "share-title");
  }
  set shareTitle(value: string) {
    reflectAttribute(this, "share-title", value || null);
  }
  get channels(): DtSocialShareChannel[] {
    return this.assignedChannels
      ? [...this.assignedChannels]
      : parseChannels(this.getAttribute("channels"));
  }
  set channels(value: DtSocialShareChannel[]) {
    this.assignedChannels = Array.isArray(value)
      ? value.filter((channel) => CHANNELS.includes(channel))
      : [];
    reflectAttribute(this, "channels", JSON.stringify(this.assignedChannels));
  }
  get variant(): DtSocialShareVariant {
    return enumAttribute(this, "variant", VARIANTS, "inline");
  }
  set variant(value: DtSocialShareVariant) {
    reflectAttribute(this, "variant", value);
  }
  get showHeading(): boolean {
    return this.hasAttribute("show-heading");
  }
  set showHeading(value: boolean) {
    reflectBooleanAttribute(this, "show-heading", value);
  }
  get heading(): string {
    return stringAttribute(this, "heading");
  }
  set heading(value: string) {
    reflectAttribute(this, "heading", value || null);
  }

  private channelLabel(channel: DtSocialShareChannel): string {
    const names = {
      linkedin: "LinkedIn",
      twitter: "Twitter",
      facebook: "Facebook",
      reddit: "Reddit",
      whatsapp: "WhatsApp",
      instagram: "Instagram",
    };
    return localizedText(this, {
      en: `Share on ${names[channel]}`,
      fi: `Jaa ${names[channel]}issä`,
      sv: `Dela på ${names[channel]}`,
    });
  }
  private channelHref(channel: DtSocialShareChannel): string {
    const url = encodeURIComponent(this.url);
    const title = encodeURIComponent(this.shareTitle);
    const hrefs: Record<DtSocialShareChannel, string> = {
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      reddit: `https://reddit.com/submit?url=${url}&title=${title}`,
      whatsapp: `https://wa.me/?text=${title}%20${url}`,
      instagram: "https://www.instagram.com/digitaltableteur/",
    };
    return hrefs[channel];
  }
  private async copy(toast: HTMLElement): Promise<boolean> {
    let copied = false;
    try {
      if (
        typeof navigator !== "undefined" &&
        typeof navigator.clipboard?.writeText === "function"
      ) {
        await navigator.clipboard.writeText(this.url);
        copied = true;
      } else {
        copied = fallbackCopy(this.url, this.ownerDocument);
      }
    } catch {
      copied = fallbackCopy(this.url, this.ownerDocument);
    }
    if (!copied) return false;
    toast.setAttribute("open", "");
    this.dispatchEvent(
      new CustomEvent("link-copy", {
        bubbles: true,
        composed: true,
        detail: { url: this.url },
      }),
    );
    return true;
  }

  private async shareOrCopy(toast: HTMLElement): Promise<void> {
    try {
      if (supportsNativeShare()) {
        await navigator.share({
          title: this.shareTitle,
          text: this.shareTitle,
          url: this.url,
        });
        this.dispatchEvent(
          new CustomEvent("native-share", { bubbles: true, composed: true }),
        );
        return;
      }
      if (await this.copy(toast)) return;
    } catch {
      if (await this.copy(toast)) return;
    }
    this.dispatchEvent(
      new CustomEvent("share-error", {
        bubbles: true,
        composed: true,
        detail: { url: this.url },
      }),
    );
  }
  private render(): void {
    const section = this.ownerDocument.createElement("section");
    section.className = this.variant;
    section.setAttribute("part", "social-share");
    const headingText =
      this.heading ||
      localizedText(this, { en: "Share", fi: "Jaa", sv: "Dela" });
    section.setAttribute("aria-label", headingText);
    if (this.showHeading || this.variant === "article") {
      const heading = this.ownerDocument.createElement("p");
      heading.className = "heading";
      heading.textContent = headingText;
      section.append(heading);
    }
    const actions = this.ownerDocument.createElement("div");
    actions.className = "actions";
    actions.setAttribute("part", "actions");
    actions.setAttribute("role", "group");
    actions.setAttribute("aria-label", headingText);
    for (const channel of this.channels) {
      const link = this.ownerDocument.createElement("a");
      link.className = "channel";
      link.href = this.channelHref(channel);
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.setAttribute("aria-label", this.channelLabel(channel));
      const icon = this.ownerDocument.createElement("dt-icon");
      icon.setAttribute("name", icons[channel]);
      icon.setAttribute("size", "sm");
      icon.setAttribute("decorative", "");
      link.append(icon);
      actions.append(link);
    }
    const nativeShare = supportsNativeShare();
    const button = this.ownerDocument.createElement("dt-button");
    const copyLabel = localizedText(this, {
      en: "Copy to clipboard",
      fi: "Kopioi leikepöydälle",
      sv: "Kopiera till urklipp",
    });
    const shareLabel = localizedText(this, {
      en: "Share",
      fi: "Jaa",
      sv: "Dela",
    });
    button.setAttribute("variant", "secondary");
    button.setAttribute("size", "lg");
    button.setAttribute("label", nativeShare ? shareLabel : copyLabel);
    button.setAttribute(
      "accessible-name",
      nativeShare ? shareLabel : copyLabel,
    );
    button.setAttribute("icon", nativeShare ? "share-network" : "copy-simple");
    const toast = this.ownerDocument.createElement("dt-toast");
    toast.setAttribute(
      "message",
      localizedText(this, {
        en: "Link copied!",
        fi: "Linkki kopioitu!",
        sv: "Länk kopierad!",
      }),
    );
    toast.setAttribute("duration", "3000");
    toast.addEventListener("close", () => toast.removeAttribute("open"));
    button.addEventListener("click", () => void this.shareOrCopy(toast));
    actions.append(button);
    section.append(actions, toast);
    this.replaceShadow(styles, section);
  }
}
