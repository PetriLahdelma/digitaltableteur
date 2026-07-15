#!/usr/bin/env node
import { chromium } from "playwright";
import elements from "../../packages/web-components/web-components.config.mjs";
import { evaluateStoryParity } from "./web-component-story-parity.mjs";

const baseUrl =
  process.argv
    .find((argument) => argument.startsWith("--url="))
    ?.slice("--url=".length) ?? "http://127.0.0.1:6010";

const nativeElements = elements.filter(
  (element) => element.defaultBackend === "native",
);

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
    await page.goto(
      `${baseUrl}/iframe.html?id=${story.defaultStoryId}&viewMode=story`,
      { waitUntil: "domcontentloaded", timeout: 60_000 },
    );
    const element = page.locator(story.tagName).first();
    await element.waitFor({ state: "attached", timeout: 30_000 });
    const result = await element.evaluate(
      (node, tagName) => ({
        defined: Boolean(customElements.get(tagName)),
        hasShadowRoot: Boolean(node.shadowRoot),
        bounds: node.getBoundingClientRect().toJSON(),
        text: node.textContent?.trim() ?? "",
      }),
      story.tagName,
    );
    if (!result.defined || !result.hasShadowRoot) {
      throw new Error(
        `${story.defaultStoryId} did not render a registered shadow-root ${story.tagName}`,
      );
    }
    if (
      story.tagName === "dt-status-dot" &&
      (result.bounds.width <= 0 ||
        result.bounds.height <= 0 ||
        result.text.length === 0)
    ) {
      throw new Error(
        `${story.defaultStoryId} must render a visible, labelled status dot`,
      );
    }
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
        let eventDetail = null;
        control.addEventListener(
          tagName === "dt-checkbox" ? "checked-change" : "value-change",
          (event) => {
            eventDetail = event.detail;
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
          eventDetail,
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
        JSON.stringify(formResult.eventDetail) !==
          JSON.stringify(expectedDetail) ||
        formResult.liveValue !==
          (story.tagName === "dt-checkbox" ? true : "browser value") ||
        formResult.labelFor !== formResult.controlId
      ) {
        throw new Error(
          `${story.tagName} failed form value, composed event, or label association DoD: ${JSON.stringify(formResult)}`,
        );
      }
    }
    if (story.tagName === "dt-switch") {
      const switchResult = await element.evaluate((node) => {
        const button = node.shadowRoot?.querySelector("button");
        let detail = null;
        node.addEventListener(
          "checked-change",
          (event) => {
            detail = event.detail;
          },
          { once: true },
        );
        button?.click();
        return {
          role: button?.getAttribute("role"),
          checked: node.shadowRoot
            ?.querySelector("button")
            ?.getAttribute("aria-checked"),
          detail,
        };
      });
      if (
        switchResult.role !== "switch" ||
        switchResult.checked !== "true" ||
        !switchResult.detail
      ) {
        throw new Error(
          `dt-switch failed role/state/event DoD: ${JSON.stringify(switchResult)}`,
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
