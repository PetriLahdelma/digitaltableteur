import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import styles from "./Documentation.module.css";
import { expect } from "storybook/test";
const ThemingDocsContent = () => {
  return (
    <article className={styles.wrapper}>
      <header className={styles.header}>
        <h1>Theming System</h1>
        <p className={styles.lead}>
          Four complete themes (Light, Dark, High Contrast Black, High Contrast
          White) with instant switching, CSS custom properties, and zero flash
          on load.
        </p>
      </header>

      <section className={styles.section}>
        <h2>Theme Architecture</h2>
        <p>
          The theming system is built on CSS custom properties (design tokens)
          that automatically update across all components when the theme
          changes. No JavaScript-driven inline styles—pure CSS with semantic
          token names.
        </p>

        <h3>Available Themes</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Theme</th>
              <th>Code</th>
              <th>Use Case</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Light</td>
              <td>
                <code>"light"</code>
              </td>
              <td>
                Default theme with blue primary color (#00f) on white background
              </td>
            </tr>
            <tr>
              <td>Dark</td>
              <td>
                <code>"dark"</code>
              </td>
              <td>
                Dark background with inverted colors for reduced eye strain
              </td>
            </tr>
            <tr>
              <td>High Contrast Black</td>
              <td>
                <code>"hcb"</code>
              </td>
              <td>
                Black background with maximum contrast for visual accessibility
              </td>
            </tr>
            <tr>
              <td>High Contrast White</td>
              <td>
                <code>"hcw"</code>
              </td>
              <td>
                White background with enhanced contrast for better readability
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className={styles.section}>
        <h2>Implementation</h2>

        <h3>1. ThemeProvider Setup</h3>
        <p>
          Wrap your application with <code>ThemeProvider</code> at the root
          level:
        </p>
        <pre className={styles.code}>
          {`// App.tsx or _app.tsx
import { ThemeProvider } from "@dt/ThemeProvider";

function App({ children }) { return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  );
}`}
        </pre>

        <h3>2. Using the Theme Hook</h3>
        <p>Access and control the current theme from any component:</p>
        <pre className={styles.code}>
          {`import { useTheme } from "@dt/ThemeProvider";

function ThemeToggle() { const { theme, setTheme, toggleTheme, cycleTheme } = useTheme();

  return (
    <div>
      <p>Current theme: {theme}</p>
      
      {/* Cycle through all themes */}
      <button onClick={cycleTheme}>
        Cycle Theme
      </button>

      {/* Toggle between light/dark */}
      <button onClick={toggleTheme}>
        Toggle Dark Mode
      </button>

      {/* Set specific theme */}
      <button onClick={() => setTheme("hcb")}>
        High Contrast Black
      </button>
    </div>
  );
}`}
        </pre>

        <h3>3. Theme Persistence</h3>
        <p>Theme preference is automatically saved to:</p>
        <ul>
          <li>
            <code>localStorage</code> (primary) - Key: <code>"theme"</code>
          </li>
          <li>
            <code>document.cookie</code> (fallback) - Name:{" "}
            <code>"dt-theme"</code>
          </li>
        </ul>
        <p>
          The theme persists across page reloads and is applied before React
          hydration to prevent flash of unstyled content (FOUC).
        </p>
      </section>

      <section className={styles.section}>
        <h2>Design Tokens</h2>
        <p>
          All theme-specific values are defined in{" "}
          <code>shared/styles/variables.css</code>. Never hardcode colors,
          spacing, or typography—always use tokens.
        </p>

        <h3>Color Tokens</h3>
        <pre className={styles.code}>
          {`/* Base colors */
--color-primary        /* Brand blue: #00f */
--color-success        /* Green: #068338 */
--color-warning        /* Yellow: #f2e274 */
--color-danger         /* Red: #e11d48 */
--color-info           /* Cyan: #0c7a8b */

/* Text colors */
--color-text           /* Body text color */
--color-title          /* Heading color */
--color-muted          /* Secondary text */

/* Background colors */
--main-body-background-color
--color-light-bg
--color-neutral-bg

/* Theme-aware colors */
--inverted-text-color  /* Switches based on theme */
--primary-text-color   /* Adapts to theme */`}
        </pre>

        <h3>Spacing Tokens</h3>
        <pre className={styles.code}>
          {`/* Layout spacing (8px scale) */
--space-layout-4       /* 0.25rem = 4px */
--space-layout-8       /* 0.5rem = 8px */
--space-layout-12      /* 0.75rem = 12px */
--space-layout-16      /* 1rem = 16px */
--space-layout-20      /* 1.25rem = 20px */
--space-layout-24      /* 1.5rem = 24px */
--space-layout-32      /* 2rem = 32px */
--space-layout-48      /* 3rem = 48px */
--space-layout-64      /* 4rem = 64px */

/* Usage */
.component { padding: var(--space-layout-16);
  margin-bottom: var(--space-layout-24);
}`}
        </pre>

        <h3>Typography Tokens</h3>
        <pre className={styles.code}>
          {`/* Font families */
--font-title           /* Satoshi (sans-serif) */
--font-text            /* Satoshi (sans-serif) */

/* Font sizes (responsive with clamp) */
--font-size-text-xs    /* 0.75rem - 0.9375rem */
--font-size-text-s     /* 0.875rem - 1.125rem */
--font-size-text-m     /* 1rem - 1.25rem */
--font-size-text-l     /* 1.125rem - 1.5rem */
--font-size-text-xl    /* 1.25rem - 1.75rem */

--font-size-title-s    /* 1.5rem - 2.25rem */
--font-size-title-m    /* 2rem - 3rem */
--font-size-title-l    /* 2.75rem - 4.25rem */
--font-size-title-xl   /* 3.5rem - 5.5rem */

/* Line heights */
--line-height-tight    /* 1.2 for large headings */
--line-height-snug     /* 1.375 for medium headings */
--line-height-normal   /* 1.5 for body text */
--line-height-relaxed  /* 1.625 for long-form content */`}
        </pre>
      </section>

      <section className={styles.section}>
        <h2>CSS Module Integration</h2>
        <p>Use tokens in your component CSS Modules for theme-aware styling:</p>
        <pre className={styles.code}>
          {`/* Component.module.css */
.container { background: var(--main-body-background-color);
  color: var(--color-text);
  padding: var(--space-layout-24);
  border-radius: var(--radius-m);
  box-shadow: var(--shadow-m);
}

.heading { font-family: var(--font-title);
  font-size: var(--font-size-title-m);
  color: var(--color-primary);
  margin-bottom: var(--space-layout-16);
  line-height: var(--line-height-tight);
}

.text { font-family: var(--font-text);
  font-size: var(--font-size-text-m);
  color: var(--color-text);
  line-height: var(--line-height-relaxed);
}

/* Theme-specific overrides */
.themeDark .container { background: var(--color-gray-dark);
  border: 1px solid var(--color-gray);
}

.themeHCB .heading { color: var(--inverted-text-color);
  text-shadow: 0 0 2px currentColor;
}`}
        </pre>
      </section>

      <section className={styles.section}>
        <h2>Theme Detection & Initialization</h2>
        <p>The theme system reads from multiple sources in priority order:</p>
        <ol>
          <li>
            <code>localStorage.getItem("theme")</code> - User preference
          </li>
          <li>
            <code>document.cookie</code> (dt-theme) - Fallback when storage
            blocked
          </li>
          <li>
            <code>"light"</code> - Default fallback
          </li>
        </ol>

        <h3>Pre-Hydration Application</h3>
        <p>
          To prevent FOUC (Flash of Unstyled Content), the theme is applied
          synchronously before React renders:
        </p>
        <pre className={styles.code}>
          {`// ThemeProvider.tsx (internal)
const syncThemeClass = () => { if (typeof window !== "undefined") { applyThemeToDom(getStoredTheme());
  }
};
syncThemeClass(); // Executes immediately on module load

const applyThemeToDom = (theme: Theme) => { const root = document.documentElement;
  root.classList.toggle("themeDark", theme === "dark");
  root.classList.toggle("themeHCB", theme === "hcb");
  root.classList.toggle("themeHCW", theme === "hcw");
  root.dataset.theme = theme;
  root.style.colorScheme = theme === "dark" ? "dark" : "light";
};`}
        </pre>

        <h3>Next.js Hydration Handling</h3>
        <p>
          For Next.js apps, add <code>suppressHydrationWarning</code> to prevent
          hydration mismatches:
        </p>
        <pre className={styles.code}>
          {`// app/layout.tsx
export default function RootLayout({ children }) { return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <NextThemeProvider>
          {children}
        </NextThemeProvider>
      </body>
    </html>
  );
}`}
        </pre>
      </section>

      <section className={styles.section}>
        <h2>Storybook Theme Switching</h2>
        <p>
          Storybook includes a theme switcher in the toolbar. Test your
          components in all four themes:
        </p>
        <ol>
          <li>Open any component story in Storybook</li>
          <li>Click the theme icon in the toolbar (top-right)</li>
          <li>Select from Light / Dark / HCB / HCW</li>
          <li>Theme persists across page navigation</li>
        </ol>

        <h3>Forcing a Theme in Stories</h3>
        <p>
          Override the theme for specific stories using <code>parameters</code>:
        </p>
        <pre className={styles.code}>
          {`export const DarkThemeExample: Story = { render: () => <MyComponent />,
  parameters: { theme: "dark", // Force dark theme
  },
};`}
        </pre>
      </section>

      <section className={styles.section}>
        <h2>Accessibility Considerations</h2>
        <ul>
          <li>
            <strong>WCAG Compliance</strong> - All themes meet WCAG 2.1 AA
            contrast ratios
          </li>
          <li>
            <strong>System Preference</strong> - Respects{" "}
            <code>prefers-color-scheme</code> media query on first visit
          </li>
          <li>
            <strong>High Contrast Modes</strong> - HCB and HCW provide enhanced
            contrast for visual impairments
          </li>
          <li>
            <strong>Motion Respect</strong> - Theme transitions disabled when{" "}
            <code>prefers-reduced-motion</code> is active
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>Testing Themes</h2>
        <p>Verify theme functionality in unit tests:</p>
        <pre className={styles.code}>
          {`import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@dt/ThemeProvider";
import MyComponent from "./MyComponent";

test("renders correctly in dark theme", () => { render(
    <ThemeProvider forcedTheme="dark">
      <MyComponent />
    </ThemeProvider>
  );
  
  const root = document.documentElement;
  expect(root.classList.contains("themeDark")).toBe(true);
  expect(root.dataset.theme).toBe("dark");
});`}
        </pre>
      </section>

      <section className={styles.section}>
        <h2>Common Patterns</h2>

        <h3>Theme-Aware Icon Colors</h3>
        <pre className={styles.code}>
          {`.icon { color: var(--color-primary);
}

.themeDark .icon { color: var(--inverted-text-color);
}`}
        </pre>

        <h3>Conditional Theme Rendering</h3>
        <pre className={styles.code}>
          {`function ThemeAwareComponent() { const { theme } = useTheme();
  
  return (
    <div>
      {theme === "dark" ? (
        <MoonIcon />
      ) : (
        <SunIcon />
      )}
    </div>
  );
}`}
        </pre>

        <h3>Progressive Enhancement with @supports</h3>
        <pre className={styles.code}>
          {`/* Base styles */
.panel { background: var(--color-white);
  box-shadow: var(--shadow-m);
}

/* Enhanced for modern browsers */
@supports (backdrop-filter: blur(8px)) {
  .panel { background: color-mix(
      in srgb,
      var(--color-white) 80%,
      transparent
    );
    backdrop-filter: blur(8px);
  }
}`}
        </pre>
      </section>

      <section className={styles.section}>
        <h2>Files & Configuration</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>File</th>
              <th>Purpose</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>shared/styles/variables.css</code>
              </td>
              <td>All CSS custom properties and theme definitions</td>
            </tr>
            <tr>
              <td>
                <code>shared/components/ThemeProvider/</code>
              </td>
              <td>ThemeProvider component and useTheme hook</td>
            </tr>
            <tr>
              <td>
                <code>providers/ThemeProvider.tsx</code>
              </td>
              <td>Next.js wrapper for client-side theme logic</td>
            </tr>
            <tr>
              <td>
                <code>.storybook/preview.tsx</code>
              </td>
              <td>Storybook theme integration and toolbar controls</td>
            </tr>
          </tbody>
        </table>
      </section>
    </article>
  );
};

const meta: Meta = {
  title: "Docs/Theming",
  parameters: {
    layout: "fullscreen",
    vitest: {
      skip: true, // Skip Vitest tests for documentation showcase
    },
  },
};

export default meta;

type Story = StoryObj<typeof ThemingDocsContent>;

export const ThemingGuide: Story = { render: () => <ThemingDocsContent /> };
