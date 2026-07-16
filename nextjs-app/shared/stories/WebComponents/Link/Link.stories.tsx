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
  size: "sm" | "md" | "lg" | "inherit";
  underline: "always" | "hover" | "none";
  target?: string;
  lang?: "en" | "fi" | "sv";
  hrefLang?: string;
  referrerPolicy?: string;
  externalLabel?: string;
  externalLabelEn?: string;
  externalLabelFi?: string;
  externalLabelSv?: string;
};
function NativeLink({
  hrefLang,
  referrerPolicy,
  externalLabel,
  externalLabelEn,
  externalLabelFi,
  externalLabelSv,
  ...args
}: Args) {
  return (
    <NativeElement
      tagName="dt-link"
      attributes={{
        ...args,
        hreflang: hrefLang,
        referrerpolicy: referrerPolicy,
        "external-label": externalLabel,
        "external-label-en": externalLabelEn,
        "external-label-fi": externalLabelFi,
        "external-label-sv": externalLabelSv,
      }}
    />
  );
}
const meta = {
  title: "Web Components/Navigation/Link",
  component: NativeLink,
  tags: ["autodocs", "beta", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    docs: { description: { component: "Native dt-link custom element." } },
  },
  args: {
    label: "Read the documentation",
    href: "https://example.com",
    size: "md",
    underline: "always",
  },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg", "inherit"] },
    underline: {
      control: "inline-radio",
      options: ["always", "hover", "none"],
    },
  },
} satisfies Meta<typeof NativeLink>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: assertNative("dt-link") };
export const Playground: Story = {};
export const Sizes: Story = {
  ...exampleStory,
  render: () => (
    <Row>
      {(["sm", "md", "lg"] as const).map((size) => (
        <NativeElement
          key={size}
          tagName="dt-link"
          attributes={{ href: "#", label: `${size} link`, size }}
        />
      ))}
    </Row>
  ),
};
export const UnderlineModes: Story = {
  ...exampleStory,
  render: () => (
    <Row>
      {(["always", "hover", "none"] as const).map((underline) => (
        <NativeElement
          key={underline}
          tagName="dt-link"
          attributes={{ href: "#", label: underline, underline }}
        />
      ))}
    </Row>
  ),
};
export const External: Story = {
  ...exampleStory,
  args: {
    label: "External documentation",
    href: "https://example.com",
    target: "_blank",
    lang: "fi",
    externalLabelFi: "Poistut sivustolta",
  },
  play: async ({ canvasElement }) => {
    const host = canvasElement.querySelector("dt-link");
    const icon = host?.shadowRoot?.querySelector("dt-icon");
    expect(icon).toHaveAttribute("aria-label", "Poistut sivustolta");
  },
};
export const Example: Story = {
  ...exampleStory,
  args: { label: "View all case studies", href: "/work", underline: "hover" },
};
export const ForcedColors: Story = { ...forcedColorsStory };
