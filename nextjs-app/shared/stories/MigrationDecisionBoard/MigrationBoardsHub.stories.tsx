import type { Meta, StoryObj } from "@storybook/react-vite";
import { MigrationReviewHub } from "./MigrationDecisionBoard";

const meta = {
  title: "Design system/Migration boards",
  parameters: { layout: "fullscreen", docs: { disable: true } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const BOARDS = [
  {
    title: "Button surfaces — CTA bands",
    storyId: "actions-button-surface-comparison--cta-bands",
    note: "Approved — surface onDark / onBrand / default on tinted bands.",
    status: "approved" as const,
  },
  {
    title: "Button surfaces — Home hero (light)",
    storyId: "actions-button-surface-comparison--home-hero-band",
    note: "Approved — surface=default only; not onDark.",
    status: "approved" as const,
  },
  {
    title: "Button contexts (map, icon, success)",
    storyId: "design-system-migration-boards-button-contexts--all-contexts",
    note: "Migrated — StudioMap, IconButton, ContactFormSuccess",
    status: "approved" as const,
  },
  {
    title: "Contact flow (editorial)",
    storyId: "design-system-migration-boards-contact-flow--editorial",
    note: "Migrated — /contact submit + success send another",
    status: "approved" as const,
  },
  {
    title: "Form primitives",
    storyId: "design-system-migration-boards-form-primitives--field-and-checkbox",
    note: "Migrated — FormField, CheckboxField",
    status: "approved" as const,
  },
  {
    title: "Dialogs & overlays",
    storyId: "design-system-migration-boards-dialogs--alert-and-deferrals",
    note: "Approved — error alert via @dt/Modal + description; composable trigger deferred",
    status: "approved" as const,
  },
];

export const ReviewHub: Story = {
  render: () => <MigrationReviewHub boards={BOARDS} />,
};
