import { expect, test } from "@playwright/test";
import type { Locator } from "@playwright/test";

const frameSelector = "#storybook-preview-iframe";
const docsUrl = "?path=/docs/actions-button--docs";
const ink = "rgb(224, 224, 224)";
const accent = "rgb(223, 255, 0)";

async function expectToolbarColors(trigger: Locator) {
  await expect(trigger).toHaveCSS("color", ink);
  await expect(trigger.locator("svg").first()).toHaveCSS("color", accent);
}

test("theme switching emits no browser errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto(docsUrl);
  const docs = page.frameLocator(frameSelector);
  await expect(
    docs.getByRole("heading", { name: "Button", exact: true }),
  ).toBeVisible();
  const trigger = page.getByRole("button", {
    name: /^Global theme for components/,
  });
  for (const theme of ["Dark", "Light"]) {
    await trigger.click();
    await page.getByRole("option", { name: theme, exact: true }).click();
    await expect(trigger).toContainText(theme);
  }
  await page
    .getByRole("searchbox", { name: "Search for components" })
    .fill("TextInput");
  await expect(
    page.getByRole("option").filter({ hasText: "TextInput" }).first(),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("original brand, local fonts, toolbar states, search and section navigation", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto(docsUrl);
  const docs = page.frameLocator(frameSelector);
  await expect(
    docs.getByRole("heading", { name: "Button", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("img", { name: "Digitaltableteur" }),
  ).toHaveAttribute("src", /storybook_logo\.svg/);
  const trigger = page.getByRole("button", {
    name: /^Global theme for components/,
  });
  await expectToolbarColors(trigger);
  await trigger.hover();
  await expectToolbarColors(trigger);
  await trigger.focus();
  await expect(trigger).toHaveCSS("outline-style", "solid");
  await expectToolbarColors(trigger);
  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expectToolbarColors(trigger);
  await page.getByRole("option", { name: "Dark", exact: true }).click();
  await expect(trigger).toContainText("Dark");
  await expectToolbarColors(trigger);
  await trigger.click();
  await page.getByRole("option", { name: "Light", exact: true }).click();

  await docs.getByRole("link", { name: "Accessibility", exact: true }).click();
  await expect(page).toHaveURL(
    /\/storybook\/\?path=\/docs\/actions-button--docs#dt-docs-a11y$/,
  );
  await expect(
    docs.getByRole("heading", { name: "Accessibility", exact: true }),
  ).toBeInViewport();
  await expect(
    docs.getByText("Forced colors verified", { exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => document.fonts.check('500 16px "Satoshi"')),
  ).toBe(true);
  const preview = page
    .frames()
    .find((frame) => frame.url().includes("iframe.html"))!;
  expect(
    await preview.evaluate(() => document.fonts.check('400 16px "Satoshi"')),
  ).toBe(true);
  const fontResponse = await page.request.get("fonts/Satoshi-Variable.woff2");
  expect(fontResponse.status()).toBe(200);
  expect(fontResponse.headers()["content-type"]).toContain("font/woff2");

  await page
    .getByRole("searchbox", { name: "Search for components" })
    .fill("TextInput");
  await expect(
    page.getByRole("option").filter({ hasText: "TextInput" }).first(),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  expect(errors).toEqual([]);
});

for (const theme of ["light", "dark", "hcb", "hcw"]) {
  for (const width of [1440, 390]) {
    test(`docs remain readable in ${theme} at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`${docsUrl}&globals=theme:${theme}`);
      const docs = page.frameLocator(frameSelector);
      await expect(
        docs.getByRole("heading", { name: "Button", exact: true }),
      ).toBeVisible();
      const preview = page
        .frames()
        .find((frame) => frame.url().includes("iframe.html"))!;
      await expect
        .poll(() =>
          preview.evaluate(() => document.documentElement.dataset.theme),
        )
        .toBe(theme);
      expect(
        await preview.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      ).toBe(true);
      await expect(
        docs.getByRole("navigation", { name: "On this page" }),
      ).toBeVisible();
      await expect(
        docs.getByRole("region", { name: "Playground controls" }),
      ).toBeAttached();
      await expect(
        docs.getByRole("link", { name: "Web component", exact: true }),
      ).toHaveAttribute("target", "_top");
    });
  }
}

test("Playground controls update the actual example and preserve native interaction", async ({
  page,
}) => {
  await page.goto("?path=/story/actions-button--playground");
  const docs = page.frameLocator(frameSelector);
  await expect(
    docs.getByRole("button", { name: "Primary", exact: true }),
  ).toBeVisible();
  await page.getByRole("tab", { name: /^Controls/ }).click();
  const label = page.locator('[id="control-children"]');
  await label.fill("Preview action");
  await expect(
    docs.getByRole("button", { name: "Preview action", exact: true }),
  ).toBeVisible();
  await docs
    .getByRole("button", { name: "Preview action", exact: true })
    .click();
});

test("docs chrome does not change the demonstrated Button styles", async ({
  page,
  context,
}) => {
  await page.goto(docsUrl);
  const docs = page.frameLocator(frameSelector);
  const demo = docs
    .locator('[data-doc-block="showcase"] .sb-story button')
    .first();
  await expect(demo).toBeVisible();
  const properties = [
    "fontFamily",
    "fontSize",
    "lineHeight",
    "color",
    "backgroundColor",
    "paddingTop",
    "paddingLeft",
    "borderRadius",
    "borderTopWidth",
  ] as const;
  const fromDocs = await demo.evaluate(
    (element, keys) =>
      Object.fromEntries(
        keys.map((key) => [key, getComputedStyle(element)[key]]),
      ),
    properties,
  );
  const iframeBox = await page.locator(frameSelector).boundingBox();
  const standalone = await context.newPage();
  await standalone.setViewportSize({
    width: Math.round(iframeBox!.width),
    height: 1000,
  });
  await standalone.goto(
    "iframe.html?id=actions-button--default&viewMode=story&globals=theme:light",
  );
  const isolated = standalone.locator("#storybook-root button").first();
  await expect(isolated).toBeVisible();
  const fromCanvas = await isolated.evaluate(
    (element, keys) =>
      Object.fromEntries(
        keys.map((key) => [key, getComputedStyle(element)[key]]),
      ),
    properties,
  );
  expect(fromDocs).toEqual(fromCanvas);
});

test("the embedded docs Playground stays connected to its controls", async ({
  page,
}) => {
  await page.goto(docsUrl);
  const docs = page.frameLocator(frameSelector);
  const props = docs.locator('[data-doc-block="props"]');
  await props
    .locator('[id$="-actions-button--playground-children"]')
    .fill("Documented action");
  await expect(
    props.getByRole("button", { name: "Documented action", exact: true }),
  ).toBeVisible();
});

for (const id of [
  "forms-textinput--docs",
  "data-display-table--docs",
  "feedback-modal--docs",
]) {
  test(`narrow framing stays readable: ${id}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`?path=/docs/${id}`);
    const docs = page.frameLocator(frameSelector);
    await expect(docs.locator(".sbdocs-content h1").first()).toBeVisible();
    const preview = page
      .frames()
      .find((frame) => frame.url().includes("iframe.html"))!;
    expect(
      await preview.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
  });
}

for (const id of [
  "forms-textinput--docs",
  "data-display-table--docs",
  "feedback-modal--docs",
  "patterns-pagelayout--default",
  "web-components-actions-button--docs",
  "overview-components--docs",
]) {
  test(`representative catalogue route remains functional: ${id}`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    await page.goto(`?path=/${id.endsWith("--docs") ? "docs" : "story"}/${id}`);
    const frame = page.frameLocator(frameSelector);
    await expect(
      frame
        .locator("#storybook-root, #storybook-docs")
        .filter({ visible: true }),
    ).not.toBeEmpty();
    await expect(
      frame.getByText("No Preview", { exact: true }),
    ).not.toBeVisible();
    expect(errors).toEqual([]);
  });
}
