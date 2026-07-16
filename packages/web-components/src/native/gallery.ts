import {
  DigitaltableteurElement,
  numberAttribute,
  reflectAttribute,
} from "./base";

export type DtGalleryImage = {
  src: string;
  alt: string;
  fallback?: string;
  caption?: string;
  srcSet?: string;
  sizes?: string;
  fallbackSrcSet?: string;
};

const styles = `
  :host { display: block; }
  .gallery { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, var(--gallery-min-column)), 1fr)); align-items: start; gap: var(--gallery-gutter); }
  figure { position: relative; margin: 0; background: var(--color-light-bg); box-shadow: 0 1px 4px rgb(0 0 0 / 3%); overflow: hidden; }
  figure:focus-visible { outline: var(--focus-ring-width, 2px) solid var(--focus-ring-color, var(--color-primary)); outline-offset: 2px; }
  picture, img { display: block; inline-size: 100%; }
  img { block-size: auto; transition: transform var(--duration-normal, .3s) var(--ease-out-cubic, ease); }
  figure:hover img, figure:focus img { transform: scale(1.03); }
  figcaption { position: absolute; inset-inline: 0; inset-block-end: 0; padding: .75em 1em; background: var(--gallery-caption-bg, rgb(4 27 35 / 88%)); color: var(--inverted-text-color, white); opacity: 0; transition: opacity var(--duration-fast, .2s); }
  figure:hover figcaption, figure:focus figcaption { opacity: 1; }
  @media (prefers-reduced-motion: reduce) { img, figcaption { transition: none; } }
  @media (forced-colors: active) { figure:focus-visible { outline: 3px solid Highlight; } figcaption { background: Canvas; color: CanvasText; } }
`;

function parseImages(value: string | null): DtGalleryImage[] {
  try {
    const parsed = JSON.parse(value ?? "[]") as unknown;
    return Array.isArray(parsed)
      ? parsed.filter(
          (item): item is DtGalleryImage =>
            Boolean(item) &&
            typeof item === "object" &&
            typeof (item as DtGalleryImage).src === "string" &&
            typeof (item as DtGalleryImage).alt === "string",
        )
      : [];
  } catch {
    return [];
  }
}

export class DtGalleryElement extends DigitaltableteurElement {
  static observedAttributes = ["images", "min-column-width", "gutter"];
  connectedCallback(): void {
    this.render();
  }
  attributeChangedCallback(): void {
    if (this.isConnected) this.render();
  }
  get images(): DtGalleryImage[] {
    return parseImages(this.getAttribute("images"));
  }
  set images(value: DtGalleryImage[]) {
    reflectAttribute(
      this,
      "images",
      JSON.stringify(Array.isArray(value) ? value : []),
    );
  }
  get minColumnWidth(): number {
    return Math.max(160, numberAttribute(this, "min-column-width", 320));
  }
  set minColumnWidth(value: number) {
    reflectAttribute(this, "min-column-width", value);
  }
  get gutter(): number {
    return Math.max(0, numberAttribute(this, "gutter", 32));
  }
  set gutter(value: number) {
    reflectAttribute(this, "gutter", value);
  }

  private render(): void {
    const gallery = this.ownerDocument.createElement("div");
    gallery.className = "gallery";
    gallery.setAttribute("part", "gallery");
    gallery.style.setProperty(
      "--gallery-min-column",
      `${this.minColumnWidth}px`,
    );
    gallery.style.setProperty("--gallery-gutter", `${this.gutter}px`);
    for (const image of this.images) {
      const figure = this.ownerDocument.createElement("figure");
      figure.tabIndex = 0;
      figure.setAttribute("part", "item");
      const img = this.ownerDocument.createElement("img");
      img.src = image.fallback || image.src;
      img.alt = image.alt;
      img.loading = "lazy";
      img.decoding = "async";
      img.sizes = image.sizes || `(min-width: 1px) ${this.minColumnWidth}px`;
      if (image.fallbackSrcSet) img.srcset = image.fallbackSrcSet;
      if (image.fallback) {
        const picture = this.ownerDocument.createElement("picture");
        const source = this.ownerDocument.createElement("source");
        source.srcset = image.srcSet || image.src;
        source.sizes = img.sizes;
        picture.append(source, img);
        figure.append(picture);
      } else {
        img.srcset = image.srcSet || `${image.src} 1x`;
        figure.append(img);
      }
      if (image.caption) {
        const caption = this.ownerDocument.createElement("figcaption");
        caption.textContent = image.caption;
        figure.append(caption);
      }
      gallery.append(figure);
    }
    this.replaceShadow(styles, gallery);
  }
}
