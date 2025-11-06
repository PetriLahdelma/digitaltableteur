import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import Header from "./Header";
import { ThemeProvider } from "@dt/ThemeProvider";

const meta: Meta<typeof Header> = {
  title: "Patterns/Header",
  component: Header,
  parameters: {
    layout: "fullscreen",
    wip: { disabled: false }, // Keep WIP badge until visual + a11y verified
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
  const themes = ["light", "dark", "hcb", "hcw"] as const;
  const [theme, setTheme] = React.useState<(typeof themes)[number]>("light");

  React.useEffect(() => {
    const interval = setInterval(() => {
      setTheme((prev) => {
        const idx = themes.indexOf(prev);
        return themes[(idx + 1) % themes.length];
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
