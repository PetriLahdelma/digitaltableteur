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
