#!/usr/bin/env node
import { chromium } from "playwright";
import elements from "../../packages/web-components/web-components.config.mjs";

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

  return {
    title,
    canonicalTitle: title.replace(/^Web Components\//, ""),
    defaultStoryId: defaultStory.id,
    docsId: docs.id,
    tagName: element.tagName,
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
      }),
      story.tagName,
    );
    if (!result.defined || !result.hasShadowRoot) {
      throw new Error(
        `${story.defaultStoryId} did not render a registered shadow-root ${story.tagName}`,
      );
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
  `✓ Storybook verified ${expectedComponents.length} component folders, native renders, and bidirectional implementation links`,
);
