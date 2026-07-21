import React, { useLayoutEffect, useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor } from "storybook/test";
import { Stage, assertNative, nativeStoryParameters } from "../NativeStory";
import {
  DtLanguageSwitcherElement,
  type DtLanguageSwitcherOption,
} from "../../../../../packages/web-components/src/native/language-switcher";

if (!customElements.get("dt-language-switcher")) {
  customElements.define("dt-language-switcher", DtLanguageSwitcherElement);
}

const LANGUAGES: DtLanguageSwitcherOption[] = [
  { code: "en", label: "EN", ariaLabel: "English" },
  { code: "fi", label: "FI", ariaLabel: "Vaihda kieli suomeksi" },
  { code: "sv", label: "SV", ariaLabel: "Byt språk till svenska" },
];

type Args = {
  languages: DtLanguageSwitcherOption[];
  currentLang: string;
  buttonClassName?: string;
  activeButtonClassName?: string;
  openTriggerClassName?: string;
  floatedButtonClassName?: string;
  onLanguageChange?: (code: string) => void;
};

function NativeLanguageSwitcher({
  languages,
  currentLang,
  buttonClassName,
  activeButtonClassName,
  openTriggerClassName,
  floatedButtonClassName,
  onLanguageChange,
}: Args) {
  const ref = useRef<DtLanguageSwitcherElement>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    element.languages = languages;
    element.currentLang = currentLang;
    element.buttonClassName = buttonClassName ?? "";
    element.activeButtonClassName = activeButtonClassName ?? "";
    element.openTriggerClassName = openTriggerClassName ?? "";
    element.floatedButtonClassName = floatedButtonClassName ?? "";
  }, [
    activeButtonClassName,
    buttonClassName,
    currentLang,
    floatedButtonClassName,
    languages,
    openTriggerClassName,
  ]);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element || !onLanguageChange) return;
    const handleChange = (event: Event) => {
      onLanguageChange((event as CustomEvent<{ code: string }>).detail.code);
    };
    element.addEventListener("language-change", handleChange);
    return () => element.removeEventListener("language-change", handleChange);
  }, [onLanguageChange]);

  return React.createElement("dt-language-switcher", { ref });
}

function ControlledDemo({
  initialLang = "en",
  showValue = false,
}: {
  initialLang?: string;
  showValue?: boolean;
}) {
  const [currentLang, setCurrentLang] = useState(initialLang);
  return (
    <div>
      {showValue ? (
        <p style={{ marginBlock: "0 0 0.75rem" }}>
          Current language: <strong>{currentLang}</strong>
        </p>
      ) : null}
      <NativeLanguageSwitcher
        languages={LANGUAGES}
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
      />
    </div>
  );
}

function shadowTrigger(canvasElement: HTMLElement): HTMLButtonElement {
  const trigger = canvasElement
    .querySelector<DtLanguageSwitcherElement>("dt-language-switcher")
    ?.shadowRoot?.querySelector<HTMLButtonElement>(".trigger");
  if (!trigger) throw new Error("Missing native language trigger");
  return trigger;
}

const meta = {
  title: "Web Components/Navigation/LanguageSwitcher",
  component: NativeLanguageSwitcher,
  tags: ["autodocs", "beta", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    docs: {
      description: {
        component:
          "Native `dt-language-switcher` with controlled locale selection, an inert closed tray, target-language accessible names, and composed `language-change` events.",
      },
    },
  },
  args: {
    languages: LANGUAGES,
    currentLang: "en",
  },
  argTypes: {
    languages: {
      control: { type: "object" },
      description: "Available language codes, labels, and accessible names.",
    },
    currentLang: {
      control: "inline-radio",
      options: ["en", "fi", "sv"],
    },
    onLanguageChange: { control: false },
  },
} satisfies Meta<typeof NativeLanguageSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["beta-matrix"],
  render: () => <ControlledDemo />,
  play: assertNative("dt-language-switcher"),
};

export const Playground: Story = { tags: ["beta-matrix"] };

export const Example: Story = {
  tags: ["beta-matrix", "example"],
  render: () => (
    <Stage width="20rem">
      <ControlledDemo />
    </Stage>
  ),
};

export const KeyboardToggle: Story = {
  tags: ["example"],
  render: () => <ControlledDemo />,
  play: async ({ canvasElement }) => {
    const trigger = shadowTrigger(canvasElement);
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    await waitFor(() =>
      expect(shadowTrigger(canvasElement)).toHaveAttribute(
        "aria-expanded",
        "true",
      ),
    );
    await userEvent.keyboard("{Escape}");
    await waitFor(() =>
      expect(shadowTrigger(canvasElement)).toHaveAttribute(
        "aria-expanded",
        "false",
      ),
    );
  },
};

export const ForcedColors: Story = {
  tags: ["beta-matrix", "example"],
  globals: { forcedColors: "active" },
  render: () => <ControlledDemo />,
};

export const FanOpen: Story = {
  tags: ["example"],
  render: () => <ControlledDemo />,
  play: async ({ canvasElement }) => {
    await userEvent.click(shadowTrigger(canvasElement));
    const element = canvasElement.querySelector<DtLanguageSwitcherElement>(
      "dt-language-switcher",
    );
    await waitFor(() => {
      expect(
        element?.shadowRoot?.querySelectorAll<HTMLButtonElement>(".floated"),
      ).toHaveLength(2);
    });
  },
};

export const AccessibleNames: Story = {
  tags: ["example"],
  render: () => <ControlledDemo />,
};

export const ControlledWiring: Story = {
  tags: ["example"],
  render: () => <ControlledDemo showValue />,
};
