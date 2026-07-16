import type { Meta, StoryObj } from "@storybook/react-vite";
import { useLayoutEffect, useRef } from "react";
import { expect } from "storybook/test";
import {
  DtNavMenuListElement,
  type DtNavMenuItem,
} from "../../../../../packages/web-components/src/native/nav-menu-list";
import {
  exampleStory,
  forcedColorsStory,
  NativeElement,
  nativeStoryParameters,
} from "../NativeStory";

if (!globalThis.customElements?.get("dt-nav-menu-list")) {
  globalThis.customElements?.define("dt-nav-menu-list", DtNavMenuListElement);
}

const siteItems: DtNavMenuItem[] = [
  { to: "/", label: "Home", exact: true },
  { to: "/work", label: "Work" },
  { to: "/about", label: "About" },
  { to: "/blog", label: "Blog" },
  { to: "/contact", label: "Contact" },
];

type Args = {
  items: "site" | "three";
  currentPath: string;
};

function NativeNavMenuList(args: Args) {
  const rootRef = useRef<HTMLDivElement>(null);
  const items = args.items === "three" ? siteItems.slice(0, 3) : siteItems;

  useLayoutEffect(() => {
    const nav = rootRef.current?.querySelector(
      "dt-nav-menu-list",
    ) as DtNavMenuListElement | null;
    if (nav) nav.items = items;
  }, [items]);

  return (
    <div ref={rootRef} style={{ inlineSize: "min(20rem, 90vw)" }}>
      <NativeElement
        tagName="dt-nav-menu-list"
        attributes={{ "current-path": args.currentPath }}
      />
    </div>
  );
}

const meta = {
  title: "Web Components/Site/NavMenuList",
  component: NativeNavMenuList,
  tags: ["autodocs", "beta", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    docs: {
      description: {
        component:
          "Native `dt-nav-menu-list` with exact or prefix route matching and cancellable composed `navigate` events. Assign `items` as a property or JSON attribute. Because React class names cannot style shadow DOM, the native element exposes `list`, `item`, `link`, and `active-link` parts plus `--dt-nav-menu-*` properties.",
      },
    },
  },
  args: { items: "site", currentPath: "/work/case-study" },
  argTypes: {
    items: { control: "inline-radio", options: ["site", "three"] },
    currentPath: { control: "text" },
  },
} satisfies Meta<typeof NativeNavMenuList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const host = canvasElement.querySelector(
      "dt-nav-menu-list",
    ) as DtNavMenuListElement | null;
    expect(customElements.get("dt-nav-menu-list")).toBeDefined();
    expect(host?.shadowRoot?.querySelectorAll("a")).toHaveLength(5);
    expect(
      host?.shadowRoot?.querySelector("a[aria-current=page]"),
    ).toHaveTextContent("Work");
  },
};

export const CustomActiveClass: Story = {
  ...exampleStory,
  decorators: [
    (Story) => (
      <>
        <style>{`
          dt-nav-menu-list::part(active-link) {
            border-radius: 4px;
            background: var(--color-primary);
            color: var(--color-white);
          }
        `}</style>
        <Story />
      </>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story:
          "The native equivalent of React's activeClassName uses the exported active-link part, preserving shadow-DOM encapsulation.",
      },
    },
  },
};

export const Playground: Story = {};

export const Example: Story = { ...exampleStory };

export const ForcedColors: Story = { ...forcedColorsStory };
