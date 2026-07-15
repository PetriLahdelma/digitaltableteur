import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { DtStatusDotElement } from "../../packages/web-components/src/native/status-dot";

const tagName = "dt-test-status-dot";

beforeAll(() => {
  if (!customElements.get(tagName)) {
    customElements.define(tagName, DtStatusDotElement);
  }
});

afterEach(() => {
  document.body.replaceChildren();
});

function renderStatusDot({
  label,
  children,
}: {
  label?: string;
  children?: string;
} = {}) {
  const element = document.createElement(tagName);
  if (label) element.setAttribute("label", label);
  if (children) element.textContent = children;
  document.body.append(element);
  return element;
}

describe("DtStatusDotElement", () => {
  it("applies the layout class and size class to the shadow root", () => {
    const element = renderStatusDot({ children: "Operational" });
    const root = element.shadowRoot?.querySelector('[part="root"]');

    expect(root).toHaveClass("root", "md");
  });

  it("renders default-slot content as a visible label", () => {
    const element = renderStatusDot({ children: "Operational" });
    const label = element.shadowRoot?.querySelector('[part="label"]');

    expect(label).toHaveClass("label");
    expect(label).not.toHaveClass("srOnly");
  });

  it("keeps the label attribute screen-reader-only without slot content", () => {
    const element = renderStatusDot({ label: "Connection lost" });
    const label = element.shadowRoot?.querySelector('[part="label"]');

    expect(label).toHaveClass("srOnly");
    expect(label?.querySelector("slot")).toHaveTextContent("Connection lost");
  });
});
