import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import Header from "./Header";
import { ThemeProvider } from "@dt/ThemeProvider";

// Stable theme list (module scope) prevents unnecessary effect re-runs and satisfies lint dependency check.
const cycleThemes = ["light", "dark", "hcb", "hcw"] as const;

const meta: Meta<typeof Header> = {
  title: "Patterns/Header",
  component: Header,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",// Keep WIP badge until visual + a11y verified
  },
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof Header>;

export const Default: Story = {
  name: "Default",
  render: () => <Header />,
};

const ThemeCycleComponent: React.FC = () => {
  const [theme, setTheme] =
    React.useState<(typeof cycleThemes)[number]>("light");

  React.useEffect(() => {
    const interval = setInterval(() => {
      setTheme((prev) => {
        const idx = cycleThemes.indexOf(prev);
        return cycleThemes[(idx + 1) % cycleThemes.length];
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <ThemeProvider forcedTheme={theme}>
      <Header />
    </ThemeProvider>
  );
};

export const ThemeCycle: Story = {
  name: "Theme Cycle (Interactive)",
  render: () => <ThemeCycleComponent />,
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates the theme toggle cycling through light, dark, high contrast black (hcb) and high contrast white (hcw) every 3 seconds.",
      },
    },
  },
};
