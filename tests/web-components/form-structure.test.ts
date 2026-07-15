import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { DtLabelElement } from "../../packages/web-components/src/native/label";
import { DtHelperTextElement } from "../../packages/web-components/src/native/helper-text";
import { DtFormFieldElement } from "../../packages/web-components/src/native/form-field";

const LABEL_TAG = "dt-label";
const HELPER_TAG = "dt-helper-text";
const FIELD_TAG = "dt-form-field";

beforeAll(() => {
  if (!customElements.get(LABEL_TAG)) {
    customElements.define(LABEL_TAG, DtLabelElement);
  }
  if (!customElements.get(HELPER_TAG)) {
    customElements.define(HELPER_TAG, DtHelperTextElement);
  }
  if (!customElements.get(FIELD_TAG)) {
    customElements.define(FIELD_TAG, DtFormFieldElement);
  }
});

afterEach(() => {
  document.body.replaceChildren();
});

describe("native form structure components", () => {
  it("reflects label properties, prioritizes title, and forwards activation", () => {
    const input = document.createElement("input");
    input.id = "field-id";
    document.body.append(input);

    const element = document.createElement(LABEL_TAG) as DtLabelElement;
    element.htmlFor = "field-id";
    element.tooltipText = "Helpful context";
    element.title = "Preferred title";
    element.required = true;
    element.textContent = "Email";

    document.body.append(element);

    expect(element).toHaveAttribute("for", "field-id");
    expect(element).toHaveAttribute("tooltip-text", "Helpful context");
    expect(element).toHaveAttribute("required");

    const label = element.shadowRoot?.querySelector("label");
    const labelText = label
      ?.querySelector("slot")
      ?.assignedNodes({ flatten: true })
      .map((node) => node.textContent)
      .join("");
    expect(label).toHaveAttribute("for", "field-id");
    expect(label).toHaveAttribute("title", "Preferred title");
    expect(labelText).toBe("Email");
    expect(label?.querySelector(".srOnly")?.textContent).toBe("(required)");
    expect(label?.querySelector("[aria-hidden='true']")?.textContent).toBe("*");

    label?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(document.activeElement).toBe(input);
  });

  it("renders helper text with svg error semantics and a neutral fallback", () => {
    const element = document.createElement(HELPER_TAG) as DtHelperTextElement;
    element.state = "error";
    element.textContent = "A required field is missing.";
    document.body.append(element);

    const paragraph = element.shadowRoot?.querySelector("p");
    const helperText = paragraph
      ?.querySelector("slot")
      ?.assignedNodes({ flatten: true })
      .map((node) => node.textContent)
      .join("");
    expect(paragraph).toHaveClass("helperText", "error");
    expect(paragraph).toHaveAttribute("role", "alert");
    expect(helperText).toBe("A required field is missing.");
    expect(paragraph?.querySelector(".icon svg")).toBeInTheDocument();

    const neutral = document.createElement(HELPER_TAG) as DtHelperTextElement;
    neutral.textContent = "Neutral guidance";
    document.body.append(neutral);
    expect(neutral.shadowRoot?.querySelector(".icon")).toBeNull();
    expect(neutral.shadowRoot?.querySelector("p")).not.toHaveAttribute("role");
  });

  it("builds a native fieldset with named slots and disables slotted controls", () => {
    const element = document.createElement(FIELD_TAG) as DtFormFieldElement;
    element.required = true;
    element.disabled = true;
    element.innerHTML = `
      <span slot="legend">Preferences</span>
      <p slot="group-description">Pick one or more</p>
      <p slot="error">At least one is required</p>
      <label><input type="checkbox" /> Option A</label>
      <label><input type="checkbox" /> Option B</label>
    `;
    document.body.append(element);

    const fieldset = element.shadowRoot?.querySelector("fieldset");
    const legend = element.shadowRoot?.querySelector("legend");
    const legendText = legend
      ?.querySelector('slot[name="legend"]')
      ?.assignedNodes({ flatten: true })
      .map((node) => node.textContent)
      .join("");
    const controls = element.shadowRoot?.querySelector(
      "fieldset > .groupControls",
    );
    const slot = controls?.querySelector("slot");
    const assigned = slot?.assignedElements({ flatten: true }) ?? [];
    const inputs = assigned.map((node) => node.querySelector("input"));
    const description = element.shadowRoot?.querySelector(".groupDescription");
    const descriptionText = description
      ?.querySelector('slot[name="group-description"]')
      ?.assignedNodes({ flatten: true })
      .map((node) => node.textContent)
      .join("");
    const error = element.shadowRoot?.querySelector(".error");
    const errorText = error
      ?.querySelector('slot[name="error"]')
      ?.assignedNodes({ flatten: true })
      .map((node) => node.textContent)
      .join("");

    expect(fieldset).toBeInTheDocument();
    expect(fieldset).toHaveProperty("disabled", true);
    expect(fieldset).toHaveAttribute(
      "aria-describedby",
      "group-description error",
    );
    expect(legendText).toBe("Preferences");
    expect(legend?.querySelector("[aria-hidden='true']")?.textContent).toBe(
      " *",
    );
    expect(descriptionText).toBe("Pick one or more");
    expect(error).toHaveAttribute("role", "alert");
    expect(errorText).toBe("At least one is required");
    expect(slot).toBeInTheDocument();
    expect(assigned.length).toBe(2);
    expect(inputs[0]).toHaveAttribute("disabled");
    expect(inputs[1]).toHaveAttribute("disabled");
  });
});
