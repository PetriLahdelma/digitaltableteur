import { describe, it, expect } from "vitest";
import { resolvePhosphorIcon } from "./iconRegistry";
import { OBJECT_PROP_ICON_FIXTURE } from "./__fixtures__/objectPropIcon.fixture";

/**
 * build-icon-registry scans object-property icon literals (e.g. Tabs'
 * `tabs={[{ icon: "archive" }]}`), not just JSX `icon=`/`name=` attributes.
 * Without that, an icon used ONLY via such a prop never lands in
 * iconRegistry.discovered.ts and Icon renders blank at runtime.
 *
 * The fixture supplies `archive` exclusively through an object property, using
 * a slug that no JSX literal or CURATED_ICONS entry references. So this passing
 * proves `npm run build:icons` discovered it via the object-property path.
 */
describe("build-icon-registry object-property scanning", () => {
  it("registers an icon supplied only via an object property", () => {
    const slug = OBJECT_PROP_ICON_FIXTURE[0].icon;
    expect(resolvePhosphorIcon(slug)).toBeTruthy();
  });

  it("also resolves the PascalCase form of that icon", () => {
    expect(resolvePhosphorIcon("Archive")).toBeTruthy();
  });
});
