import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentType } from "react";
import { userEvent, within } from "storybook/test";
import CookieConsent from "./CookieConsent";
import { CookieConsentProvider } from "@/nextjs-app/shared/lib/cookieConsent/CookieConsentContext";
import contract from "./CookieConsent.contract.json";

// The global preview decorator wraps stories with autoShow={false}, so the
// banner never mounts and its className control would be inert. This nested
// provider force-shows the banner (fresh Storybook iframe has no stored
// consent) so the derived className control actually drives the canvas.
const withOpenBanner = (Story: ComponentType) => (
  <CookieConsentProvider autoShow>
    <Story />
  </CookieConsentProvider>
);

const meta = {
  title: "Site/CookieConsent",
  component: CookieConsent,
  tags: ["beta", "autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-cookie-consent",
    },
    layout: "fullscreen",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts).
  args: {},
} satisfies Meta<typeof CookieConsent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
};
export const Playground: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  decorators: [withOpenBanner],
};

Playground.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.tab();
};

export const Example: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  parameters: { controls: { disable: true }, layout: "fullscreen" },
  render: () => <CookieConsent />,
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
};
