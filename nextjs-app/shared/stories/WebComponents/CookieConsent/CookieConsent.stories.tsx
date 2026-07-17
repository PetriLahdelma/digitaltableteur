import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent } from "storybook/test";
import { DtCookieConsentElement } from "../../../../../packages/web-components/src/native/cookie-consent";
import {
  NativeElement,
  assertNative,
  exampleStory,
  forcedColorsStory,
  nativeStoryParameters,
} from "../NativeStory";

if (!customElements.get("dt-cookie-consent")) {
  customElements.define("dt-cookie-consent", DtCookieConsentElement);
}

const categories = JSON.stringify([
  {
    id: "essential",
    label: "Essential cookies",
    description: "Required for security, language, and consent preferences.",
    required: true,
    toggleLabel: "Essential cookies (always enabled)",
  },
  {
    id: "analytics",
    label: "Analytics cookies",
    description: "Help us understand anonymous site usage.",
    toggleLabel: "Allow analytics cookies",
  },
  {
    id: "marketing",
    label: "Marketing cookies",
    description: "Allow measurement of relevant campaigns.",
    toggleLabel: "Allow marketing cookies",
  },
  {
    id: "functional",
    label: "Functional cookies",
    description: "Remember optional interface preferences.",
    toggleLabel: "Allow functional cookies",
  },
]);

type Args = {
  categories: string;
  value: string;
  summary: string;
  policyHref: string;
  autoShow: "true" | "false";
};

function NativeCookieConsent(args: Args) {
  return (
    <NativeElement
      tagName="dt-cookie-consent"
      attributes={{
        categories: args.categories,
        value: args.value,
        summary: args.summary,
        "policy-href": args.policyHref,
        "auto-show": args.autoShow,
        "default-open": true,
      }}
    />
  );
}

const meta = {
  title: "Web Components/Site/CookieConsent",
  component: NativeCookieConsent,
  tags: ["autodocs", "beta", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    contractStatus: "beta",
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Native consent banner and settings dialog. Category policy is supplied by the host; persistence is opt-in through a storage key or typed hooks, and all consent transitions are cancelable composed events.",
      },
    },
  },
  args: {
    categories,
    value:
      "{\"essential\":true,\"analytics\":false,\"marketing\":false,\"functional\":false}",
    summary: "Cookies improve your experience.",
    policyHref: "/privacy-policy",
    autoShow: "false",
  },
  argTypes: {
    value: {
      control: "select",
      options: ["essentialOnly", "all"],
      mapping: {
        essentialOnly:
          "{\"essential\":true,\"analytics\":false,\"marketing\":false,\"functional\":false}",
        all: "{\"essential\":true,\"analytics\":true,\"marketing\":true,\"functional\":true}",
      },
    },
    autoShow: { control: "inline-radio", options: ["true", "false"] },
  },
} satisfies Meta<typeof NativeCookieConsent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: assertNative("dt-cookie-consent"),
};

export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const element =
      canvasElement.querySelector<DtCookieConsentElement>("dt-cookie-consent");
    const customize =
      element?.shadowRoot?.querySelector<HTMLButtonElement>(".customize");
    expect(customize).toBeTruthy();
    await userEvent.click(customize!);
    expect(element?.shadowRoot?.querySelector("[role=\"dialog\"]")).toBeTruthy();
  },
};

export const Example: Story = {
  ...exampleStory,
  render: () => <NativeCookieConsent {...meta.args} />,
};

export const ForcedColors: Story = {
  ...forcedColorsStory,
  render: () => <NativeCookieConsent {...meta.args} />,
};
