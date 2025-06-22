import { MemoryRouter } from "react-router-dom";
import type { Preview } from '@storybook/react-webpack5';
import React from "react";

const THEME_KEY = "storybook-theme";

const setThemeClass = (theme: string) => {
  if (typeof window !== "undefined") {
    document.documentElement.classList.toggle("theme-dark", theme === "dark");
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
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme || "light";
      React.useEffect(() => {
        setThemeClass(theme);
        localStorage.setItem(THEME_KEY, theme);
      }, [theme]);
      return (
        <MemoryRouter>
          <Story />
        </MemoryRouter>
      );
    },
  ],
};

export default preview;
