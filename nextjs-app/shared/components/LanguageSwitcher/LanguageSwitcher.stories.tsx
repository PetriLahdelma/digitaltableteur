import contract from "./LanguageSwitcher.contract.json";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  LanguageSwitcher,
  type LanguageSwitcherOption,
} from "./LanguageSwitcher";

const LANGUAGES: LanguageSwitcherOption[] = [
  { code: "en", label: "EN", ariaLabel: "English" },
  { code: "fi", label: "FI", ariaLabel: "Finnish" },
  { code: "sv", label: "SV", ariaLabel: "Swedish" },
];

/** Stateful wrapper so the trigger reflects the selected language. */
function LanguageSwitcherDemo(props: { initialLang?: string }) {
  const [lang, setLang] = useState(props.initialLang ?? "en");
  return (
    <LanguageSwitcher
      languages={LANGUAGES}
      currentLang={lang}
      onLanguageChange={setLang}
    />
  );
}

const meta = {
  title: "Molecules/LanguageSwitcher",
  component: LanguageSwitcher,
  tags: ["beta", "!autodocs"],
  parameters: {
    contractStatus: contract.status,
    a11y: { test: "error" },
    layout: "centered",
  },
  argTypes: {
    languages: {
      control: "object",
      description: "Available languages (code, label, accessible name)",
      table: { category: "Content" },
    },
    currentLang: {
      control: "text",
      description: "Currently selected language code",
      table: { category: "State" },
    },
    onLanguageChange: {
      description: "Called with the selected language code",
      table: {
        category: "Events",
        type: { summary: "(code: string) => void" },
      },
    },
    className: {
      control: false,
      description: "Optional classes on the group wrapper",
      table: { category: "Advanced" },
    },
  },
} satisfies Meta<typeof LanguageSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["beta-matrix"],
  render: () => <LanguageSwitcherDemo />,
};

export const Playground: Story = {
  args: {
    languages: LANGUAGES,
    currentLang: "en",
    onLanguageChange: () => {},
  },
};

export const Example: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  parameters: { controls: { disable: true } },
  render: () => <LanguageSwitcherDemo />,
};

/** Drives the toggle by keyboard: open with the trigger, close with Escape. */
export const KeyboardToggle: Story = {
  tags: ["beta-matrix"],
  render: () => <LanguageSwitcherDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", {
      name: /show language options|english/i,
    });
    await userEvent.click(trigger);
    /* The option rail animates in/out (Framer Motion opacity); assert through
       the transition, not against its first frame. */
    await waitFor(() =>
      expect(canvas.getByRole("button", { name: /^finnish$/i })).toBeVisible(),
    );
    await userEvent.keyboard("{Escape}");
    /* hidden: true — the closed tray goes aria-hidden immediately, which
       already satisfies a default role query while the exit animation still
       renders the buttons. Track actual DOM removal so the post-play axe
       audit runs against a settled tree. */
    await waitFor(() =>
      expect(
        canvas.queryByRole("button", { name: /^finnish$/i, hidden: true }),
      ).not.toBeInTheDocument(),
    );
  },
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  parameters: { a11y: { disable: true, test: "off" } },
  globals: { forcedColors: "active" },
  render: () => <LanguageSwitcherDemo />,
};
