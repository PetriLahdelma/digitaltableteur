/**
 * ThemeProvider Storybook Stories
 * Comprehensive theme testing and verification
 *
 * @file ThemeProvider.stories.tsx
 * @description Visual testing for all 4 themes (light, dark, hcb, hcw)
 */

import React from "react";
import { Meta, StoryFn } from "@storybook/react-vite";
import { ThemeProvider, useTheme, type Theme } from "./ThemeProvider";
import Button from "@dt/Button";
import Checkbox from "@dt/Checkbox";
import Switch from "@dt/Switch";
import Text from "@dt/Text";
import Title from "@dt/Title";
import Card from "@dt/Card";

export default {
  title: "Foundation/ThemeProvider",
  component: ThemeProvider,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
The ThemeProvider manages the application's theme state and provides theme-switching capabilities.

## Features
- **4 Themes**: Light, Dark, High Contrast Black, High Contrast White
- **System Detection**: Automatically respects \`prefers-color-scheme\`
- **Contrast Support**: Responds to \`prefers-contrast: more\`
- **Persistence**: Saves user preference to localStorage/cookies
- **Real-time Updates**: Listens for system preference changes
        `,
      },
    },
  },
} as Meta;

// Theme color palette component
const ColorSwatch = ({
  name,
  cssVar,
}: {
  name: string;
  cssVar: string;
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
      marginBottom: "0.5rem",
    }}
  >
    <div
      style={{
        width: "2rem",
        height: "2rem",
        borderRadius: "0.25rem",
        border: "1px solid var(--color-border)",
        backgroundColor: `var(${cssVar})`,
      }}
    />
    <div style={{ fontFamily: "var(--font-text)", fontSize: "0.875rem" }}>
      <div style={{ fontWeight: 600, color: "var(--color-text)" }}>{name}</div>
      <code
        style={{
          fontSize: "0.75rem",
          color: "var(--secondary-text-color)",
        }}
      >
        {cssVar}
      </code>
    </div>
  </div>
);

// Theme preview panel
const ThemePreviewPanel = ({
  theme,
  label,
}: {
  theme: Theme;
  label: string;
}) => (
  <ThemeProvider forcedTheme={theme}>
    <div
      style={{
        padding: "1.5rem",
        backgroundColor: "var(--main-body-background-color)",
        border: "1px solid var(--color-border)",
        borderRadius: "0.5rem",
        minWidth: "280px",
      }}
    >
      <Title size="S" level={3} className="" style={{ marginBottom: "1rem" }}>
        {label}
      </Title>

      {/* Color Tokens */}
      <div style={{ marginBottom: "1.5rem" }}>
        <Text
          size="S"
          style={{
            fontWeight: 600,
            marginBottom: "0.75rem",
            display: "block",
          }}
        >
          Color Tokens
        </Text>
        <ColorSwatch name="Background" cssVar="--main-body-background-color" />
        <ColorSwatch name="Text" cssVar="--color-text" />
        <ColorSwatch name="Primary" cssVar="--color-primary" />
        <ColorSwatch name="Border" cssVar="--color-border" />
        <ColorSwatch name="Success" cssVar="--color-success" />
        <ColorSwatch name="Error" cssVar="--color-error" />
      </div>

      {/* Button Variants */}
      <div style={{ marginBottom: "1.5rem" }}>
        <Text
          size="S"
          style={{
            fontWeight: 600,
            marginBottom: "0.75rem",
            display: "block",
          }}
        >
          Buttons
        </Text>
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            flexWrap: "wrap",
          }}
        >
          <Button variant="primary" size="sm">
            Primary
          </Button>
          <Button variant="secondary" size="sm">
            Secondary
          </Button>
          <Button variant="tertiary" size="sm">
            Tertiary
          </Button>
        </div>
      </div>

      {/* Form Controls */}
      <div style={{ marginBottom: "1rem" }}>
        <Text
          size="S"
          style={{
            fontWeight: 600,
            marginBottom: "0.75rem",
            display: "block",
          }}
        >
          Form Controls
        </Text>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <Checkbox label="Checkbox" id={`checkbox-${theme}`} />
          <Switch id={`switch-${theme}`} label="Switch" />
        </div>
      </div>

      {/* Text Samples */}
      <div>
        <Text
          size="S"
          style={{
            fontWeight: 600,
            marginBottom: "0.5rem",
            display: "block",
          }}
        >
          Text Samples
        </Text>
        <Text size="M" style={{ marginBottom: "0.25rem", display: "block" }}>
          Primary body text for readability
        </Text>
        <Text
          size="S"
          style={{
            color: "var(--secondary-text-color)",
            display: "block",
          }}
        >
          Secondary text with reduced contrast
        </Text>
      </div>
    </div>
  </ThemeProvider>
);

// Interactive theme controller
const ThemeController = () => {
  const { theme, setTheme, toggleTheme, systemPreference, isExplicitChoice, resetToSystemPreference } =
    useTheme();

  return (
    <Card style={{ padding: "1.5rem", marginBottom: "2rem" }}>
      <Title size="S" level={3} style={{ marginBottom: "1rem" }}>
        Theme Controller
      </Title>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <Text size="S" style={{ fontWeight: 600, display: "block" }}>
            Current Theme
          </Text>
          <Text size="M" style={{ display: "block" }}>
            {theme}
          </Text>
        </div>
        <div>
          <Text size="S" style={{ fontWeight: 600, display: "block" }}>
            System Preference
          </Text>
          <Text size="M" style={{ display: "block" }}>
            {systemPreference}
          </Text>
        </div>
        <div>
          <Text size="S" style={{ fontWeight: 600, display: "block" }}>
            Explicit Choice
          </Text>
          <Text size="M" style={{ display: "block" }}>
            {isExplicitChoice ? "Yes" : "No (following system)"}
          </Text>
        </div>
      </div>

      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        <Button variant="primary" onClick={toggleTheme}>
          Cycle Theme
        </Button>
        <Button variant="secondary" onClick={() => setTheme("light")}>
          Light
        </Button>
        <Button variant="secondary" onClick={() => setTheme("dark")}>
          Dark
        </Button>
        <Button variant="secondary" onClick={() => setTheme("hcb")}>
          HC Black
        </Button>
        <Button variant="secondary" onClick={() => setTheme("hcw")}>
          HC White
        </Button>
        {isExplicitChoice && (
          <Button variant="tertiary" onClick={resetToSystemPreference}>
            Reset to System
          </Button>
        )}
      </div>
    </Card>
  );
};

/**
 * All Themes - Side by side comparison
 */
export const AllThemes: StoryFn = () => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
      gap: "1.5rem",
      padding: "1rem",
    }}
  >
    <ThemePreviewPanel theme="light" label="Light Theme" />
    <ThemePreviewPanel theme="dark" label="Dark Theme" />
    <ThemePreviewPanel theme="hcb" label="High Contrast Black" />
    <ThemePreviewPanel theme="hcw" label="High Contrast White" />
  </div>
);
AllThemes.parameters = {
  docs: {
    description: {
      story:
        "Visual comparison of all 4 themes side-by-side. Each panel shows color tokens, button variants, form controls, and text samples.",
    },
  },
};

/**
 * Interactive - Test theme switching
 */
export const Interactive: StoryFn = () => (
  <ThemeProvider>
    <div style={{ padding: "1rem" }}>
      <ThemeController />

      <div
        style={{
          padding: "2rem",
          backgroundColor: "var(--main-body-background-color)",
          border: "1px solid var(--color-border)",
          borderRadius: "0.5rem",
        }}
      >
        <Title size="M" level={2} style={{ marginBottom: "1rem" }}>
          Theme Preview Area
        </Title>
        <Text size="M" style={{ marginBottom: "1.5rem", display: "block" }}>
          This area demonstrates how content appears in the current theme. Try
          switching themes using the controller above.
        </Text>

        <div
          style={{
            display: "flex",
            gap: "1rem",
            flexWrap: "wrap",
            marginBottom: "1.5rem",
          }}
        >
          <Button variant="primary">Primary Action</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="tertiary">Tertiary</Button>
          <Button variant="error">Error</Button>
          <Button variant="success">Success</Button>
        </div>

        <div
          style={{
            display: "flex",
            gap: "2rem",
            alignItems: "center",
          }}
        >
          <Checkbox label="Accept terms" id="demo-checkbox" />
          <Switch id="demo-switch" label="Enable feature" />
        </div>
      </div>
    </div>
  </ThemeProvider>
);
Interactive.parameters = {
  docs: {
    description: {
      story:
        "Interactive theme switcher with real-time preview. Tests the useTheme hook and theme persistence.",
    },
  },
};

/**
 * Focus States - Keyboard accessibility test
 */
export const FocusStates: StoryFn = () => (
  <div style={{ padding: "1rem" }}>
    <Title size="M" level={2} style={{ marginBottom: "1rem" }}>
      Focus States Testing
    </Title>
    <Text size="M" style={{ marginBottom: "1.5rem", display: "block" }}>
      Tab through these elements to verify focus rings are visible in all
      themes. Focus rings should use the theme&apos;s focus ring color with
      proper offset.
    </Text>

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "2rem",
      }}
    >
      <ThemeProvider forcedTheme="light">
        <div
          style={{
            padding: "1.5rem",
            backgroundColor: "var(--main-body-background-color)",
            border: "1px solid var(--color-border)",
            borderRadius: "0.5rem",
          }}
        >
          <Title size="S" level={3} style={{ marginBottom: "1rem" }}>
            Light Theme
          </Title>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            <Button variant="primary">Focus me</Button>
            <Button variant="secondary">And me</Button>
            <Checkbox label="Check focus" id="focus-light-check" />
            <Switch id="focus-light-switch" label="Switch focus" />
          </div>
        </div>
      </ThemeProvider>

      <ThemeProvider forcedTheme="dark">
        <div
          style={{
            padding: "1.5rem",
            backgroundColor: "var(--main-body-background-color)",
            border: "1px solid var(--color-border)",
            borderRadius: "0.5rem",
          }}
        >
          <Title size="S" level={3} style={{ marginBottom: "1rem" }}>
            Dark Theme
          </Title>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            <Button variant="primary">Focus me</Button>
            <Button variant="secondary">And me</Button>
            <Checkbox label="Check focus" id="focus-dark-check" />
            <Switch id="focus-dark-switch" label="Switch focus" />
          </div>
        </div>
      </ThemeProvider>

      <ThemeProvider forcedTheme="hcb">
        <div
          style={{
            padding: "1.5rem",
            backgroundColor: "var(--main-body-background-color)",
            border: "1px solid var(--color-border)",
            borderRadius: "0.5rem",
          }}
        >
          <Title size="S" level={3} style={{ marginBottom: "1rem" }}>
            HC Black
          </Title>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            <Button variant="primary">Focus me</Button>
            <Button variant="secondary">And me</Button>
            <Checkbox label="Check focus" id="focus-hcb-check" />
            <Switch id="focus-hcb-switch" label="Switch focus" />
          </div>
        </div>
      </ThemeProvider>

      <ThemeProvider forcedTheme="hcw">
        <div
          style={{
            padding: "1.5rem",
            backgroundColor: "var(--main-body-background-color)",
            border: "1px solid var(--color-border)",
            borderRadius: "0.5rem",
          }}
        >
          <Title size="S" level={3} style={{ marginBottom: "1rem" }}>
            HC White
          </Title>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            <Button variant="primary">Focus me</Button>
            <Button variant="secondary">And me</Button>
            <Checkbox label="Check focus" id="focus-hcw-check" />
            <Switch id="focus-hcw-switch" label="Switch focus" />
          </div>
        </div>
      </ThemeProvider>
    </div>
  </div>
);
FocusStates.parameters = {
  docs: {
    description: {
      story:
        "Test focus visibility across all themes. Tab through elements to verify WCAG 2.4.7 compliance.",
    },
  },
};

/**
 * Color Tokens - Full palette display
 */
export const ColorTokens: StoryFn = () => {
  const tokens = [
    { name: "Background", cssVar: "--main-body-background-color" },
    { name: "Primary Text", cssVar: "--color-text" },
    { name: "Secondary Text", cssVar: "--secondary-text-color" },
    { name: "Primary Color", cssVar: "--color-primary" },
    { name: "Link Color", cssVar: "--link-color" },
    { name: "Border", cssVar: "--color-border" },
    { name: "Light Background", cssVar: "--color-light-bg" },
    { name: "Success", cssVar: "--color-success" },
    { name: "Error", cssVar: "--color-error" },
    { name: "Warning", cssVar: "--color-warning" },
    { name: "Info", cssVar: "--color-info" },
    { name: "Focus Ring", cssVar: "--focus-ring-color" },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "1rem",
        padding: "1rem",
      }}
    >
      {(["light", "dark", "hcb", "hcw"] as Theme[]).map((theme) => (
        <ThemeProvider forcedTheme={theme} key={theme}>
          <div
            style={{
              padding: "1rem",
              backgroundColor: "var(--main-body-background-color)",
              border: "1px solid var(--color-border)",
              borderRadius: "0.5rem",
            }}
          >
            <Title size="S" level={3} style={{ marginBottom: "1rem" }}>
              {theme.toUpperCase()}
            </Title>
            {tokens.map((token) => (
              <ColorSwatch
                key={token.cssVar}
                name={token.name}
                cssVar={token.cssVar}
              />
            ))}
          </div>
        </ThemeProvider>
      ))}
    </div>
  );
};
ColorTokens.parameters = {
  docs: {
    description: {
      story:
        "Complete color token reference showing how each token renders across all themes.",
    },
  },
};
