import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { type DtAvatarElement } from "../../packages/web-components/src/native/avatar";
import { DtAvatarElement as DtAvatarElementClass } from "../../packages/web-components/src/native/avatar";
import { type DtAvatarGroupElement } from "../../packages/web-components/src/native/avatar-group";
import { DtAvatarGroupElement as DtAvatarGroupElementClass } from "../../packages/web-components/src/native/avatar-group";

beforeAll(() => {
  if (!customElements.get("dt-avatar")) {
    customElements.define("dt-avatar", DtAvatarElementClass);
  }
  if (!customElements.get("dt-avatar-group")) {
    customElements.define("dt-avatar-group", DtAvatarGroupElementClass);
  }
});

afterEach(() => {
  document.body.replaceChildren();
});

describe("native avatar components", () => {
  it("renders an image avatar with the canonical loading attributes", () => {
    const avatar = document.createElement("dt-avatar") as DtAvatarElement;
    avatar.name = "Petri Lahdelma";
    avatar.imageUrl = "https://example.com/avatar.jpg";
    avatar.loading = "eager";
    avatar.decoding = "sync";
    document.body.append(avatar);

    const image = avatar.shadowRoot?.querySelector("img");
    expect(image).toBeTruthy();
    expect(image?.getAttribute("src")).toBe("https://example.com/avatar.jpg");
    expect(image?.getAttribute("alt")).toBe("Petri Lahdelma");
    expect(image?.getAttribute("loading")).toBe("eager");
    expect(image?.getAttribute("decoding")).toBe("sync");
    expect(image?.getAttribute("srcset")).toBe(
      "https://example.com/avatar.jpg 1x",
    );
    expect(image?.getAttribute("sizes")).toBe("(max-width: 600px) 56px, 40px");
  });

  it("falls back to initials and honors the initials variant over a provided image", () => {
    const avatar = document.createElement("dt-avatar") as DtAvatarElement;
    avatar.name = "Petri Lahdelma";
    avatar.imageUrl = "https://example.com/avatar.jpg";
    avatar.variant = "initials";
    document.body.append(avatar);

    expect(avatar.shadowRoot?.querySelector("img")).toBeNull();
    expect(
      avatar.shadowRoot?.querySelector('[part="initials"]')?.textContent,
    ).toBe("PL");
  });

  it("renders clickable avatars as links when a destination URL is provided", () => {
    const avatar = document.createElement("dt-avatar") as DtAvatarElement;
    avatar.name = "Petri Lahdelma";
    avatar.clickable = true;
    avatar.destinationUrl = "/profile";
    document.body.append(avatar);

    const link = avatar.shadowRoot?.querySelector("a");
    expect(link).toBeTruthy();
    expect(link?.getAttribute("href")).toBe("/profile");
    expect(link?.textContent).toBe("PL");

    avatar.destinationUrl = "javascript:alert(1)";
    expect(avatar.shadowRoot?.querySelector("a")?.getAttribute("href")).toBe(
      "#",
    );
  });

  it("collapses avatars past max into a +N overflow bubble", () => {
    const group = document.createElement(
      "dt-avatar-group",
    ) as DtAvatarGroupElement;
    group.ariaLabel = "Project members";
    group.max = 2;

    for (const name of [
      "Aino Virtanen",
      "Bo Lind",
      "Carla Miettinen",
      "Deniz Aaltonen",
    ]) {
      const avatar = document.createElement("dt-avatar") as DtAvatarElement;
      avatar.name = name;
      avatar.variant = "initials";
      group.append(avatar);
    }

    document.body.append(group);

    const root = group.shadowRoot?.querySelector('[part="group"]');
    expect(root?.getAttribute("role")).toBe("group");
    expect(root?.getAttribute("aria-label")).toBe("Project members");
    expect(
      group.children[0]?.getAttribute("data-dt-avatar-group-hidden"),
    ).toBeNull();
    expect(
      group.children[1]?.getAttribute("data-dt-avatar-group-hidden"),
    ).toBeNull();
    expect(group.children[2]?.getAttribute("data-dt-avatar-group-hidden")).toBe(
      "true",
    );
    expect(group.children[3]?.getAttribute("data-dt-avatar-group-hidden")).toBe(
      "true",
    );
    expect(
      group.shadowRoot?.querySelector('[part="overflow"] [aria-hidden="true"]')
        ?.textContent,
    ).toBe("+2");
    expect(
      group.shadowRoot?.querySelector('[part="overflow"] .srOnly')?.textContent,
    ).toBe("2 more");
    expect(
      (group.children[1] as HTMLElement).style.marginInlineStart,
    ).toContain("--space-internal-8");

    group.max = 1;
    expect((group.children[1] as HTMLElement).style.marginInlineStart).toBe("");
  });

  it("opens serializable menu data and emits the selected item", () => {
    const avatar = document.createElement("dt-avatar") as DtAvatarElement;
    avatar.name = "Petri Lahdelma";
    avatar.menuItems = [
      { id: "profile", label: "Profile" },
      { id: "sign-out", label: "Sign out" },
    ];
    document.body.append(avatar);

    let detail: unknown;
    avatar.addEventListener("menu-select", (event) => {
      detail = (event as CustomEvent).detail;
    });
    avatar.shadowRoot?.querySelector<HTMLButtonElement>(".trigger")?.click();
    avatar.shadowRoot?.querySelector<HTMLButtonElement>(".item")?.click();

    expect(detail).toMatchObject({
      id: "profile",
      value: "profile",
      item: { id: "profile", label: "Profile" },
    });
    expect(
      avatar.shadowRoot
        ?.querySelector(".trigger")
        ?.getAttribute("aria-expanded"),
    ).toBe("false");
  });

  it("gives slotted menu controls complete focus and selection behavior", async () => {
    const avatar = document.createElement("dt-avatar") as DtAvatarElement;
    avatar.name = "Petri Lahdelma";

    const profile = document.createElement("button");
    profile.slot = "menu-item";
    profile.dataset.id = "profile";
    profile.textContent = "Profile";
    const signOut = document.createElement("button");
    signOut.slot = "menu-item";
    signOut.dataset.value = "sign-out";
    signOut.innerHTML = "<span>Sign out</span>";
    avatar.append(profile, signOut);
    document.body.append(avatar);

    let detail: unknown;
    avatar.addEventListener("menu-select", (event) => {
      detail = (event as CustomEvent).detail;
    });

    const trigger =
      avatar.shadowRoot?.querySelector<HTMLButtonElement>(".trigger");
    trigger?.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "ArrowDown",
        bubbles: true,
        composed: true,
      }),
    );
    await Promise.resolve();

    expect(profile.getAttribute("role")).toBe("menuitem");
    expect(profile.getAttribute("tabindex")).toBe("-1");
    expect(document.activeElement).toBe(profile);

    signOut.querySelector("span")?.click();
    expect(detail).toMatchObject({
      id: null,
      value: "sign-out",
      item: { label: "Sign out", value: "sign-out" },
    });
    expect(
      avatar.shadowRoot
        ?.querySelector(".trigger")
        ?.getAttribute("aria-expanded"),
    ).toBe("false");

    avatar.remove();
    expect(profile.hasAttribute("role")).toBe(false);
    expect(profile.hasAttribute("tabindex")).toBe(false);
  });
});
