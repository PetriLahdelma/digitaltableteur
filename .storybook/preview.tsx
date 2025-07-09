import { MemoryRouter } from "react-router-dom";
import { ThemeProvider } from "@dt/ThemeProvider";
import type { Preview } from '@storybook/react-vite';
import React from "react";

const THEME_KEY = "storybook-theme";

const setThemeClass = (theme: string) => {
  if (typeof window !== "undefined") {
    document.documentElement.classList.toggle("themeDark", theme === "dark");
  }
};

const preview: Preview = {
  globalTypes: {
    theme: {
      name: "Theme",
      description: "Global theme for components",
      defaultValue: "light",
      toolbar: {
        icon: "circlehollow",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
        showName: true,
        dynamicTitle: true,
      },
    },
  },
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#fff' },
        { name: 'dark', value: '#000' },
      ],
    },
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme || "light";
      React.useEffect(() => {
        setThemeClass(theme);
        localStorage.setItem(THEME_KEY, theme);
        if (typeof window !== "undefined") {
          document.body.style.background = theme === "dark" ? "#000" : "#fff";
        }
      }, [theme]);
      return (
        <MemoryRouter>
          <ThemeProvider forcedTheme={theme}>
            <Story />
          </ThemeProvider>
        </MemoryRouter>
      );
    },
  ],
};

export default preview;
