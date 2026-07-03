/**
 * In-scope design system components for the maturity uplift.
 *
 * Baseline: existing production @dt/* implementations + variables.css.
 * Target: DSharp-style maturity (contracts, MDX, gates)—not DSharp values/APIs.
 * See docs/adr/0005-dsharp-parity-baseline.md.
 */
export const IN_SCOPE_COMPONENTS = [
  { name: "Button", tier: "atom", group: "interaction", root: "components", status: "beta" },
  { name: "Title", tier: "atom", group: "display", root: "components", status: "beta" },
  { name: "Text", tier: "atom", group: "display", root: "components", status: "beta" },
  { name: "Icon", tier: "atom", group: "display", root: "components", status: "beta" },
  { name: "Badge", tier: "atom", group: "display", root: "components", status: "beta" },
  { name: "Label", tier: "atom", group: "form", root: "components", status: "beta" },
  { name: "Link", tier: "atom", group: "navigation", root: "components", status: "beta" },
  { name: "Avatar", tier: "atom", group: "display", root: "components", status: "beta" },
  { name: "HelperText", tier: "atom", group: "form", root: "components", status: "beta" },
  { name: "Checkbox", tier: "atom", group: "form", root: "components", status: "beta" },
  { name: "Switch", tier: "atom", group: "form", root: "components", status: "beta" },
  { name: "TextInput", tier: "atom", group: "form", root: "components", status: "beta" },
  { name: "Card", tier: "molecule", group: "structure", root: "components", status: "beta" },
  { name: "Modal", tier: "molecule", group: "overlay", root: "components", status: "beta" },
  { name: "Tabs", tier: "molecule", group: "navigation", root: "components", status: "beta" },
  { name: "Accordion", tier: "molecule", group: "structure", root: "components", status: "beta" },
  { name: "Breadcrumb", tier: "molecule", group: "navigation", root: "components", status: "beta" },
  { name: "Toast", tier: "molecule", group: "feedback", root: "components", status: "beta" },
  { name: "AlertBanner", tier: "molecule", group: "feedback", root: "components", status: "beta" },
  { name: "Select", tier: "molecule", group: "form", root: "components", status: "beta" },
  { name: "CheckboxGroup", tier: "molecule", group: "form", root: "components", status: "beta" },
  { name: "FileUpload", tier: "molecule", group: "form", root: "components", status: "beta" },
  { name: "ContactForm", tier: "organism", group: "form", root: "components", status: "beta" },
  { name: "NewsletterWaitlist", tier: "organism", group: "form", root: "components", status: "beta" },
  { name: "ChatWidget", tier: "organism", group: "interaction", root: "components", status: "beta" },
  { name: "SiteHeader", tier: "pattern", group: "navigation", root: "patterns", status: "beta" },
  { name: "SiteFooter", tier: "pattern", group: "navigation", root: "patterns", status: "beta" },
  { name: "Divider", tier: "atom", group: "structure", root: "components", status: "beta" },
  { name: "VisuallyHidden", tier: "atom", group: "accessibility", root: "components", status: "beta" },
  { name: "Progress", tier: "atom", group: "feedback", root: "components", status: "beta" },
  { name: "Spinner", tier: "atom", group: "feedback", root: "components", status: "beta" },
  { name: "Radio", tier: "atom", group: "form", root: "components", status: "beta" },
  { name: "TextArea", tier: "atom", group: "form", root: "components", status: "beta" },
  { name: "RadioGroup", tier: "molecule", group: "form", root: "components", status: "beta" },
];

export const TIER_PREFIX = {
  atom: "Atoms",
  molecule: "Molecules",
  organism: "Organisms",
  pattern: "Patterns",
  template: "Templates",
};
