import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { TranslationProvider } from "../../lib/translation";
import ReliablePartnerBadge from "./ReliablePartnerBadge";
import contract from "./ReliablePartnerBadge.contract.json";

const meta = {
  title: "Marketing/ReliablePartnerBadge",
  component: ReliablePartnerBadge,
  tags: ["alpha", "autodocs"],
  parameters: {
    layout: "centered",
    a11y: { test: "error" },
    contractStatus: contract.status,
  },
  args: { size: "md" },
} satisfies Meta<typeof ReliablePartnerBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Renders the language the surrounding TranslationProvider reports. */
function InLanguage({
  language,
  children,
}: {
  language: string;
  children: React.ReactNode;
}) {
  return (
    <TranslationProvider language={language} resolvedLanguage={language}>
      {children}
    </TranslationProvider>
  );
}

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "With no language context the badge falls back to English and links to the English report PDF.",
      },
    },
  },
};

export const Playground: Story = {};

export const Languages: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "The mark and its report link follow the active UI language: Finnish, Swedish, English.",
      },
    },
  },
  render: () => (
    <div style={{ display: "flex", gap: "2rem", alignItems: "center", flexWrap: "wrap" }}>
      <InLanguage language="fi">
        <ReliablePartnerBadge size="md" />
      </InLanguage>
      <InLanguage language="sv">
        <ReliablePartnerBadge size="md" />
      </InLanguage>
      <InLanguage language="en">
        <ReliablePartnerBadge size="md" />
      </InLanguage>
    </div>
  ),
};

export const Sizes: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "sm (32px) sits in footer chrome; md (48px) and lg (64px) carry an argument next to body copy.",
      },
    },
  },
  render: () => (
    <div style={{ display: "flex", gap: "2rem", alignItems: "center", flexWrap: "wrap" }}>
      <ReliablePartnerBadge size="sm" />
      <ReliablePartnerBadge size="md" />
      <ReliablePartnerBadge size="lg" />
    </div>
  ),
};

export const Unlinked: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "href={null} renders the mark without a link, for contexts that already link to the report themselves.",
      },
    },
  },
  render: () => <ReliablePartnerBadge size="md" href={null} />,
};

export const Example: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "The production About-page trust band: badge, claim, and a direct link to the report.",
      },
    },
  },
  render: () => (
    <div
      style={{
        display: "flex",
        gap: "2rem",
        alignItems: "center",
        maxWidth: "46rem",
        padding: "2rem",
        border: "1px solid color-mix(in srgb, currentColor 12%, transparent)",
        borderRadius: "8px",
      }}
    >
      <ReliablePartnerBadge size="lg" />
      <div style={{ display: "grid", gap: "0.5rem" }}>
        <p style={{ margin: 0, fontWeight: 600 }}>A Vastuu Group Reliable Partner</p>
        <p style={{ margin: 0, fontSize: "0.875rem", lineHeight: 1.5 }}>
          Tax, pension and employer obligations are continuously verified through
          Vastuu Group&apos;s Reliable Partner programme, as required by the Finnish
          Contractor&apos;s Obligations Act.
        </p>
      </div>
    </div>
  ),
};

export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
  parameters: {
    controls: { disable: true },
    a11y: { disable: true, test: "off" },
    docs: {
      description: {
        story:
          "The mark is a raster image, so forced-colors leaves the artwork intact; only the focus ring adapts.",
      },
    },
  },
};
