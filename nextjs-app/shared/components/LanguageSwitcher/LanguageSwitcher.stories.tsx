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
  title: "Navigation/LanguageSwitcher",
  component: LanguageSwitcher,
  tags: ["beta", "autodocs"],
  parameters: {
    contractStatus: contract.status,
    a11y: { test: "error" },
    layout: "centered",
  },
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts);
  // the composite languages slot keeps a mapping preset, and currentLang is a
  // select over the preset's codes (free text would just deselect everything).
  // floatedButtonClassName/openTriggerClassName are effect-exempt in
  // audit:controls (open-tray only; unit-tested).
  argTypes: {
    languages: {
      control: { type: "select" },
      options: ["all", "finnishSwedish"],
      mapping: {
        all: LANGUAGES,
        // No "en" entry: with currentLang=en the trigger falls back to the
        // first language, so the preset change is visible with the tray closed.
        finnishSwedish: LANGUAGES.slice(1),
      },
      description:
        "Available languages (code, label, accessible name). Pick a preset here; compose your own in code.",
      table: { category: "Content", type: { summary: "LanguageSwitcherOption[]" } },
    },
    currentLang: {
      control: { type: "inline-radio" },
      options: LANGUAGES.map((lang) => lang.code),
      description: "Currently selected language code",
      table: { category: "State" },
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
  tags: ["beta-matrix"],
  // languages arg is a mapping key resolved by the preset above.
  args: {
    languages: "all" as unknown as LanguageSwitcherOption[],
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

/** The open tray: other locales fan out beside the current one. */
export const FanOpen: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "Activating the trigger fans the other locales out with a spring (a plain fade under prefers-reduced-motion). While closed the tray is inert, so its buttons can never take keyboard focus.",
      },
    },
  },
  render: () => <LanguageSwitcherDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", {
      name: /show language options|english/i,
    });
    await userEvent.click(trigger);
    const finnish = await waitFor(() => {
      const option = canvas.getByRole("button", { name: /^finnish$/i });
      expect(option).toBeVisible();
      return option;
    });
    /* The fan tray springs in via Framer opacity; the post-play axe audit
       measures blended text color, so wait for the animation to fully settle
       before handing the tree over. */
    await waitFor(() => {
      const tray = finnish.closest("[class*='optionsTrayFan']") as HTMLElement;
      expect(Number(getComputedStyle(tray).opacity)).toBe(1);
    });
  },
};

/** Accessible names speak the target language. */
export const AccessibleNames: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "Each option's ariaLabel should be written in the language it switches to — \"Vaihda kieli suomeksi\", \"Byt språk till svenska\" — so the users who need that locale understand the control. Visible labels stay short locale codes.",
      },
    },
  },
  render: () => <LanguageSwitcherDemo />,
};

/** Controlled wiring: i18n changes in the callback, currentLang flows back. */
export const ControlledWiring: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "The component never changes language itself: switch your i18n instance inside onLanguageChange and pass the new currentLang back down. The demo holds it in local state.",
      },
    },
  },
  render: () => <LanguageSwitcherDemo />,
};
