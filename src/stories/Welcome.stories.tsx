import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@dt/ThemeProvider";
import Icon from "@dt/Icon";
import styles from "./Docs/Documentation.module.css";

const WelcomeContent = () => {
  const { t } = useTranslation();
  useTheme(); // ensure story re-renders on theme change

  return (
    <article className={styles.wrapper}>
      <header className={styles.header}>
        <h1>Digitaltableteur Design System</h1>
        <p className={styles.subtitle}>
          AI-Native Component Library • Next.js 15 + Vite • React 18 •
          TypeScript Strict
        </p>
        <p className={styles.lead}>
          Welcome to the Digitaltableteur design system—a production-ready,
          accessible, and intelligent component library built for modern web
          applications.
        </p>
      </header>

      <section className={styles.section}>
        <h2>Quick Start</h2>
        <pre className={styles.code}>
          {`# Start Storybook
npm run storybook

# Run tests
npm run test
npm run test:a11y
npm run test:visual

# Build Next.js app
npm run build

# Deploy to production
vercel --prod`}
        </pre>
      </section>

      <section className={styles.section}>
        <h2>Core Features</h2>
        <div className={styles.featureGrid}>
          <div className={styles.feature}>
            <h3>
              <Icon name="Palette" size="md" decorative /> Design Tokens
            </h3>
            <p>
              CSS custom properties for colors, spacing, typography, and more.
              Four complete themes with instant switching.
            </p>
          </div>
          <div className={styles.feature}>
            <h3>
              <Icon name="Globe" size="md" decorative /> i18n Support
            </h3>
            <p>
              Complete localization for EN/FI/SV with 100% translation coverage
              enforcement.
            </p>
          </div>
          <div className={styles.feature}>
            <h3>
              <Icon name="UsersFour" size="md" decorative /> Accessibility
            </h3>
            <p>
              WCAG 2.1 AA compliant with automated testing via axe-core and
              manual audits.
            </p>
          </div>
          <div className={styles.feature}>
            <h3>
              <Icon name="Robot" size="md" decorative /> AI Integration
            </h3>
            <p>
              Chat widget with Vercel AI SDK, streaming responses, and MCP tool
              calling.
            </p>
          </div>
          <div className={styles.feature}>
            <h3>
              <Icon name="Package" size="md" decorative /> 50+ Components
            </h3>
            <p>
              Typography, forms, layout, navigation, feedback, and specialized
              components.
            </p>
          </div>
          <div className={styles.feature}>
            <h3>
              <Icon name="Flask" size="md" decorative /> Testing Suite
            </h3>
            <p>
              Unit tests, accessibility tests, visual regression, and
              translation coverage.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Documentation</h2>
        <ul className={styles.docsList}>
          <li>
            <strong>Docs / Design System Overview</strong> - Architecture,
            principles, component catalog
          </li>
          <li>
            <strong>Docs / Theming</strong> - Theme system, tokens, dark mode
            implementation
          </li>
          <li>
            <strong>Docs / Localization</strong> - i18n setup, translation
            workflows, testing
          </li>
          <li>
            <strong>Docs / API Integration</strong> - Serverless functions, chat
            endpoint, MCP tools
          </li>
          <li>
            <strong>Components</strong> - Browse 50+ documented components with
            live examples
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>Design Principles</h2>
        <ol>
          <li>
            <strong>Mutability</strong> - Components adapt at runtime based on
            context and user needs
          </li>
          <li>
            <strong>Transformability</strong> - Roles and structures shift based
            on device and intent
          </li>
          <li>
            <strong>Self-Governance</strong> - Built-in compliance, validation,
            and deprecation logic
          </li>
        </ol>
        <p>
          Read the complete philosophy in <code>docs/AI-POWERED-DS.md</code>
        </p>
      </section>

      <section className={styles.section}>
        <h2>Component Guidelines</h2>
        <p>Before creating components, refer to:</p>
        <ul>
          <li>
            <code>docs/LLM_COMPONENT_GENERATION_RULES.md</code> - Comprehensive
            12,000+ word guide
          </li>
          <li>
            <code>.github/copilot-instructions.md</code> - Project conventions
            and workflows
          </li>
        </ul>
        <p>
          Every component requires: <code>.tsx</code>, <code>.module.css</code>,{" "}
          <code>.stories.tsx</code>, <code>.test.tsx</code>, and{" "}
          <code>index.ts</code>
        </p>
      </section>

      <section className={styles.section}>
        <h2>Tech Stack</h2>
        <ul>
          <li>
            <strong>React 18</strong> - Functional components with hooks
          </li>
          <li>
            <strong>TypeScript</strong> - Strict mode with full type safety
          </li>
          <li>
            <strong>CSS Modules</strong> - Scoped styling with logical
            properties
          </li>
          <li>
            <strong>Storybook 10</strong> - Component development and
            documentation
          </li>
          <li>
            <strong>Vitest</strong> - Unit and integration testing
          </li>
          <li>
            <strong>Playwright</strong> - Visual regression testing
          </li>
          <li>
            <strong>i18next</strong> - Internationalization
          </li>
          <li>
            <strong>Vercel AI SDK</strong> - AI chat integration
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>Interactive Features</h2>
        <p>Use the toolbar to test components in different contexts:</p>
        <ul>
          <li>
            <strong>
              <Icon name="Moon" size="sm" decorative /> Theme Switcher
            </strong>{" "}
            - Toggle between Light, Dark, HCB, HCW
          </li>
          <li>
            <strong>
              <Icon name="Translate" size="sm" decorative /> Language Switcher
            </strong>{" "}
            - Test EN, FI, SV translations
          </li>
          <li>
            <strong>
              <Icon name="DeviceMobile" size="sm" decorative /> Viewport
              Controls
            </strong>{" "}
            - Responsive testing at various breakpoints
          </li>
          <li>
            <strong>
              <Icon name="Eye" size="sm" decorative /> Accessibility Checks
            </strong>{" "}
            - Built-in a11y validation
          </li>
        </ul>
      </section>
    </article>
  );
};

const meta: Meta<typeof WelcomeContent> = {
  title: "Overview/Welcome",
  component: WelcomeContent,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;

type Story = StoryObj<typeof WelcomeContent>;

export const Welcome: Story = {
  render: () => <WelcomeContent />,
};
