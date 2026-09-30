import { expect, test, type Locator } from "@playwright/test";

test.setTimeout(90_000);

async function expectHitTarget(target: Locator) {
  await target.focus();
  await expect(target).toBeFocused();
  await expect
    .poll(() =>
      target.evaluate((node) => {
        const rect = node.getBoundingClientRect();
        return [0.2, 0.5, 0.8]
          .flatMap((x) =>
            [0.2, 0.5, 0.8].map((y) => {
              const hit = document.elementFromPoint(
                rect.left + rect.width * x,
                rect.top + rect.height * y,
              );
              return hit === node || (hit !== null && node.contains(hit));
            }),
          )
          .filter(Boolean).length;
      }),
    )
    .toBe(9);
}

async function expectClearOfBanner(target: Locator, banner: Locator) {
  await target.focus();
  await expect(target).toBeFocused();
  await expect
    .poll(async () => {
      const targetBox = await target.boundingBox();
      const bannerBox = await banner.boundingBox();
      return (
        !!targetBox &&
        !!bannerBox &&
        targetBox.y + targetBox.height <= bannerBox.y
      );
    })
    .toBe(true);
  // Geometry against the banner alone misses another overlay (for example,
  // the sticky header) covering the entire focused target at high zoom.
  await expectHitTarget(target);
}

for (const reducedMotion of ["reduce", "no-preference"] as const) {
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 320, height: 256 },
  ]) {
    test(`cookie banner keeps controls reachable without obscuring page focus at ${viewport.width}x${viewport.height} with ${reducedMotion} motion`, async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion });
      await page.setViewportSize(viewport);
      await page.goto("/", { waitUntil: "domcontentloaded" });
      await expect(page.locator("#donny-panel")).toBeAttached();

      const banner = page.getByRole("region", {
        name: "Cookie preferences",
        exact: true,
      });
      await expect(banner).toBeVisible();

      const reservedSpace = await page.evaluate(() => ({
        bannerHeight: document.querySelector<HTMLElement>(
          '[aria-label="Cookie preferences"]',
        )?.offsetHeight,
        bodyPadding: Number.parseFloat(
          getComputedStyle(document.body).paddingBlockEnd,
        ),
      }));
      expect(reservedSpace.bodyPadding).toBeGreaterThanOrEqual(
        reservedSpace.bannerHeight ?? 0,
      );
      if (viewport.height <= 480) {
        expect(reservedSpace.bannerHeight).toBeLessThanOrEqual(
          viewport.height * 0.65 + 1,
        );
      }

      for (const consentName of [
        "Only essential",
        "Accept all",
        "Customize settings",
      ]) {
        const control = banner.getByRole("button", {
          name: consentName,
          exact: true,
        });
        await control.focus();
        await expect(control).toBeFocused();
        await expect
          .poll(async () => {
            const box = await control.boundingBox();
            return (
              !!box && box.y >= -1 && box.y + box.height <= viewport.height + 1
            );
          })
          .toBe(true);
      }

      await expectHitTarget(
        page
          .getByRole("banner")
          .getByRole("link", { name: "Digitaltableteur", exact: true }),
      );
      await expectHitTarget(
        page.getByRole("button", { name: "Open navigation menu", exact: true }),
      );
      await expectHitTarget(
        page.getByRole("button", {
          name: "AI assistant — Open Donny AI assistant",
          exact: true,
        }),
      );

      await expectClearOfBanner(
        page.getByRole("main").getByRole("link", {
          name: "Get in touch",
          exact: true,
        }),
        banner,
      );
      await expectClearOfBanner(
        page.getByRole("contentinfo").getByRole("link", {
          name: "Privacy Policy",
          exact: true,
        }),
        banner,
      );
    });
  }
}
