import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import Icon from "@dt/Icon";
import { DocSection, FoundationPage } from "../doc";
import styles from "../doc/FoundationDoc.module.css";

const COMMON_ICONS = [
  "circle-info",
  "triangle-exclamation",
  "circle-check",
  "circle-xmark",
  "arrow-right",
  "arrow-square-out",
  "xmark",
  "list",
  "magnifying-glass",
  "user",
  "paper-plane-tilt",
  "github",
  "linkedin-logo",
  "sun",
  "moon",
  "circle-notch",
] as const;

const meta = {
  title: "Foundations/Icons",
  parameters: { layout: "fullscreen" },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  render: () => (
    <FoundationPage
      title="Icons"
      lead="Phosphor icons via @dt/Icon — tokenized sizes, weights, and accessible labels. Full gallery: Docs/Icons."
    >
      <DocSection
        title="Common UI icons"
        description="Use semantic color tokens, not hardcoded hex."
      >
        <div className={styles.iconGrid}>
          {COMMON_ICONS.map((name) => (
            <div key={name} className={styles.iconCell}>
              <Icon name={name} size="lg" decorative />
              <code>{name}</code>
            </div>
          ))}
        </div>
      </DocSection>
      <DocSection title="Status colors">
        <div
          style={{
            display: "flex",
            gap: "var(--space-layout-24)",
            alignItems: "center",
          }}
        >
          <Icon name="circle-info" color="var(--color-info)" ariaLabel="Info" />
          <Icon
            name="triangle-exclamation"
            color="var(--color-warning)"
            ariaLabel="Warning"
          />
          <Icon
            name="circle-check"
            color="var(--color-success)"
            ariaLabel="Success"
          />
          <Icon
            name="circle-xmark"
            color="var(--color-error)"
            ariaLabel="Error"
          />
        </div>
      </DocSection>
    </FoundationPage>
  ),
};
