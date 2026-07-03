import type { Meta, StoryObj } from "@storybook/react-vite";
import { DonnyBookingEmbed } from "./DonnyBookingEmbed";

const meta = {
  title: "Site/DonnyBookingEmbed",
  component: DonnyBookingEmbed,
  parameters: {
    badges: ["wip"],
  },
} satisfies Meta<typeof DonnyBookingEmbed>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CalComEmbed: Story = {
  args: {
    configured: true,
    provider: "calcom",
    meetingLabel: "UX sprint discovery",
    embedUrl: "https://app.cal.eu/digitaltableteur/30min/embed?embed=true",
    fallbackUrl: "https://cal.eu/digitaltableteur/30min",
    calLink: "digitaltableteur/30min",
    calOrigin: "https://cal.eu",
    embedJsUrl: "https://app.cal.eu/embed/embed.js",
    prefillApplied: true,
  },
};

export const NotConfigured: Story = {
  args: {
    configured: false,
    provider: "none",
    meetingLabel: "discovery",
    embedUrl: "",
    fallbackUrl: "/contact",
  },
};
