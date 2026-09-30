import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Whole-page and non-default-state regressions from the 2026-09-27 review.
// No real contacts, bookings or AI requests are submitted by this suite.
test.setTimeout(90_000);
test.use({ reducedMotion: "reduce" });

async function openPage(page: Page, path: string) {
  await page.goto(path, { waitUntil: "domcontentloaded" });
  await expect(page).toHaveTitle(/.+/);
  await expect(page.locator("main h1").first()).toBeVisible();
  // The shell mounts chat in an effect after hydration. Server-rendered form
  // controls alone are not proof their event handlers are ready.
  await expect(page.locator("#donny-panel")).toBeAttached();
  const essential = page.getByRole("button", {
    name: "Only essential",
    exact: true,
  });
  if (await essential.isVisible()) await essential.click();
}

test("cookie modal skips disabled controls and contains/restores focus", async ({
  page,
}) => {
  await page.goto("/contact", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#donny-panel")).toBeAttached();
  const trigger = page.getByRole("button", {
    name: "Customize settings",
    exact: true,
  });
  await trigger.click();
  const modal = page.getByRole("dialog", {
    name: "Cookie consent",
    exact: true,
  });
  await expect(
    modal.getByRole("switch", { name: "Toggle analytics cookies" }),
  ).toBeFocused();
  const last = modal.getByRole("button", { name: "Accept all", exact: true });
  await last.focus();
  await page.keyboard.press("Tab");
  await expect(
    modal.getByRole("switch", { name: "Toggle analytics cookies" }),
  ).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(last).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(modal).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test("invalid contact details identify the field and provide recovery", async ({
  page,
}) => {
  await openPage(page, "/contact");
  let requests = 0;
  await page.route("**/api/contact", async (route) => {
    requests++;
    await route.fulfill({ status: 500, json: { error: "Test failure" } });
  });
  await page
    .getByRole("textbox", { name: "Full Name*", exact: true })
    .fill("Test User");
  const email = page.getByRole("textbox", {
    name: "Email Address*",
    exact: true,
  });
  await email.fill("not-an-email");
  await page
    .getByRole("textbox", { name: "Your Message*", exact: true })
    .fill("Accessibility fixture");
  await page.getByRole("button", { name: "Submit", exact: true }).click();
  await expect(email).toHaveAttribute("aria-invalid", "true");
  await expect(email).toBeFocused();
  const errorId = await email.getAttribute("aria-describedby");
  expect(errorId).toBeTruthy();
  await expect(page.locator(`[id="${errorId}"]`)).toContainText(
    /email|address/i,
  );
  expect(requests).toBe(0);
});

test("blog has a single interactive article collection after filtering", async ({
  page,
}) => {
  await openPage(page, "/blog");
  await expect(page.locator("main section.sr-only a")).toHaveCount(0);
  await page
    .getByRole("button", { name: "AI Governance (1)", exact: true })
    .click();
  await expect(page.locator('main a[href^="/blog/"]')).toHaveCount(1);
});

test("language disclosure retains its visible name and returns focus", async ({
  page,
}) => {
  await openPage(page, "/");
  const group = page.getByRole("group", { name: "Language", exact: true });
  const trigger = group.getByRole("button", {
    name: /EN.*Show language options/,
  });
  await trigger.click();
  await expect(
    group.getByRole("button", { name: /EN.*Hide language options/ }),
  ).toBeVisible();
  await group
    .getByRole("button", { name: "FI — Switch to Suomi", exact: true })
    .click();
  await expect(page.locator("html")).toHaveAttribute("lang", "fi");
  await expect(
    page
      .getByRole("group", { name: "Kieli", exact: true })
      .getByRole("button", { name: /FI/ }),
  ).toBeFocused();
});

for (const height of [256, 568]) {
  test(`mobile navigation remains scrollable at 320x${height}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height });
    await openPage(page, "/pricing");
    await page
      .getByRole("button", { name: "Open navigation menu", exact: true })
      .click();
    const modal = page.getByRole("dialog", {
      name: "Main navigation",
      exact: true,
    });
    const last = modal.getByRole("link", { name: "AI Usage", exact: true });
    await last.focus();
    await expect(last).toBeInViewport({ ratio: 1 });
    await page.keyboard.press("Tab");
    await expect(
      modal.getByRole("button", { name: "Close navigation" }),
    ).toBeFocused();
    await expect(
      modal.getByRole("button", { name: "Close navigation" }),
    ).toBeInViewport({ ratio: 1 });
  });

  test(`chat controls remain reachable at 320x${height} with text spacing`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height });
    await openPage(page, "/");
    await page.addStyleTag({
      content: `* { line-height: 1.5 !important; letter-spacing: .12em !important; word-spacing: .16em !important; } p { margin-bottom: 2em !important; }`,
    });
    await page
      .getByRole("button", { name: "AI assistant — Open Donny AI assistant" })
      .click();
    const modal = page.getByRole("dialog", {
      name: "AI assistant Donny",
      exact: true,
    });
    // Opening schedules focus on the composer after the React render. Await
    // that handoff before testing subsequent user-driven focus navigation.
    await expect(modal.getByRole("textbox")).toBeFocused();
    for (const control of [
      modal.getByRole("button", { name: "Minimize chat" }),
      modal.getByRole("textbox"),
      modal.getByRole("button", { name: "Clear conversation" }),
    ]) {
      await control.focus();
      await expect(control).toBeInViewport({ ratio: 1 });
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.keyboard.press("Escape");
    await expect(
      page.getByRole("button", {
        name: "AI assistant — Open Donny AI assistant",
      }),
    ).toBeFocused();
  });
}

test("English case-study content keeps its language under Finnish chrome", async ({
  page,
  context,
}) => {
  await context.addCookies([
    { name: "i18next", value: "fi", domain: "localhost", path: "/" },
  ]);
  await page.goto("/work/new-things-co", { waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveAttribute("lang", "fi");
  const passage = page.getByText(
    /The stationery system uses recycled paper stock/,
  );
  await expect(passage).toBeAttached();
  expect(
    await passage.evaluate((e) => e.closest("[lang]")?.getAttribute("lang")),
  ).toBe("en");
});

test("leaving the nonmodal chat preserves page focus and removes the obstruction", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openPage(page, "/");
  const launcher = page.getByRole("button", {
    name: "AI assistant — Open Donny AI assistant",
    exact: true,
  });
  await launcher.click();
  const panel = page.getByRole("dialog", {
    name: "AI assistant Donny",
    exact: true,
  });
  await expect(panel.getByRole("textbox")).toBeFocused();
  await expect(
    page.locator('button[data-open="true"][aria-controls="donny-panel"]'),
  ).toHaveAttribute("tabindex", "-1");
  await panel.focus();
  await page.keyboard.press("Shift+Tab");
  await expect(panel).not.toBeVisible();
  await expect(launcher).not.toBeFocused();
  expect(
    await page.evaluate(() => {
      const active = document.activeElement;
      return (
        active instanceof HTMLElement &&
        active !== document.body &&
        !active.closest("#donny-panel")
      );
    }),
  ).toBe(true);
});

const routes = [
  "/",
  "/contact",
  "/pricing",
  "/work",
  "/blog",
  "/work/knobsmith-audio",
  "/blog/thoughts-on-future-branding",
];
for (const path of routes) {
  test(`complete page AA and landmark checks: ${path}`, async ({
    page,
  }, testInfo) => {
    await openPage(page, path);
    await expect(page.locator("main")).toHaveCount(1);
    await page.evaluate(() => document.fonts.ready);
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    await testInfo.attach("axe-results", {
      body: JSON.stringify(
        { violations: result.violations, incomplete: result.incomplete },
        null,
        2,
      ),
      contentType: "application/json",
    });
    expect(
      result.violations,
      JSON.stringify(
        result.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => n.target),
        })),
        null,
        2,
      ),
    ).toEqual([]);
  });
}
