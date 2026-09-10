import contract from "./SentrySummaryCard.contract.json";
import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import SentrySummaryCard, { SentrySummaryData } from "@dt/SentrySummaryCard";
import ComplianceCard from "@dt/ComplianceCard";
import type { ComplianceRule } from "@dt/ComplianceCard";
import Icon from "@dt/Icon";

const sentrySummaryCardComplianceRules: ComplianceRule[] = [
  { title: "CSS Modules only (no inline styles)", status: "pass" },
  { title: "Design tokens for spacing/colors", status: "pass" },
  { title: "Logical CSS properties", status: "pass" },
  { title: "TypeScript strict mode", status: "pass" },
  { title: "Accessibility (loading state, error handling)", status: "pass" },
  { title: "i18n for all user-facing text", status: "pass" },
  { title: "Unit tests present", status: "pass" },
  { title: "Storybook stories", status: "pass" },
  { title: "Font token compliance (--font-text)", status: "pass" },
  { title: "Progressive enhancement (stub badge)", status: "pass" },
  { title: "No hardcoded values", status: "pass" },
];

const meta: Meta<typeof SentrySummaryCard> = {
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts).
  title: "Site/SentrySummaryCard",
  component: SentrySummaryCard,
  tags: ["beta", "!autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-sentry-summary-card",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
  },
};
export default meta;

type Story = StoryObj<typeof SentrySummaryCard>;

const FIXED_TIMESTAMP = "2026-01-15T10:00:00.000Z";

const mockIssue: SentrySummaryData = {
  generatedAt: FIXED_TIMESTAMP,
  project: "frontend",
  filters: { unresolved: true, environment: "production" },
  count: 1,
  issues: [
    {
      id: "1",
      title: "TypeError: Cannot read property 'foo' of undefined",
      culprit: "App.tsx",
      level: "error",
      userCount: 3,
      status: "unresolved",
      isUnhandled: true,
      firstSeen: FIXED_TIMESTAMP,
      lastSeen: FIXED_TIMESTAMP,
      permalink: "https://sentry.io/issue/1",
      environment: "production",
    },
  ],
};

export const Loading: Story = {
  render: () => <SentrySummaryCard forceLoading />,
  parameters: {
    docs: {
      description: {
        story: "Displays loading state while fetching summary JSON.",
      },
    },
  },
};

export const WithData: Story = {
  render: () => <SentrySummaryCard dataOverride={mockIssue} />,
  parameters: {
    docs: {
      description: {
        story: "Renders issues from pre-generated JSON (ensure file exists).",
      },
    },
  },
};

export const Empty: Story = {
  render: () => (
    <SentrySummaryCard
      dataOverride={{
        generatedAt: FIXED_TIMESTAMP,
        project: "frontend",
        filters: { unresolved: false, environment: null },
        count: 0,
        issues: [],
      }}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "Shows empty message when no issues match filters.",
      },
    },
  },
};

export const ErrorState: Story = {
  render: () => <SentrySummaryCard forceError />,
  parameters: {
    docs: {
      description: { story: "Displays localized error when fetch fails." },
    },
  },
};

export const Stub: Story = {
  render: () => (
    <SentrySummaryCard
      dataOverride={{
        generatedAt: FIXED_TIMESTAMP,
        project: "frontend",
        filters: { unresolved: true, environment: null },
        count: 0,
        issues: [],
        stub: true,
        reason: "storybook-demo",
      }}
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Indicates fallback stub summary (e.g., missing credentials) via badge.",
      },
    },
  },
};

export const Z_SentrySummaryCardCompliance: Story = {
  parameters: { docs: { disable: true } },
  render: () => (
    <ComplianceCard
      title="Compliance: 11/11"
      titleIcon={
        <Icon name="check-fat" color="var(--color-success)" weight="fill" />
      }
      rules={sentrySummaryCardComplianceRules}
    />
  ),
};

// The bare component fetches its summary JSON at runtime. In Storybook that
// request has no server, so these stories raced between "Loading content" and
// "Failed to load Sentry data" and whichever state won got baked into the
// accessibility snapshot: Default/Playground recorded the error, Example/
// ForcedColors recorded the spinner, and any re-run could flip either way.
// dataOverride settles them on real content. Passing it through args (not
// render) keeps Playground's controls working.
const settled = { dataOverride: mockIssue };

export const Default = { tags: ["beta-matrix"], args: settled };
export const Playground = { tags: ["beta-matrix"], args: settled };
export const Example = {
  tags: ["beta-matrix"],
  args: settled,
  parameters: { controls: { disable: true } },
};
export const ForcedColors = {
  tags: ["beta-matrix"],
  args: settled,
  globals: { forcedColors: "active" },
};
