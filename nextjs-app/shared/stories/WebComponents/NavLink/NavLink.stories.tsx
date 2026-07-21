import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  NativeElement,
  Row,
  assertNative,
  exampleStory,
  forcedColorsStory,
  nativeStoryParameters,
} from "../NativeStory";
import { expect } from "storybook/test";

type Args = {
  label: string;
  href: string;
  currentPath: string;
  exact: boolean;
  size: string;
  underline: string;
};
function NativeNavLink({ currentPath, ...args }: Args) {
  return (
    <NativeElement
      tagName="dt-nav-link"
      attributes={{ ...args, "current-path": currentPath }}
    />
  );
}
const meta = {
  title: "Web Components/Navigation/NavLink",
  component: NativeNavLink,
  tags: ["autodocs", "beta", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    docs: { description: { component: "Native dt-nav-link custom element." } },
  },
  args: {
    label: "Work",
    href: "/work",
    currentPath: "/work/case-study",
    exact: false,
    size: "inherit",
    underline: "none",
  },
  argTypes: {
    exact: { control: "boolean" },
    underline: {
      control: "inline-radio",
      options: ["always", "hover", "none"],
    },
  },
} satisfies Meta<typeof NativeNavLink>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  tags: ["beta-matrix"], play: assertNative("dt-nav-link") };
export const Playground: Story = { tags: ["beta-matrix"] };
export const PrimaryNav: Story = {
  ...exampleStory,
  render: () => (
    <Row>
      <NativeElement
        tagName="dt-nav-link"
        attributes={{ href: "/", label: "Home", "current-path": "/work" }}
      />
      <NativeElement
        tagName="dt-nav-link"
        attributes={{ href: "/work", label: "Work", "current-path": "/work" }}
      />
      <NativeElement
        tagName="dt-nav-link"
        attributes={{ href: "/about", label: "About", "current-path": "/work" }}
      />
    </Row>
  ),
};
export const ExactMatching: Story = {
  ...exampleStory,
  args: { currentPath: "/work/case-study", exact: true },
};
export const CustomStyling: Story = {
  ...exampleStory,
  args: {
    href: "/work",
    currentPath: "/work",
    size: "lg",
    underline: "always",
  },
  play: async ({ canvasElement }) => {
    const host = canvasElement.querySelector("dt-nav-link");
    const current = host?.shadowRoot?.querySelector("span[part='current']");
    expect(host?.shadowRoot?.querySelector("dt-link")).toBeNull();
    expect(current).toHaveAttribute("aria-current", "page");
    expect(current?.className).toContain("lg");
    expect(current?.className).toContain("always");
  },
};
export const Example: Story = {
  tags: ["beta-matrix"],
  ...exampleStory,
  args: { label: "Blog", href: "/blog", currentPath: "/blog/design-systems" },
};
export const ForcedColors: Story = {
  tags: ["beta-matrix"], ...forcedColorsStory };
