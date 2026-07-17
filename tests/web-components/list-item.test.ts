import { afterEach, beforeAll, describe, expect, it } from "vitest";
import {
  defineNativeElements,
  DtListItemElement,
} from "../../packages/web-components/src/native";

const TAG = "dt-list-item";

beforeAll(() => defineNativeElements());
afterEach(() => document.body.replaceChildren());

function renderListItem(attrs: Record<string, string> = {}) {
  const element = document.createElement(TAG) as DtListItemElement;
  for (const [name, value] of Object.entries(attrs)) {
    element.setAttribute(name, value);
  }
  document.body.append(element);
  return element;
}

describe("DtListItemElement", () => {
  it("renders the label attribute into the shadow label part", () => {
    const element = renderListItem({ label: "Rename" });

    const label = element.shadowRoot?.querySelector('[part="label"]');
    const labelText = label
      ?.querySelector("slot")
      ?.assignedNodes({ flatten: true })
      .map((node) => node.textContent)
      .join("");

    expect(labelText).toBe("Rename");
  });

  it("renders a dt-icon in the icon part when icon is set, and no gutter when it's absent", () => {
    const withIcon = renderListItem({ label: "Duplicate", icon: "copy" });
    const iconPart = withIcon.shadowRoot?.querySelector('[part="icon"]');
    expect(iconPart).toBeInTheDocument();
    expect(iconPart?.querySelector("dt-icon")).toHaveAttribute(
      "name",
      "copy",
    );

    const withoutIcon = renderListItem({ label: "Duplicate" });
    expect(
      withoutIcon.shadowRoot?.querySelector('[part="icon"]'),
    ).toBeNull();
  });

  it("renders the meta attribute as text in the meta part without aria-hidden", () => {
    const element = renderListItem({ label: "Shortcut", meta: "⌘K" });

    const meta = element.shadowRoot?.querySelector('[part="meta"]');
    const metaText = meta
      ?.querySelector("slot")
      ?.assignedNodes({ flatten: true })
      .map((node) => node.textContent)
      .join("");

    expect(metaText).toBe("⌘K");
    expect(meta).not.toHaveAttribute("aria-hidden");
  });

  it("renders the check part with aria-hidden when selected", () => {
    const element = renderListItem({ label: "Bold", selected: "" });

    const check = element.shadowRoot?.querySelector('[part="check"]');
    expect(check).toHaveAttribute("aria-hidden", "true");
    expect(check?.querySelector("dt-icon")).toHaveAttribute("name", "check");
  });

  it("reflects tone=destructive on the shadow root element's class list", () => {
    const element = renderListItem({ label: "Delete", tone: "destructive" });

    const root = element.shadowRoot?.querySelector('[part="root"]');
    expect(root).toHaveClass("root", "destructive");
  });

  it("lets slotted meta content win over the meta attribute", () => {
    const element = document.createElement(TAG) as DtListItemElement;
    element.setAttribute("label", "Shortcut");
    element.setAttribute("meta", "⌘K");
    const override = document.createElement("span");
    override.setAttribute("slot", "meta");
    override.textContent = "Custom meta";
    element.append(override);
    document.body.append(element);

    const meta = element.shadowRoot?.querySelector('[part="meta"]');
    const slot = meta?.querySelector("slot");
    const metaText = slot
      ?.assignedNodes({ flatten: true })
      .map((node) => node.textContent)
      .join("");

    expect(slot?.textContent).toBe("");
    expect(metaText).toBe("Custom meta");
  });
});
