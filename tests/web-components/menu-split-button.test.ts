import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { waitFor } from "@testing-library/dom";
import {
  DtMenuElement,
  type DtMenuItem,
} from "../../packages/web-components/src/native/menu";
import {
  DtSplitButtonElement,
  type DtSplitButtonOption,
} from "../../packages/web-components/src/native/split-button";

beforeAll(() => {
  if (!customElements.get("dt-menu")) {
    customElements.define("dt-menu", DtMenuElement);
  }
  if (!customElements.get("dt-split-button")) {
    customElements.define("dt-split-button", DtSplitButtonElement);
  }
});

afterEach(() => {
  document.body.replaceChildren();
});

describe("native Menu", () => {
  it("closes a non-modal menu on Tab without cancelling focus navigation", async () => {
    const menu = document.createElement("dt-menu") as DtMenuElement;
    menu.items = [{ id: "edit", label: "Edit" }];
    const trigger = document.createElement("button");
    trigger.slot = "trigger";
    trigger.textContent = "Actions";
    menu.append(trigger);
    document.body.append(menu);
    trigger.click();

    const item =
      menu.shadowRoot?.querySelector<HTMLElement>('[role="menuitem"]');
    const event = new KeyboardEvent("keydown", {
      key: "Tab",
      bubbles: true,
      cancelable: true,
      composed: true,
    });
    item?.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
    await waitFor(() => expect(menu.open).toBe(false));
  });

  it("tracks externally controlled open attributes for outside dismissal", () => {
    const menu = document.createElement("dt-menu") as DtMenuElement;
    menu.items = [{ id: "edit", label: "Edit" }];
    const trigger = document.createElement("button");
    trigger.slot = "trigger";
    trigger.textContent = "Actions";
    menu.append(trigger);
    document.body.append(menu);

    menu.setAttribute("open", "");
    expect(menu.open).toBe(true);

    document.body.dispatchEvent(
      new PointerEvent("pointerdown", { bubbles: true }),
    );

    expect(menu.open).toBe(false);
  });

  it("wires a slotted trigger, opens serializable items, and emits selection payloads", async () => {
    const menu = document.createElement("dt-menu") as DtMenuElement;
    menu.items = [
      { id: "edit", label: "Edit", icon: "pencil" },
      { id: "archive", label: "Archive", disabled: true },
      { separator: true },
      { id: "settings", label: "Settings", href: "/settings" },
    ];
    const trigger = document.createElement("button");
    trigger.slot = "trigger";
    trigger.textContent = "Actions";
    menu.append(trigger);
    document.body.append(menu);

    let detail: unknown;
    menu.addEventListener("item-select", (event) => {
      detail = (event as CustomEvent).detail;
    });

    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    trigger.click();

    const root = menu.shadowRoot;
    expect(root?.querySelector('[role="menu"]')).not.toHaveAttribute("hidden");
    const items = root?.querySelectorAll('[role="menuitem"]') ?? [];
    expect(items).toHaveLength(3);
    expect(items[1]).toHaveAttribute("aria-disabled", "true");

    (items[0] as HTMLButtonElement).click();

    expect(detail).toMatchObject({
      item: { id: "edit", label: "Edit", icon: "pencil" },
      id: "edit",
      value: "edit",
    });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("supports submenu arrow navigation, disabled skipping, and focus return", async () => {
    const menu = document.createElement("dt-menu") as DtMenuElement;
    const items: DtMenuItem[] = [
      { id: "rename", label: "Rename" },
      { id: "archive", label: "Archive", disabled: true },
      {
        id: "share",
        label: "Share",
        children: [
          { id: "email", label: "By email" },
          { id: "link", label: "By link" },
        ],
      },
    ];
    menu.items = items;
    const trigger = document.createElement("button");
    trigger.slot = "trigger";
    trigger.textContent = "Share";
    menu.append(trigger);
    document.body.append(menu);

    trigger.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
    );

    await waitFor(() => {
      expect(menu.shadowRoot?.activeElement?.textContent).toContain("Rename");
    });

    menu.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
    );
    await waitFor(() => {
      expect(menu.shadowRoot?.activeElement?.textContent).toContain("Share");
    });

    menu.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
    );
    await waitFor(() => {
      expect(menu.shadowRoot?.activeElement?.textContent).toContain("By email");
    });

    menu.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }),
    );
    await waitFor(() => {
      expect(menu.shadowRoot?.activeElement?.textContent).toContain("Share");
    });

    menu.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
    expect(
      document.activeElement === trigger || document.activeElement === menu,
    ).toBe(true);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("gives declarative slotted items menu semantics and uses them instead of the items property", async () => {
    const menu = document.createElement("dt-menu") as DtMenuElement;
    menu.items = [{ id: "ignored", label: "Ignored" }];
    const trigger = document.createElement("button");
    trigger.slot = "trigger";
    trigger.textContent = "Account";
    const profile = document.createElement("button");
    profile.textContent = "Profile";
    profile.dataset.id = "profile";
    const separator = document.createElement("div");
    separator.setAttribute("separator", "");
    const signOut = document.createElement("button");
    signOut.textContent = "Sign out";
    signOut.dataset.value = "sign-out";
    menu.append(trigger, profile, separator, signOut);
    document.body.append(menu);

    let detail: unknown;
    menu.addEventListener("item-select", (event) => {
      detail = (event as CustomEvent).detail;
    });

    trigger.click();
    await Promise.resolve();

    expect(profile).toHaveAttribute("role", "menuitem");
    expect(profile).toHaveAttribute("tabindex", "-1");
    expect(separator).toHaveAttribute("role", "separator");

    signOut.click();

    expect(detail).toEqual({
      item: {
        id: undefined,
        value: "sign-out",
        label: "Sign out",
        href: undefined,
        disabled: false,
      },
      id: null,
      value: "sign-out",
    });
  });
});

describe("native SplitButton", () => {
  it("dispatches primary-click for the main action and option-select for menu actions", async () => {
    const splitButton = document.createElement(
      "dt-split-button",
    ) as DtSplitButtonElement;
    splitButton.label = "Save";
    splitButton.options = [
      { id: "draft", label: "Save as draft" },
      { id: "publish", label: "Save and publish" },
    ];
    document.body.append(splitButton);

    const onPrimary = vi.fn();
    const onOption = vi.fn();
    splitButton.addEventListener("primary-click", onPrimary);
    splitButton.addEventListener("option-select", onOption);

    const primary =
      splitButton.shadowRoot?.querySelector<HTMLButtonElement>(".primary");
    const toggle =
      splitButton.shadowRoot?.querySelector<HTMLButtonElement>(".toggle");

    primary?.click();
    expect(onPrimary).toHaveBeenCalledTimes(1);
    expect((onPrimary.mock.calls[0]?.[0] as CustomEvent).detail).toEqual({
      label: "Save",
    });

    toggle?.click();
    const option = splitButton.shadowRoot?.querySelector<HTMLElement>(
      '[data-menu-control="true"][data-menu-path="0"]',
    );
    option?.click();

    expect((onOption.mock.calls[0]?.[0] as CustomEvent).detail).toMatchObject({
      item: { id: "draft", label: "Save as draft" },
      id: "draft",
      value: "draft",
    });
    expect(
      splitButton.shadowRoot?.activeElement === toggle ||
        document.activeElement === splitButton,
    ).toBe(true);
  });

  it("opens from ArrowDown, skips disabled options, supports submenus, and closes on Escape", async () => {
    const splitButton = document.createElement(
      "dt-split-button",
    ) as DtSplitButtonElement;
    const options: DtSplitButtonOption[] = [
      { id: "pdf", label: "Export PDF" },
      { id: "csv", label: "Export CSV", disabled: true },
      {
        id: "share",
        label: "Share",
        children: [
          { id: "email", label: "By email" },
          { id: "link", label: "By link" },
        ],
      },
    ];
    splitButton.label = "Export";
    splitButton.options = options;
    document.body.append(splitButton);

    const toggle = splitButton.shadowRoot?.querySelector<HTMLButtonElement>(
      ".toggle",
    ) as HTMLButtonElement;
    toggle.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
    );

    await waitFor(() => {
      expect(splitButton.shadowRoot?.activeElement?.textContent).toContain(
        "Export PDF",
      );
    });

    splitButton.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
    );
    await waitFor(() => {
      expect(splitButton.shadowRoot?.activeElement?.textContent).toContain(
        "Share",
      );
    });

    splitButton.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
    );
    await waitFor(() => {
      expect(splitButton.shadowRoot?.activeElement?.textContent).toContain(
        "By email",
      );
    });

    splitButton.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
    await waitFor(() => {
      expect(splitButton.shadowRoot?.activeElement?.textContent).toContain(
        "Share",
      );
    });

    splitButton.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
    expect(
      splitButton.shadowRoot?.activeElement === toggle ||
        document.activeElement === splitButton,
    ).toBe(true);
  });

  it("closes on Tab without cancelling focus navigation and on outside click", async () => {
    const user = userEvent.setup();
    const wrapper = document.createElement("div");
    const splitButton = document.createElement(
      "dt-split-button",
    ) as DtSplitButtonElement;
    splitButton.label = "Publish";
    splitButton.options = [
      { id: "draft", label: "Save draft" },
      { id: "publish", label: "Publish now" },
    ];
    const outside = document.createElement("button");
    outside.textContent = "Outside";
    wrapper.append(splitButton, outside);
    document.body.append(wrapper);

    const toggle = splitButton.shadowRoot?.querySelector<HTMLButtonElement>(
      ".toggle",
    ) as HTMLButtonElement;
    toggle.click();
    await waitFor(() => {
      expect(splitButton.shadowRoot?.activeElement?.textContent).toContain(
        "Save draft",
      );
    });

    const firstItem = splitButton.shadowRoot?.activeElement as HTMLElement;
    const tabEvent = new KeyboardEvent("keydown", {
      key: "Tab",
      bubbles: true,
      cancelable: true,
      composed: true,
    });
    firstItem.dispatchEvent(tabEvent);

    expect(tabEvent.defaultPrevented).toBe(false);
    await waitFor(() =>
      expect(toggle).toHaveAttribute("aria-expanded", "false"),
    );

    toggle.click();

    await user.click(outside);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  it("disables both segments and the toggle when disabled or empty", () => {
    const disabled = document.createElement(
      "dt-split-button",
    ) as DtSplitButtonElement;
    disabled.label = "Save";
    disabled.options = [{ id: "draft", label: "Save draft" }];
    disabled.disabled = true;
    document.body.append(disabled);

    const empty = document.createElement(
      "dt-split-button",
    ) as DtSplitButtonElement;
    empty.label = "Save";
    document.body.append(empty);

    expect(
      disabled.shadowRoot?.querySelector<HTMLButtonElement>(".primary"),
    ).toBeDisabled();
    expect(
      disabled.shadowRoot?.querySelector<HTMLButtonElement>(".toggle"),
    ).toBeDisabled();
    expect(
      empty.shadowRoot?.querySelector<HTMLButtonElement>(".toggle"),
    ).toBeDisabled();
  });
});
