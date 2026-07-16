#!/usr/bin/env node
import { chromium } from "playwright";
import elements from "../../packages/web-components/web-components.config.mjs";
import { evaluateStoryParity } from "./web-component-story-parity.mjs";

const baseUrl =
  process.argv
    .find((argument) => argument.startsWith("--url="))
    ?.slice("--url=".length) ?? "http://127.0.0.1:6010";
const componentFilter = process.argv
  .find((argument) => argument.startsWith("--component="))
  ?.slice("--component=".length)
  .toLowerCase();

const nativeElements = elements.filter(
  (element) =>
    element.defaultBackend === "native" &&
    (!componentFilter ||
      element.sourceComponent.toLowerCase() === componentFilter ||
      element.tagName.toLowerCase() === componentFilter),
);

if (nativeElements.length === 0) {
  throw new Error(`No native component matches ${componentFilter}`);
}

const slug = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const indexResponse = await fetch(`${baseUrl}/index.json`);
if (!indexResponse.ok) {
  throw new Error(
    `Unable to read Storybook index (${indexResponse.status} ${indexResponse.statusText})`,
  );
}

const index = await indexResponse.json();
const entries = Object.values(index.entries);
if (entries.some((entry) => entry.title === "Web Components/Native")) {
  throw new Error("Aggregate Web Components/Native stories must not exist");
}

const expectedComponents = nativeElements.map((element) => {
  const matchingTitles = new Set(
    entries
      .filter(
        (entry) =>
          entry.title.startsWith("Web Components/") &&
          entry.title.endsWith(`/${element.sourceComponent}`),
      )
      .map((entry) => entry.title),
  );
  if (matchingTitles.size !== 1) {
    throw new Error(
      `${element.sourceComponent} must have exactly one web-component story folder; found ${matchingTitles.size}`,
    );
  }

  const title = [...matchingTitles][0];
  const componentEntries = entries.filter((entry) => entry.title === title);
  const requiredStories = ["Default", "Playground", "Example", "Forced Colors"];
  for (const name of requiredStories) {
    if (
      !componentEntries.some(
        (entry) => entry.type === "story" && entry.name === name,
      )
    ) {
      throw new Error(`${title} misses its ${name} story`);
    }
  }

  const defaultStory = componentEntries.find(
    (entry) => entry.type === "story" && entry.name === "Default",
  );
  const docs = componentEntries.find((entry) => entry.type === "docs");
  if (!defaultStory || !docs) {
    throw new Error(`${title} must expose Default and autodocs entries`);
  }
  const lifecycleTags = ["alpha", "beta", "stable", "deprecated"].filter(
    (status) => defaultStory.tags?.includes(status),
  );
  if (
    lifecycleTags.length !== 1 ||
    lifecycleTags[0] !== element.implementationStatus
  ) {
    throw new Error(
      `${title} Storybook lifecycle ${lifecycleTags.join(", ") || "missing"} must match implementationStatus ${element.implementationStatus}`,
    );
  }

  const canonicalTitle = title.replace(/^Web Components\//, "");
  const reactStories = entries
    .filter((entry) => entry.title === canonicalTitle && entry.type === "story")
    .map((entry) => entry.name);
  const canonicalDefaultStory = entries.find(
    (entry) =>
      entry.title === canonicalTitle &&
      entry.type === "story" &&
      entry.name === "Default",
  );
  const nativeStories = componentEntries
    .filter((entry) => entry.type === "story")
    .map((entry) => entry.name);
  const nativeStoryIds = Object.fromEntries(
    componentEntries
      .filter((entry) => entry.type === "story")
      .map((entry) => [entry.name, entry.id]),
  );
  const requiredStoryIds = [
    ...requiredStories
      .filter((name) => name !== "Default")
      .map((name) => ({ name, id: nativeStoryIds[name] })),
    { name: "Default", id: defaultStory.id },
  ];
  if (reactStories.length === 0) {
    throw new Error(
      `${title} has no canonical React stories at ${canonicalTitle}`,
    );
  }
  if (!canonicalDefaultStory) {
    throw new Error(`${canonicalTitle} has no canonical Default story`);
  }
  const semanticListStories =
    element.tagName === "dt-stack"
      ? {
          canonical: entries.find(
            (entry) =>
              entry.title === canonicalTitle &&
              entry.type === "story" &&
              entry.name === "Semantic List",
          ),
          native: componentEntries.find(
            (entry) => entry.type === "story" && entry.name === "Semantic List",
          ),
        }
      : null;
  if (
    semanticListStories &&
    (!semanticListStories.canonical || !semanticListStories.native)
  ) {
    throw new Error(`${title} must preserve the canonical Semantic List story`);
  }
  const parity = evaluateStoryParity({
    reactStories,
    nativeStories,
    ...element.storyParity,
  });
  if (parity.errors.length > 0 || parity.missing.length > 0) {
    const details = [
      ...parity.errors,
      ...parity.missing.map(
        (story) => `missing native coverage for "${story}"`,
      ),
    ];
    throw new Error(`${title} story parity failed:\n- ${details.join("\n- ")}`);
  }

  return {
    title,
    canonicalTitle,
    canonicalDefaultStoryId: canonicalDefaultStory.id,
    defaultStoryId: defaultStory.id,
    docsId: docs.id,
    tagName: element.tagName,
    nativeStoryIds,
    requiredStoryIds,
    parity: parity.parity,
    semanticListStoryIds: semanticListStories
      ? {
          canonical: semanticListStories.canonical.id,
          native: semanticListStories.native.id,
        }
      : null,
  };
});

if (
  new Set(expectedComponents.map((component) => component.title)).size !==
  nativeElements.length
) {
  throw new Error(
    "Native components do not have one distinct Storybook title each",
  );
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = [];
const captureErrors = (target) => {
  target.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  target.on("pageerror", (error) => errors.push(error.message));
};
captureErrors(page);

try {
  for (const story of expectedComponents) {
    for (const requiredStory of story.requiredStoryIds) {
      await page.goto(
        `${baseUrl}/iframe.html?id=${requiredStory.id}&viewMode=story`,
        { waitUntil: "domcontentloaded", timeout: 60_000 },
      );
      const requiredElement = page.locator(story.tagName).first();
      await requiredElement.waitFor({ state: "attached", timeout: 30_000 });
      const result = await requiredElement.evaluate(
        (node, tagName) => ({
          defined: Boolean(customElements.get(tagName)),
          hasShadowRoot: Boolean(node.shadowRoot),
          bounds: node.getBoundingClientRect().toJSON(),
          label:
            node.getAttribute("label")?.trim() ||
            node.shadowRoot
              ?.querySelector('[part="label"], .label')
              ?.textContent?.trim() ||
            node.textContent?.trim() ||
            "",
          modal:
            tagName === "dt-modal"
              ? (() => {
                  const overlay = node.shadowRoot?.querySelector(".overlay");
                  const panel = node.shadowRoot?.querySelector(
                    '[role="dialog"], [role="alertdialog"]',
                  );
                  return {
                    open: node.hasAttribute("open"),
                    overlayBounds: overlay?.getBoundingClientRect().toJSON(),
                    title:
                      panel?.querySelector("h2")?.textContent?.trim() ?? "",
                    viewport: { width: innerWidth, height: innerHeight },
                  };
                })()
              : null,
        }),
        story.tagName,
      );
      if (!result.defined || !result.hasShadowRoot) {
        throw new Error(
          `${requiredStory.id} did not render a registered shadow-root ${story.tagName}`,
        );
      }
      if (
        story.tagName === "dt-status-dot" &&
        (result.bounds.width <= 0 ||
          result.bounds.height <= 0 ||
          result.label.length === 0)
      ) {
        throw new Error(
          `${requiredStory.id} must render a visible, labelled status dot`,
        );
      }
      if (story.tagName === "dt-modal") {
        const modal = result.modal;
        if (
          !modal?.open ||
          !modal.title ||
          !modal.overlayBounds ||
          Math.abs(modal.overlayBounds.width - modal.viewport.width) > 1 ||
          Math.abs(modal.overlayBounds.height - modal.viewport.height) > 1
        ) {
          throw new Error(
            `${requiredStory.id} must render an open, titled modal with a full-viewport overlay`,
          );
        }
      }
    }
    if (story.tagName === "dt-modal") {
      const alreadyChecked = new Set(
        story.requiredStoryIds.map((requiredStory) => requiredStory.name),
      );
      for (const [name, id] of Object.entries(story.nativeStoryIds)) {
        if (alreadyChecked.has(name)) continue;
        await page.goto(`${baseUrl}/iframe.html?id=${id}&viewMode=story`, {
          waitUntil: "domcontentloaded",
          timeout: 60_000,
        });
        const modal = page.locator("dt-modal").first();
        await modal.waitFor({ state: "attached", timeout: 30_000 });
        const result = await modal.evaluate((node) => {
          const overlay = node.shadowRoot?.querySelector(".overlay");
          const panel = node.shadowRoot?.querySelector(
            '[role="dialog"], [role="alertdialog"]',
          );
          return {
            open: node.hasAttribute("open"),
            severity: node.getAttribute("severity"),
            title: panel?.querySelector("h2")?.textContent?.trim() ?? "",
            overlayBounds: overlay?.getBoundingClientRect().toJSON(),
            viewport: { width: innerWidth, height: innerHeight },
          };
        });
        if (
          !result.open ||
          !result.title ||
          !result.overlayBounds ||
          Math.abs(result.overlayBounds.width - result.viewport.width) > 1 ||
          Math.abs(result.overlayBounds.height - result.viewport.height) > 1
        ) {
          throw new Error(
            `${id} must render an open, titled modal with a full-viewport overlay`,
          );
        }
        if (name === "Confirmation" && result.severity !== "error") {
          throw new Error(
            `${id} destructive confirmation must use error severity`,
          );
        }
      }

      const docsScenarios = [
        [
          "Default",
          "Open modal",
          "Confirm changes",
          "close-icon",
          "showcase",
        ],
        [
          "Playground",
          "Open modal",
          "Confirm changes",
          "close-icon",
          "props",
        ],
        [
          "Confirmation",
          "Delete project…",
          "Delete this project?",
          "cancel",
          null,
        ],
        [
          "Form In Modal",
          "Rename workspace…",
          "Rename workspace",
          "save",
          null,
        ],
        [
          "Severities",
          "Open success dialog",
          "Success dialog",
          "escape",
          null,
        ],
        [
          "Severities",
          "Open error dialog",
          "Error dialog",
          "escape",
          null,
        ],
        [
          "Severities",
          "Open warning dialog",
          "Warning dialog",
          "escape",
          null,
        ],
        [
          "Severities",
          "Open info dialog",
          "Info dialog",
          "escape",
          null,
        ],
        ["Scrollable", "View terms", "Terms of service", "escape", null],
        [
          "Animated Entrance",
          "scale",
          "Scale entrance",
          "escape",
          null,
        ],
        [
          "Animated Entrance",
          "slide",
          "Slide entrance",
          "escape",
          null,
        ],
        [
          "Animated Entrance",
          "fade",
          "Fade entrance",
          "escape",
          null,
        ],
      ];

      await page.goto(
        `${baseUrl}/iframe.html?id=${story.docsId}&viewMode=docs`,
        { waitUntil: "domcontentloaded", timeout: 60_000 },
      );
      for (const [name, trigger, title, dismiss, block] of docsScenarios) {
        const storyId = story.nativeStoryIds[name];
        const root = block
          ? page.locator(`[data-doc-block="${block}"]`)
          : page;
        const launcher = root.getByRole("button", {
          name: trigger,
          exact: true,
        });
        await launcher.click();

        const openModal = page.locator("body > dt-modal[open]");
        await openModal.waitFor({ state: "attached", timeout: 10_000 });
        const result = await openModal.evaluate((node) => {
          const overlay = node.shadowRoot?.querySelector(".overlay");
          const panel = node.shadowRoot?.querySelector(
            '[role="dialog"], [role="alertdialog"]',
          );
          return {
            parent: node.parentElement?.tagName,
            title: panel?.querySelector("h2")?.textContent?.trim() ?? "",
            overlayBounds: overlay?.getBoundingClientRect().toJSON(),
            viewport: { width: innerWidth, height: innerHeight },
          };
        });
        if (
          result.parent !== "BODY" ||
          result.title !== title ||
          !result.overlayBounds ||
          Math.abs(result.overlayBounds.width - result.viewport.width) > 1 ||
          Math.abs(result.overlayBounds.height - result.viewport.height) > 1
        ) {
          throw new Error(
            `${storyId} must launch from Docs into a body-level, full-viewport modal: ${JSON.stringify(result)}`,
          );
        }

        if (dismiss === "close-icon") {
          await openModal
            .getByRole("button", { name: "Close dialog", exact: true })
            .click();
        } else if (dismiss === "cancel") {
          await openModal
            .getByRole("button", { name: "Cancel", exact: true })
            .click();
        } else if (dismiss === "save") {
          await openModal
            .getByRole("button", { name: "Save", exact: true })
            .click();
        } else {
          await page.keyboard.press("Escape");
        }
        await openModal.waitFor({ state: "detached", timeout: 10_000 });
      }
    }
    // Default is deliberately checked last above so the component-specific
    // browser assertions can continue on the same rendered canvas.
    const element = page.locator(story.tagName).first();
    if (story.tagName === "dt-link") {
      const underline = await element.evaluate((node) => {
        const anchor = node.shadowRoot?.querySelector("a");
        if (!(anchor instanceof HTMLAnchorElement)) return null;
        const styles = getComputedStyle(anchor, "::after");
        return {
          height: styles.height,
          maskImage: styles.maskImage,
          maskRepeat: styles.maskRepeat,
          maskSize: styles.maskSize,
        };
      });
      if (
        underline?.height !== "6px" ||
        underline.maskImage === "none" ||
        underline.maskRepeat !== "repeat-x" ||
        underline.maskSize !== "16px 6px"
      ) {
        throw new Error(
          `${story.defaultStoryId} must use the canonical 16px x 6px wavy underline: ${JSON.stringify(underline)}`,
        );
      }
    }
    if (
      ["dt-text-input", "dt-text-area", "dt-checkbox"].includes(story.tagName)
    ) {
      const formResult = await element.evaluate((_node, tagName) => {
        const form = document.createElement("form");
        const control = document.createElement(tagName);
        control.setAttribute("name", "field");
        control.setAttribute("label", "Field label");
        form.append(control);
        document.body.append(form);
        const nativeControl =
          control.shadowRoot?.querySelector("input, textarea");
        let eventResult = null;
        control.addEventListener(
          tagName === "dt-checkbox" ? "checked-change" : "value-change",
          (event) => {
            eventResult = {
              detail: event.detail,
              bubbles: event.bubbles,
              composed: event.composed,
            };
          },
          { once: true },
        );
        if (
          nativeControl instanceof HTMLInputElement &&
          nativeControl.type === "checkbox"
        ) {
          nativeControl.click();
        } else if (
          nativeControl instanceof HTMLInputElement ||
          nativeControl instanceof HTMLTextAreaElement
        ) {
          nativeControl.value = "browser value";
          nativeControl.dispatchEvent(
            new Event("input", { bubbles: true, composed: true }),
          );
        }
        control.setAttribute("helper-text", "Rerender check");
        const currentControl =
          control.shadowRoot?.querySelector("input, textarea");
        const label = control.shadowRoot?.querySelector("label");
        const result = {
          formValue: new FormData(form).get("field"),
          eventResult,
          liveValue:
            currentControl instanceof HTMLInputElement ||
            currentControl instanceof HTMLTextAreaElement
              ? currentControl.type === "checkbox"
                ? currentControl.checked
                : currentControl.value
              : null,
          labelFor: label?.getAttribute("for"),
          controlId: currentControl?.id,
        };
        form.remove();
        return result;
      }, story.tagName);
      const expectedValue =
        story.tagName === "dt-checkbox" ? "on" : "browser value";
      const expectedDetail =
        story.tagName === "dt-checkbox"
          ? { checked: true }
          : { value: "browser value" };
      if (
        formResult.formValue !== expectedValue ||
        JSON.stringify(formResult.eventResult) !==
          JSON.stringify({
            detail: expectedDetail,
            bubbles: true,
            composed: true,
          }) ||
        formResult.liveValue !==
          (story.tagName === "dt-checkbox" ? true : "browser value") ||
        formResult.labelFor !== formResult.controlId
      ) {
        throw new Error(
          `${story.tagName} failed form value, composed event, or label association DoD: ${JSON.stringify(formResult)}`,
        );
      }
    }
    if (story.tagName === "dt-label") {
      const labelResult = await page.evaluate(() => {
        const input = document.createElement("input");
        input.id = "native-label-target";
        const label = document.createElement("dt-label");
        label.setAttribute("for", input.id);
        label.setAttribute("required", "");
        label.textContent = "Email address";
        document.body.append(input, label);
        label.shadowRoot?.querySelector("label")?.click();
        const result = {
          labelFor: label.shadowRoot
            ?.querySelector("label")
            ?.getAttribute("for"),
          focussed: document.activeElement === input,
          association: input.getAttribute("aria-labelledby"),
          labelId: label.id,
          required: Boolean(
            label.shadowRoot?.querySelector('[part~="required-indicator"]'),
          ),
        };
        input.remove();
        label.remove();
        return result;
      });
      if (
        labelResult.labelFor !== "native-label-target" ||
        !labelResult.focussed ||
        !labelResult.association?.split(/\s+/).includes(labelResult.labelId) ||
        !labelResult.required
      ) {
        throw new Error(
          `dt-label failed target, accessible association, or required DoD: ${JSON.stringify(labelResult)}`,
        );
      }
    }
    if (story.tagName === "dt-helper-text") {
      const helperResult = await page.evaluate(() => {
        const helper = document.createElement("dt-helper-text");
        helper.setAttribute("state", "error");
        helper.textContent = "Correct the field.";
        document.body.append(helper);
        const message = helper.shadowRoot?.querySelector("p");
        const result = {
          role: message?.getAttribute("role"),
          hasIcon: Boolean(message?.querySelector("svg")),
          text: helper.textContent?.trim(),
        };
        helper.remove();
        return result;
      });
      if (
        helperResult.role !== "alert" ||
        !helperResult.hasIcon ||
        helperResult.text !== "Correct the field."
      ) {
        throw new Error(
          `dt-helper-text failed error semantics DoD: ${JSON.stringify(helperResult)}`,
        );
      }
    }
    if (story.tagName === "dt-form-field") {
      const fieldResult = await page.evaluate(() => {
        const field = document.createElement("dt-form-field");
        field.setAttribute("legend", "Preferences");
        field.setAttribute("group-description", "Choose all that apply.");
        field.setAttribute("error", "Choose one preference.");
        field.setAttribute("disabled", "");
        const input = document.createElement("input");
        input.type = "checkbox";
        field.append(input);
        document.body.append(field);
        const fieldset = field.shadowRoot?.querySelector("fieldset");
        const result = {
          legend: fieldset?.querySelector("legend")?.textContent?.trim(),
          disabled: fieldset?.hasAttribute("disabled"),
          childDisabled: input.disabled,
          describedBy: fieldset?.getAttribute("aria-describedby"),
          errorRole: fieldset?.querySelector(".error")?.getAttribute("role"),
        };
        field.remove();
        return result;
      });
      if (
        fieldResult.legend !== "Preferences" ||
        !fieldResult.disabled ||
        !fieldResult.childDisabled ||
        fieldResult.describedBy !== "group-description error" ||
        fieldResult.errorRole !== "alert"
      ) {
        throw new Error(
          `dt-form-field failed fieldset, description, or disabled DoD: ${JSON.stringify(fieldResult)}`,
        );
      }
    }
    if (story.tagName === "dt-radio") {
      const radioResult = await page.evaluate(() => {
        const form = document.createElement("form");
        const first = document.createElement("dt-radio");
        first.setAttribute("name", "discipline");
        first.setAttribute("value", "design");
        first.setAttribute("label", "Design");
        const second = document.createElement("dt-radio");
        second.setAttribute("name", "discipline");
        second.setAttribute("value", "engineering");
        second.setAttribute("label", "Engineering");
        let eventResult = null;
        second.addEventListener("checked-change", (event) => {
          eventResult = {
            detail: event.detail,
            bubbles: event.bubbles,
            composed: event.composed,
          };
        });
        form.append(first, second);
        document.body.append(form);
        first.shadowRoot?.querySelector("input")?.click();
        const input = second.shadowRoot?.querySelector("input");
        input?.focus();
        input?.click();
        const result = {
          formValue: new FormData(form).get("discipline"),
          firstChecked: first.hasAttribute("checked"),
          secondChecked: second.hasAttribute("checked"),
          focussed: second.shadowRoot?.activeElement === input,
          eventResult,
        };
        form.remove();
        return result;
      });
      if (
        radioResult.formValue !== "engineering" ||
        radioResult.firstChecked ||
        !radioResult.secondChecked ||
        !radioResult.focussed ||
        JSON.stringify(radioResult.eventResult) !==
          JSON.stringify({
            detail: { checked: true },
            bubbles: true,
            composed: true,
          })
      ) {
        throw new Error(
          `dt-radio failed exclusivity, form, focus, or event DoD: ${JSON.stringify(radioResult)}`,
        );
      }
    }
    if (story.tagName === "dt-radio-group") {
      const groupResult = await page.evaluate(() => {
        const form = document.createElement("form");
        const group = document.createElement("dt-radio-group");
        group.setAttribute("name", "discipline");
        group.setAttribute("legend", "Discipline");
        group.setAttribute(
          "options",
          JSON.stringify([
            { value: "design", label: "Design" },
            { value: "engineering", label: "Engineering" },
          ]),
        );
        let detail = null;
        group.addEventListener("value-change", (event) => {
          detail = event.detail;
        });
        form.append(group);
        document.body.append(form);
        const radios = group.shadowRoot?.querySelectorAll(
          ".options > dt-radio",
        );
        const second = radios?.[1];
        const input = second?.shadowRoot?.querySelector("input");
        input?.focus();
        input?.click();
        group.setAttribute("helper-text", "Rerender check");
        const current = group.shadowRoot?.querySelectorAll(
          ".options > dt-radio",
        )[1];
        const result = {
          formValue: new FormData(form).get("discipline"),
          value: group.value,
          detail,
          legend: group.shadowRoot?.querySelector("legend")?.textContent,
          checked: current?.hasAttribute("checked"),
        };
        form.remove();
        return result;
      });
      if (
        groupResult.formValue !== "engineering" ||
        groupResult.value !== "engineering" ||
        JSON.stringify(groupResult.detail) !==
          JSON.stringify({ value: "engineering" }) ||
        groupResult.legend !== "Discipline" ||
        !groupResult.checked
      ) {
        throw new Error(
          `dt-radio-group failed form, live value, or fieldset DoD: ${JSON.stringify(groupResult)}`,
        );
      }
    }
    if (story.tagName === "dt-checkbox-group") {
      const checkboxGroupResult = await page.evaluate(() => {
        const form = document.createElement("form");
        const group = document.createElement("dt-checkbox-group");
        group.setAttribute("name", "services");
        group.setAttribute("label", "Services");
        group.setAttribute(
          "options",
          JSON.stringify([
            { value: "strategy", label: "Strategy" },
            { value: "design", label: "Design" },
          ]),
        );
        group.setAttribute("default-selected", JSON.stringify(["strategy"]));
        let detail = null;
        group.addEventListener("selected-change", (event) => {
          detail = event.detail;
        });
        form.append(group);
        document.body.append(form);
        const design = group.shadowRoot?.querySelectorAll(
          ".options > dt-checkbox",
        )[1];
        design?.shadowRoot?.querySelector("input")?.click();
        const result = {
          formValues: new FormData(form).getAll("services"),
          selected: group.selected,
          detail,
          legend: group.shadowRoot?.querySelector("legend")?.textContent,
          masterChecked: group.shadowRoot
            ?.querySelector("dt-checkbox[data-master]")
            ?.hasAttribute("checked"),
        };
        form.remove();
        return result;
      });
      if (
        JSON.stringify(checkboxGroupResult.formValues) !==
          JSON.stringify(["strategy", "design"]) ||
        JSON.stringify(checkboxGroupResult.selected) !==
          JSON.stringify(["strategy", "design"]) ||
        JSON.stringify(checkboxGroupResult.detail) !==
          JSON.stringify({ selected: ["strategy", "design"] }) ||
        checkboxGroupResult.legend !== "Services" ||
        !checkboxGroupResult.masterChecked
      ) {
        throw new Error(
          `dt-checkbox-group failed form, master, or event DoD: ${JSON.stringify(checkboxGroupResult)}`,
        );
      }
    }
    if (story.tagName === "dt-select") {
      const selectResult = await page.evaluate(() => {
        const form = document.createElement("form");
        const select = document.createElement("dt-select");
        select.setAttribute("name", "discipline");
        select.setAttribute("label", "Discipline");
        select.setAttribute(
          "options",
          JSON.stringify([
            { value: "design", label: "Design" },
            { value: "engineering", label: "Engineering" },
          ]),
        );
        const events = [];
        let detail = null;
        select.addEventListener("value-change", (event) => {
          events.push("value-change");
          detail = event.detail;
        });
        select.addEventListener("change", () => events.push("change"));
        form.append(select);
        document.body.append(form);
        const control = select.shadowRoot?.querySelector("select");
        control.value = "engineering";
        control.dispatchEvent(new Event("change", { bubbles: true }));
        select.setAttribute("helper-text", "Rerender check");
        const current = select.shadowRoot?.querySelector("select");
        const result = {
          formValue: new FormData(form).get("discipline"),
          value: select.value,
          detail,
          events,
          optionCount: current?.options.length,
          currentValue: current?.value,
          labelFor: select.shadowRoot?.querySelector("label")?.htmlFor,
          controlId: current?.id,
        };
        form.remove();
        return result;
      });
      if (
        selectResult.formValue !== "engineering" ||
        selectResult.value !== "engineering" ||
        JSON.stringify(selectResult.detail) !==
          JSON.stringify({ value: "engineering" }) ||
        JSON.stringify(selectResult.events) !==
          JSON.stringify(["value-change", "change"]) ||
        selectResult.optionCount !== 2 ||
        selectResult.currentValue !== "engineering" ||
        selectResult.labelFor !== selectResult.controlId
      ) {
        throw new Error(
          `dt-select failed form, option, event-order, or live-value DoD: ${JSON.stringify(selectResult)}`,
        );
      }
    }
    if (story.tagName === "dt-switch") {
      const switchResult = await element.evaluate((node) => {
        const button = node.shadowRoot?.querySelector("button");
        let eventResult = null;
        node.addEventListener(
          "checked-change",
          (event) => {
            eventResult = {
              detail: event.detail,
              bubbles: event.bubbles,
              composed: event.composed,
            };
          },
          { once: true },
        );
        button?.click();
        return {
          role: button?.getAttribute("role"),
          checked: node.shadowRoot
            ?.querySelector("button")
            ?.getAttribute("aria-checked"),
          eventResult,
        };
      });
      if (
        switchResult.role !== "switch" ||
        switchResult.checked !== "true" ||
        JSON.stringify(switchResult.eventResult) !==
          JSON.stringify({
            detail: { checked: true },
            bubbles: true,
            composed: true,
          })
      ) {
        throw new Error(
          `dt-switch failed role/state/event DoD: ${JSON.stringify(switchResult)}`,
        );
      }
    }
    if (story.tagName === "dt-card") {
      const cardResult = await page.evaluate(() => {
        const linked = document.createElement("dt-card");
        linked.setAttribute("title-text", "Case study");
        linked.setAttribute("link", "/work/case-study");
        linked.setAttribute("link-label", "Read the case study");
        linked.setAttribute("content", "Portable card body");

        const action = document.createElement("dt-card");
        action.setAttribute("title-text", "Action card");
        action.setAttribute("link", "/ignored");
        const button = document.createElement("button");
        button.slot = "footer-end";
        button.textContent = "Confirm";
        action.append(button);

        const loading = document.createElement("dt-card");
        loading.setAttribute("loading", "");

        const unsafe = document.createElement("dt-card");
        unsafe.setAttribute("title-text", "Unsafe link");
        unsafe.setAttribute("link", "javascript:alert(1)");

        document.body.append(linked, action, loading, unsafe);
        const linkedAnchors = linked.shadowRoot?.querySelectorAll("a") ?? [];
        const linkedAnchor = linkedAnchors[0];
        const actionRoot = action.shadowRoot?.querySelector('[part~="card"]');
        const loadingRoot = loading.shadowRoot?.querySelector('[part~="card"]');
        const unsafeAnchor = unsafe.shadowRoot?.querySelector("a");
        const result = {
          linkedAnchorCount: linkedAnchors.length,
          linkedName: linkedAnchor?.getAttribute("aria-label"),
          linkedHref: linkedAnchor?.getAttribute("href"),
          bodyText: linked.shadowRoot
            ?.querySelector('[part~="body"]')
            ?.textContent?.trim(),
          actionAnchorCount:
            action.shadowRoot?.querySelectorAll("a").length ?? -1,
          actionHasFooter: Boolean(
            action.shadowRoot?.querySelector('[part~="footer"]'),
          ),
          actionTag: actionRoot?.tagName,
          loadingRole: loadingRoot?.getAttribute("role"),
          loadingBusy: loadingRoot?.getAttribute("aria-busy"),
          loadingSkeleton: Boolean(
            loading.shadowRoot?.querySelector('[part~="skeleton"]'),
          ),
          unsafeHref: unsafeAnchor?.getAttribute("href"),
        };
        linked.remove();
        action.remove();
        loading.remove();
        unsafe.remove();
        return result;
      });
      if (
        cardResult.linkedAnchorCount !== 1 ||
        cardResult.linkedName !== "Read the case study" ||
        cardResult.linkedHref !== "/work/case-study" ||
        cardResult.bodyText !== "Portable card body" ||
        cardResult.actionAnchorCount !== 0 ||
        !cardResult.actionHasFooter ||
        cardResult.actionTag !== "DIV" ||
        cardResult.loadingRole !== "status" ||
        cardResult.loadingBusy !== "true" ||
        !cardResult.loadingSkeleton ||
        cardResult.unsafeHref !== "#"
      ) {
        throw new Error(
          `dt-card failed composition, link, or loading DoD: ${JSON.stringify(cardResult)}`,
        );
      }
    }
    if (story.tagName === "dt-center") {
      const centerResult = await page.evaluate(() => {
        const center = document.createElement("dt-center");
        center.setAttribute("as", "section");
        center.setAttribute("content", "Centered fallback");
        center.setAttribute("aria-label", "Focal content");
        document.body.append(center);
        const root = center.shadowRoot?.querySelector('[part~="center"]');
        const result = {
          tagName: root?.tagName,
          label: root?.getAttribute("aria-label"),
          text: root?.textContent?.trim(),
          display:
            root instanceof HTMLElement ? getComputedStyle(root).display : null,
          alignItems:
            root instanceof HTMLElement
              ? getComputedStyle(root).alignItems
              : null,
          justifyContent:
            root instanceof HTMLElement
              ? getComputedStyle(root).justifyContent
              : null,
        };
        center.remove();
        return result;
      });
      if (
        centerResult.tagName !== "SECTION" ||
        centerResult.label !== "Focal content" ||
        centerResult.text !== "Centered fallback" ||
        centerResult.display !== "flex" ||
        centerResult.alignItems !== "center" ||
        centerResult.justifyContent !== "center"
      ) {
        throw new Error(
          `dt-center failed semantic or alignment DoD: ${JSON.stringify(centerResult)}`,
        );
      }
    }
    if (story.tagName === "dt-container") {
      const containerResult = await page.evaluate(() => {
        const centered = document.createElement("dt-container");
        centered.setAttribute("content", "Centered by default");
        const uncentered = document.createElement("dt-container");
        uncentered.setAttribute("as", "main");
        uncentered.setAttribute("center", "false");
        uncentered.setAttribute("content", "Landmark content");
        document.body.append(centered, uncentered);
        const centeredRoot = centered.shadowRoot?.querySelector(
          '[part~="container"]',
        );
        const uncenteredRoot = uncentered.shadowRoot?.querySelector(
          '[part~="container"]',
        );
        const result = {
          centeredValue: centered.center,
          centeredClass:
            centeredRoot instanceof HTMLElement
              ? centeredRoot.classList.contains("centered")
              : false,
          uncenteredValue: uncentered.center,
          uncenteredClass:
            uncenteredRoot instanceof HTMLElement
              ? uncenteredRoot.classList.contains("centered")
              : true,
          uncenteredTag: uncenteredRoot?.tagName,
          text: uncenteredRoot?.textContent?.trim(),
        };
        centered.remove();
        uncentered.remove();
        return result;
      });
      if (
        containerResult.centeredValue !== true ||
        containerResult.centeredClass !== true ||
        containerResult.uncenteredValue !== false ||
        containerResult.uncenteredClass !== false ||
        containerResult.uncenteredTag !== "MAIN" ||
        containerResult.text !== "Landmark content"
      ) {
        throw new Error(
          `dt-container failed centering or semantic DoD: ${JSON.stringify(containerResult)}`,
        );
      }
    }
    if (story.tagName === "dt-spacer") {
      const spacerResult = await element.evaluate((node) => {
        const spacer = node.shadowRoot?.querySelector('[part~="spacer"]');
        const styles =
          spacer instanceof HTMLElement ? getComputedStyle(spacer) : null;
        return {
          hostHidden: node.getAttribute("aria-hidden"),
          internalHidden: spacer?.getAttribute("aria-hidden"),
          width: styles?.width,
          height: styles?.height,
        };
      });
      if (
        spacerResult.hostHidden !== "true" ||
        spacerResult.internalHidden !== "true" ||
        spacerResult.width === "0px" ||
        spacerResult.height !== "24px"
      ) {
        throw new Error(
          `dt-spacer failed hidden geometry DoD: ${JSON.stringify(spacerResult)}`,
        );
      }
    }
    if (story.tagName === "dt-aspect-ratio") {
      const ratioResult = await element.evaluate((node) => {
        const frame = node.shadowRoot?.querySelector('[part~="frame"]');
        const content = node.shadowRoot?.querySelector('[part~="content"]');
        const frameStyles =
          frame instanceof HTMLElement ? getComputedStyle(frame) : null;
        const contentStyles =
          content instanceof HTMLElement ? getComputedStyle(content) : null;
        const bounds = frame?.getBoundingClientRect();
        return {
          ratio: frameStyles?.aspectRatio,
          overflow: frameStyles?.overflow,
          position: frameStyles?.position,
          contentPosition: contentStyles?.position,
          width: bounds?.width ?? 0,
          height: bounds?.height ?? 0,
        };
      });
      const renderedRatio = ratioResult.width / ratioResult.height;
      if (
        ratioResult.ratio !== "16 / 9" ||
        ratioResult.overflow !== "hidden" ||
        ratioResult.position !== "relative" ||
        ratioResult.contentPosition !== "absolute" ||
        ratioResult.width <= 0 ||
        ratioResult.height <= 0 ||
        Math.abs(renderedRatio - 16 / 9) > 0.01
      ) {
        throw new Error(
          `dt-aspect-ratio failed reserved-frame DoD: ${JSON.stringify(ratioResult)}`,
        );
      }
    }
    if (story.tagName === "dt-avatar") {
      const avatarResult = await page.evaluate(() => {
        const avatar = document.createElement("dt-avatar");
        avatar.setAttribute("name", "Aino Virtanen");
        avatar.setAttribute("variant", "initials");
        avatar.menuItems = [
          { id: "profile", label: "Profile" },
          { id: "sign-out", label: "Sign out" },
        ];
        let detail = null;
        avatar.addEventListener("menu-select", (event) => {
          detail = event.detail;
        });
        document.body.append(avatar);
        const trigger = avatar.shadowRoot?.querySelector("button");
        trigger?.click();
        const item = avatar.shadowRoot?.querySelector('[role="menuitem"]');
        item?.click();
        const result = {
          initials: avatar.shadowRoot
            ?.querySelector('[part~="initials"]')
            ?.textContent?.trim(),
          triggerLabel: trigger?.getAttribute("aria-label"),
          detail,
          expanded: avatar.shadowRoot
            ?.querySelector("button")
            ?.getAttribute("aria-expanded"),
        };
        avatar.remove();
        return result;
      });
      if (
        avatarResult.initials !== "AV" ||
        avatarResult.triggerLabel !== "Aino Virtanen menu" ||
        avatarResult.detail?.id !== "profile" ||
        avatarResult.expanded !== "false"
      ) {
        throw new Error(
          `dt-avatar failed initials, menu, or event DoD: ${JSON.stringify(avatarResult)}`,
        );
      }
    }
    if (story.tagName === "dt-avatar-group") {
      const groupResult = await page.evaluate(() => {
        const group = document.createElement("dt-avatar-group");
        group.setAttribute("aria-label", "Project members");
        group.setAttribute("max", "2");
        for (const name of ["Aino", "Bo", "Carla", "Deniz"]) {
          const avatar = document.createElement("dt-avatar");
          avatar.setAttribute("name", name);
          avatar.setAttribute("variant", "initials");
          group.append(avatar);
        }
        document.body.append(group);
        const result = {
          role: group.shadowRoot
            ?.querySelector('[part~="group"]')
            ?.getAttribute("role"),
          label: group.shadowRoot
            ?.querySelector('[part~="group"]')
            ?.getAttribute("aria-label"),
          hidden: [...group.children].filter(
            (child) =>
              child.getAttribute("data-dt-avatar-group-hidden") === "true",
          ).length,
          overflow: group.shadowRoot
            ?.querySelector('[part~="overflow"]')
            ?.textContent?.replace(/\s+/g, " ")
            .trim(),
        };
        group.remove();
        return result;
      });
      if (
        groupResult.role !== "group" ||
        groupResult.label !== "Project members" ||
        groupResult.hidden !== 2 ||
        groupResult.overflow !== "+22 more"
      ) {
        throw new Error(
          `dt-avatar-group failed grouping or overflow DoD: ${JSON.stringify(groupResult)}`,
        );
      }
    }
    if (story.tagName === "dt-display") {
      const displayResult = await page.evaluate(() => {
        const display = document.createElement("dt-display");
        display.setAttribute("as", "h2");
        display.setAttribute("content", "Section hero");
        document.body.append(display);
        const root = display.shadowRoot?.querySelector('[part~="display"]');
        const result = { tagName: root?.tagName, text: root?.textContent };
        display.remove();
        return result;
      });
      if (
        displayResult.tagName !== "H2" ||
        displayResult.text !== "Section hero"
      ) {
        throw new Error(
          `dt-display failed semantic content DoD: ${JSON.stringify(displayResult)}`,
        );
      }
    }
    if (story.tagName === "dt-flex-box") {
      const flexResult = await page.evaluate(() => {
        const flex = document.createElement("dt-flex-box");
        flex.setAttribute("direction", "column");
        flex.setAttribute("justify", "space-between");
        flex.setAttribute("gap", "12");
        document.body.append(flex);
        const root = flex.shadowRoot?.querySelector('[part~="flex-box"]');
        const computed =
          root instanceof HTMLElement ? getComputedStyle(root) : null;
        const result = {
          display: computed?.display,
          direction: computed?.flexDirection,
          justify: computed?.justifyContent,
          gap: computed?.gap,
        };
        flex.remove();
        return result;
      });
      if (
        flexResult.display !== "flex" ||
        flexResult.direction !== "column" ||
        flexResult.justify !== "space-between" ||
        flexResult.gap !== "12px"
      ) {
        throw new Error(
          `dt-flex-box failed layout DoD: ${JSON.stringify(flexResult)}`,
        );
      }
    }
    if (story.tagName === "dt-grid") {
      const gridResult = await page.evaluate(() => {
        const grid = document.createElement("dt-grid");
        grid.setAttribute("columns", "2");
        grid.setAttribute("tablet-columns", "3");
        const feature = document.createElement("div");
        feature.setAttribute("span", "2");
        grid.append(feature, document.createElement("div"));
        document.body.append(grid);
        const root = grid.shadowRoot?.querySelector('[part~="grid"]');
        const result = {
          display:
            root instanceof HTMLElement ? getComputedStyle(root).display : null,
          responsive: root?.classList.contains("responsive"),
          base:
            root instanceof HTMLElement
              ? root.style.getPropertyValue("--grid-cols")
              : null,
          tablet:
            root instanceof HTMLElement
              ? root.style.getPropertyValue("--grid-cols-tablet")
              : null,
          span: feature.style.gridColumn,
        };
        grid.remove();
        return result;
      });
      if (
        gridResult.display !== "grid" ||
        !gridResult.responsive ||
        gridResult.base !== "repeat(2, minmax(0, 1fr))" ||
        gridResult.tablet !== "repeat(3, minmax(0, 1fr))" ||
        gridResult.span !== "span 2"
      ) {
        throw new Error(
          `dt-grid failed responsive tracks or span DoD: ${JSON.stringify(gridResult)}`,
        );
      }
    }
    if (story.tagName === "dt-kbd") {
      const kbdResult = await element.evaluate((node) => {
        const root = node.shadowRoot?.querySelector('[part~="kbd"]');
        return { tagName: root?.tagName, text: root?.textContent?.trim() };
      });
      if (kbdResult.tagName !== "KBD" || kbdResult.text !== "Esc") {
        throw new Error(
          `dt-kbd failed semantic keycap DoD: ${JSON.stringify(kbdResult)}`,
        );
      }
    }
    if (story.tagName === "dt-skeleton") {
      const skeletonResult = await element.evaluate((node) => {
        const root = node.shadowRoot?.querySelector('[part~="skeleton"]');
        const firstLine = node.shadowRoot?.querySelector(
          '[part~="skeleton-line"]',
        );
        return {
          role: root?.getAttribute("role"),
          live: root?.getAttribute("aria-live"),
          label: root?.getAttribute("aria-label"),
          lines: node.shadowRoot?.querySelectorAll('[part~="skeleton-line"]')
            .length,
          firstLineWidth: firstLine?.getBoundingClientRect().width ?? 0,
        };
      });
      if (
        skeletonResult.role !== "status" ||
        skeletonResult.live !== "polite" ||
        skeletonResult.label !== "Loading content" ||
        skeletonResult.lines !== 3 ||
        skeletonResult.firstLineWidth <= 0
      ) {
        throw new Error(
          `dt-skeleton failed loading semantics DoD: ${JSON.stringify(skeletonResult)}`,
        );
      }
    }
    if (story.tagName === "dt-visually-hidden") {
      const hiddenResult = await element.evaluate((node) => {
        const root = node.shadowRoot?.querySelector(
          '[part~="visually-hidden"]',
        );
        const computed =
          root instanceof HTMLElement ? getComputedStyle(root) : null;
        return {
          tagName: root?.tagName,
          text: root?.textContent?.trim(),
          position: computed?.position,
          width: computed?.width,
          height: computed?.height,
          clipPath: computed?.clipPath,
        };
      });
      if (
        hiddenResult.tagName !== "SPAN" ||
        hiddenResult.text !== "Additional context for screen readers" ||
        hiddenResult.position !== "absolute" ||
        hiddenResult.width !== "1px" ||
        hiddenResult.height !== "1px" ||
        hiddenResult.clipPath !== "inset(50%)"
      ) {
        throw new Error(
          `dt-visually-hidden failed hidden-content DoD: ${JSON.stringify(hiddenResult)}`,
        );
      }
    }
    const parityTargets = {
      "dt-text": {
        part: "text",
        selector: "#storybook-root > p",
        properties: [
          "color",
          "fontFamily",
          "fontSize",
          "fontWeight",
          "lineHeight",
          "marginBlockEnd",
          "marginBlockStart",
        ],
      },
      "dt-title": {
        part: "title",
        selector: "#storybook-root > h2",
        properties: [
          "color",
          "fontFamily",
          "fontSize",
          "fontWeight",
          "lineHeight",
          "marginBlockEnd",
          "marginBlockStart",
        ],
      },
      "dt-list": {
        part: "list",
        selector: "#storybook-root > ul",
        properties: [
          "fontFamily",
          "fontSize",
          "lineHeight",
          "listStyleType",
          "paddingInlineStart",
        ],
      },
      "dt-section": {
        part: "section",
        selector: "#storybook-root > section",
        properties: [
          "backgroundColor",
          "color",
          "paddingBlockEnd",
          "paddingBlockStart",
        ],
      },
      "dt-stack": {
        part: "stack",
        selector: "#storybook-root > div",
        properties: [
          "alignItems",
          "display",
          "flexDirection",
          "flexWrap",
          "gap",
          "justifyContent",
        ],
      },
      "dt-card": {
        part: "card",
        selector: "#storybook-root > div",
        properties: [
          "backgroundColor",
          "borderBlockStartColor",
          "borderBlockStartStyle",
          "borderBlockStartWidth",
          "borderRadius",
          "display",
          "flexDirection",
          "gap",
          "paddingBlockEnd",
          "paddingBlockStart",
          "paddingInlineEnd",
          "paddingInlineStart",
          "position",
        ],
      },
      "dt-center": {
        part: "center",
        selector: "#storybook-root > .flex.items-center.justify-center",
        properties: ["alignItems", "display", "justifyContent"],
      },
      "dt-container": {
        part: "container",
        selector: "#storybook-root > .max-w-container-lg",
        properties: [
          "boxSizing",
          "marginInlineEnd",
          "marginInlineStart",
          "maxWidth",
          "paddingInlineEnd",
          "paddingInlineStart",
          "width",
        ],
      },
      "dt-spacer": {
        part: "spacer",
        selector:
          '#storybook-root > div:not([data-axe-ignore]) > [aria-hidden="true"]',
        properties: ["height", "width"],
      },
      "dt-aspect-ratio": {
        part: "frame",
        selector: "#storybook-root .relative.overflow-hidden",
        properties: ["aspectRatio", "overflow", "position"],
      },
      "dt-avatar": {
        part: "image",
        selector: "#storybook-root img",
        properties: ["borderRadius", "display", "height", "objectFit", "width"],
      },
      "dt-avatar-group": {
        part: "group",
        selector: '#storybook-root > [role="group"]',
        properties: ["alignItems", "display"],
      },
      "dt-display": {
        part: "display",
        selector: "#storybook-root > h1",
        properties: [
          "color",
          "fontFamily",
          "fontSize",
          "fontWeight",
          "lineHeight",
        ],
      },
      "dt-flex-box": {
        part: "flex-box",
        selector: "#storybook-root > div",
        properties: [
          "alignItems",
          "display",
          "flexDirection",
          "flexWrap",
          "gap",
          "justifyContent",
        ],
      },
      "dt-grid": {
        part: "grid",
        selector: "#storybook-root > div",
        properties: [
          "columnGap",
          "display",
          "gridAutoRows",
          "gridTemplateColumns",
          "rowGap",
          "width",
        ],
      },
      "dt-kbd": {
        part: "kbd",
        selector: "#storybook-root > kbd",
        properties: [
          "backgroundColor",
          "borderBlockEndWidth",
          "borderRadius",
          "color",
          "display",
          "fontFamily",
          "fontSize",
          "lineHeight",
        ],
      },
      "dt-skeleton": {
        part: "skeleton",
        selector: '#storybook-root > [role="status"]',
        properties: [
          "borderRadius",
          "display",
          "flexDirection",
          "gap",
          "overflow",
        ],
      },
      "dt-visually-hidden": {
        part: "visually-hidden",
        selector: "#storybook-root > span",
        properties: [
          "clipPath",
          "height",
          "margin",
          "overflow",
          "padding",
          "position",
          "whiteSpace",
          "width",
        ],
      },
    };
    const parityTarget = parityTargets[story.tagName];
    if (parityTarget) {
      const nativeSnapshot = await element.evaluate((node, target) => {
        const rendered = node.shadowRoot?.querySelector(
          `[part~="${target.part}"]`,
        );
        if (!(rendered instanceof HTMLElement)) return null;
        const computed = getComputedStyle(rendered);
        return {
          tagName: rendered.tagName,
          itemCount: rendered.querySelectorAll("li").length,
          styles: Object.fromEntries(
            target.properties.map((property) => {
              const value = computed[property];
              return [
                property,
                property === "listStyleType" && value === '\" \"'
                  ? "none"
                  : property === "fontFamily"
                    ? [
                        ...new Set(
                          value.split(",").map((family) => family.trim()),
                        ),
                      ].join(", ")
                    : value,
              ];
            }),
          ),
        };
      }, parityTarget);
      await page.goto(
        `${baseUrl}/iframe.html?id=${story.canonicalDefaultStoryId}&viewMode=story`,
        { waitUntil: "domcontentloaded", timeout: 60_000 },
      );
      const canonical = page.locator(parityTarget.selector);
      await canonical.waitFor({ state: "attached", timeout: 30_000 });
      const reactSnapshot = await canonical.evaluate((rendered, target) => {
        const computed = getComputedStyle(rendered);
        return {
          tagName: rendered.tagName,
          itemCount: rendered.querySelectorAll("li").length,
          styles: Object.fromEntries(
            target.properties.map((property) => {
              const value = computed[property];
              return [
                property,
                property === "listStyleType" && value === '\" \"'
                  ? "none"
                  : property === "fontFamily"
                    ? [
                        ...new Set(
                          value.split(",").map((family) => family.trim()),
                        ),
                      ].join(", ")
                    : value,
              ];
            }),
          ),
        };
      }, parityTarget);
      if (JSON.stringify(nativeSnapshot) !== JSON.stringify(reactSnapshot)) {
        throw new Error(
          `${story.tagName} Default semantics/style parity failed:\nReact ${JSON.stringify(reactSnapshot)}\nNative ${JSON.stringify(nativeSnapshot)}`,
        );
      }
    }
    if (story.tagName === "dt-avatar") {
      await page.goto(
        `${baseUrl}/iframe.html?id=${story.nativeStoryIds.Example}&viewMode=story`,
        { waitUntil: "domcontentloaded", timeout: 60_000 },
      );
      const avatarExample = page.locator("dt-avatar").first();
      await avatarExample.waitFor({ state: "attached", timeout: 30_000 });
      const trigger = avatarExample.locator('[part~="trigger"]');
      await trigger.click();
      const menuItems = avatarExample.locator('[role="menuitem"]');
      if ((await menuItems.count()) !== 4) {
        throw new Error(
          "dt-avatar Example must preserve the canonical four-item menu behavior",
        );
      }
      await menuItems.first().click();
      if (
        (await avatarExample
          .locator('[part~="trigger"]')
          .getAttribute("aria-expanded")) !== "false"
      ) {
        throw new Error("dt-avatar Example menu must close after selection");
      }
    }
    if (story.tagName === "dt-display") {
      await page.goto(
        `${baseUrl}/iframe.html?id=${story.nativeStoryIds["Constrained Measure"]}&viewMode=story`,
        { waitUntil: "domcontentloaded", timeout: 60_000 },
      );
      const constrained = page.locator("dt-display").first();
      await constrained.waitFor({ state: "attached", timeout: 30_000 });
      const constrainedResult = await constrained.evaluate((node) => ({
        maxWidth: getComputedStyle(node.parentElement).maxWidth,
        text: node.shadowRoot
          ?.querySelector('[part~="display"]')
          ?.textContent?.trim(),
      }));
      if (
        constrainedResult.maxWidth !== "576px" ||
        constrainedResult.text !==
          "A hero line that wraps with intent, not by accident."
      ) {
        throw new Error(
          `dt-display Constrained Measure parity failed: ${JSON.stringify(constrainedResult)}`,
        );
      }
    }
    if (story.semanticListStoryIds) {
      const snapshotSemanticList = async (storyId, selector, shadowPart) => {
        await page.goto(`${baseUrl}/iframe.html?id=${storyId}&viewMode=story`, {
          waitUntil: "domcontentloaded",
          timeout: 60_000,
        });
        const host = page.locator(selector);
        await host.waitFor({ state: "attached", timeout: 30_000 });
        return host.evaluate((node, part) => {
          const list = part
            ? node.shadowRoot?.querySelector(`[part~="${part}"]`)
            : node;
          if (!(list instanceof HTMLElement)) return null;
          const item = part
            ? node.querySelector("li")
            : list.querySelector("li");
          if (!(item instanceof HTMLElement)) return null;
          const listStyles = getComputedStyle(list);
          const itemStyles = getComputedStyle(item);
          return {
            tagName: list.tagName,
            itemCount: part
              ? node.querySelectorAll("li").length
              : list.querySelectorAll("li").length,
            listStyleType: listStyles.listStyleType,
            margin: listStyles.margin,
            padding: listStyles.padding,
            itemBorderStyle: itemStyles.borderBlockStartStyle,
            itemBorderWidth: itemStyles.borderBlockStartWidth,
            itemPadding: itemStyles.padding,
          };
        }, shadowPart);
      };
      const nativeSnapshot = await snapshotSemanticList(
        story.semanticListStoryIds.native,
        "dt-stack",
        "stack",
      );
      const reactSnapshot = await snapshotSemanticList(
        story.semanticListStoryIds.canonical,
        "#storybook-root > ul",
        null,
      );
      if (JSON.stringify(nativeSnapshot) !== JSON.stringify(reactSnapshot)) {
        throw new Error(
          `dt-stack Semantic List parity failed:\nReact ${JSON.stringify(reactSnapshot)}\nNative ${JSON.stringify(nativeSnapshot)}`,
        );
      }
    }
    await page.waitForTimeout(50);
  }

  const docsPage = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  captureErrors(docsPage);

  for (const component of expectedComponents) {
    const canonicalDocsId = `${slug(component.canonicalTitle)}--docs`;
    process.stdout.write(`Verifying ${component.canonicalTitle} docs... `);
    await docsPage.goto(`${baseUrl}/?path=/docs/${canonicalDocsId}`, {
      waitUntil: "domcontentloaded",
      timeout: 60_000,
    });
    const canonicalPreview = docsPage.frameLocator(
      'iframe[title="storybook-preview-iframe"]',
    );
    const nativeLink = canonicalPreview
      .getByRole("navigation", { name: "Implementation" })
      .getByRole("link", { name: "Web component" });
    await nativeLink.waitFor({ timeout: 30_000 });
    const nativeHref = await nativeLink.getAttribute("href");
    const expectedNativeHref = `/?path=/docs/${component.docsId}`;
    if (nativeHref !== expectedNativeHref) {
      throw new Error(
        `${component.canonicalTitle} React docs link to ${nativeHref ?? "nothing"}, expected ${expectedNativeHref}`,
      );
    }

    await docsPage.goto(`${baseUrl}/?path=/docs/${component.docsId}`, {
      waitUntil: "domcontentloaded",
      timeout: 60_000,
    });
    const nativePreview = docsPage.frameLocator(
      'iframe[title="storybook-preview-iframe"]',
    );
    const reactLink = nativePreview
      .getByRole("navigation", { name: "Implementation" })
      .getByRole("link", { name: "React" });
    await reactLink.waitFor({ timeout: 30_000 });
    const reactHref = await reactLink.getAttribute("href");
    const expectedReactHref = `/?path=/docs/${canonicalDocsId}`;
    if (reactHref !== expectedReactHref) {
      throw new Error(
        `${component.title} docs link to ${reactHref ?? "nothing"}, expected ${expectedReactHref}`,
      );
    }
    process.stdout.write("ok\n");
  }
  await docsPage.close();

  if (errors.length > 0) {
    throw new Error(`Storybook browser errors:\n${errors.join("\n")}`);
  }
} finally {
  await browser.close();
}

console.log(
  `✓ Storybook verified ${expectedComponents.length} component folders, 100% declared React story parity, native renders, and bidirectional implementation links`,
);
