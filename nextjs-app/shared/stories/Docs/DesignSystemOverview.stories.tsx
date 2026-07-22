import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useTranslation } from "react-i18next";
import styles from "./Documentation.module.css";

const DesignSystemOverviewContent = () => {
  const { t } = useTranslation();

  return (
    <article className={styles.wrapper}>
      <header className={styles.header}>
        <h1>Design System Overview</h1>
        <p className={styles.lead}>
          Digitaltableteur Design System is an AI-native, adaptive component
          library built for Next.js and Vite applications. It emphasizes
          accessibility, internationalization, and intelligent adaptation.
        </p>
      </header>

      <section className={styles.section}>
        <h2>Philosophy & Core Principles</h2>
        <p>
          Our design system is built on three foundational principles that guide
          every component and pattern:
        </p>

        <div className={styles.principleGrid}>
          <div className={styles.principle}>
            <h3>1. Mutability</h3>
            <p>
              Components support runtime structural mutation. Visual styles,
              sizes, density, and layouts can be recalibrated based on user
              context, performance data, and system optimization signals.
            </p>
            <ul>
              <li>Design tokens drive all visual decisions</li>
              <li>
                Theme switching without page reload (Light, Dark, HCB, HCW)
              </li>
              <li>Responsive typography using clamp() functions</li>
              <li>CSS logical properties for RTL support</li>
            </ul>
          </div>

          <div className={styles.principle}>
            <h3>2. Transformability</h3>
            <p>
              Components can transform their role and structure based on device,
              user intent, and interaction complexity. A button can become a
              command surface, a card can expand into a dashboard container.
            </p>
            <ul>
              <li>Polymorphic components (Button, Text, Title)</li>
              <li>Progressive enhancement patterns</li>
              <li>Native Web Share API with fallbacks</li>
              <li>Adaptive loading states</li>
            </ul>
          </div>

          <div className={styles.principle}>
            <h3>3. Self-Governance</h3>
            <p>
              Built-in accessibility compliance, token validation, and pattern
              alignment ensure consistency without manual oversight. Components
              include version awareness and deprecation logic.
            </p>
            <ul>
              <li>Automated a11y testing with axe-core</li>
              <li>Visual regression testing via Storybook</li>
              <li>Translation coverage enforcement</li>
              <li>WIP badge system for story maturity</li>
            </ul>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Architecture & Tech Stack</h2>

        <div className={styles.techStack}>
          <div className={styles.techItem}>
            <h3>React 19+</h3>
            <p>
              Functional components with TypeScript strict mode, hooks-based
              state management, and forwardRef support for ref forwarding.
            </p>
          </div>

          <div className={styles.techItem}>
            <h3>CSS Modules</h3>
            <p>
              Scoped styling with CSS custom properties (design tokens). No
              CSS-in-JS or styled-components—pure CSS with logical properties.
            </p>
          </div>

          <div className={styles.techItem}>
            <h3>Storybook 10</h3>
            <p>
              Component documentation, visual testing, and development
              environment. WIP badge system indicates component maturity.
            </p>
          </div>

          <div className={styles.techItem}>
            <h3>Vitest + Testing Library</h3>
            <p>
              Unit testing, accessibility testing, and translation coverage
              validation. Visual regression via Storybook test runner.
            </p>
          </div>

          <div className={styles.techItem}>
            <h3>i18next</h3>
            <p>
              Complete internationalization with 3 languages (EN/FI/SV). Browser
              language detection with localStorage persistence.
            </p>
          </div>

          <div className={styles.techItem}>
            <h3>Vercel AI SDK</h3>
            <p>
              AI-powered chat widget with streaming responses, tool calling, and
              MCP (Model Context Protocol) integration.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Component Categories</h2>

        <div className={styles.categoryList}>
          <div className={styles.category}>
            <h3>Typography</h3>
            <ul>
              <li>
                <code>Title</code> - Semantic headings (h1-h6) with size scales
              </li>
              <li>
                <code>Text</code> - Body text with polymorphic as prop
              </li>
              <li>
                <code>Label</code> - Form labels and metadata text
              </li>
            </ul>
          </div>

          <div className={styles.category}>
            <h3>Forms & Inputs</h3>
            <ul>
              <li>
                <code>Button</code> - Primary, secondary, ghost, danger variants
              </li>
              <li>
                <code>Checkbox</code> + <code>CheckboxGroup</code>
              </li>
              <li>
                <code>Switch</code> - Toggle component
              </li>
              <li>
                <code>Select</code> + <code>SelectOption</code>
              </li>
              <li>
                <code>Inputs</code> (TextInput, TextArea, PasswordInput)
              </li>
              <li>
                <code>FileUpload</code> - Drag & drop file input
              </li>
              <li>
                <code>TransformingActionInput</code> - Input with inline actions
              </li>
            </ul>
          </div>

          <div className={styles.category}>
            <h3>Layout & Structure</h3>
            <ul>
              <li>
                <code>Grid</code> - CSS Grid wrapper with responsive columns
              </li>
              <li>
                <code>FlexBox</code> - Flexbox utility component
              </li>
              <li>
                <code>PageLayout</code> - Semantic page sections
              </li>
              <li>
                <code>Card</code> - Versatile container with tabs, actions,
                loading
              </li>
              <li>
                <code>Modal</code> - Accessible dialog component
              </li>
            </ul>
          </div>

          <div className={styles.category}>
            <h3>Navigation</h3>
            <ul>
              <li>
                <code>Link</code> - Smart routing link (Next.js/React Router)
              </li>
              <li>
                <code>NavMenuList</code> - Reusable navigation list
              </li>
              <li>
                <code>WorkNav</code> + <code>BlogNav</code> - Context navigation
              </li>
            </ul>
          </div>

          <div className={styles.category}>
            <h3>Feedback & Status</h3>
            <ul>
              <li>
                <code>Spinner</code> - Indeterminate loading spinner
              </li>
              <li>
                <code>Skeleton</code> - Placeholder loading states
              </li>
              <li>
                <code>Toast</code> - Notification system
              </li>
              <li>
                <code>Badge</code> - Status indicators
              </li>
              <li>
                <code>AIProcessingState</code> - AI thinking indicators
              </li>
            </ul>
          </div>

          <div className={styles.category}>
            <h3>Content Display</h3>
            <ul>
              <li>
                <code>ArticleCard</code> - Blog post preview
              </li>
              <li>
                <code>PersonCard</code> - Team member display
              </li>
              <li>
                <code>Testimonial</code> - Quote attribution
              </li>
              <li>
                <code>Gallery</code> - Image grid
              </li>
              <li>
                <code>MarkdownMessage</code> - GitHub-flavored markdown
              </li>
            </ul>
          </div>

          <div className={styles.category}>
            <h3>Interactive Components</h3>
            <ul>
              <li>
                <code>ChatWidget</code> - AI chat interface with email workflow
              </li>
              <li>
                <code>ContactForm</code> - Email.js integration
              </li>
              <li>
                <code>SecureCVDownload</code> - Password-protected downloads
              </li>
              <li>
                <code>SocialShare</code> - Web Share API with fallbacks
              </li>
              <li>
                <code>Avatar</code> - User avatar with dropdown menu
              </li>
            </ul>
          </div>

          <div className={styles.category}>
            <h3>Specialized Components</h3>
            <ul>
              <li>
                <code>OpenHours</code> - Business hours display
              </li>
              <li>
                <code>ServicesGrid</code> - Service offerings
              </li>
              <li>
                <code>ComplianceCard</code> - GDPR, SOC2 badges
              </li>
              <li>
                <code>HelsinkiClock</code> - Timezone display
              </li>
              <li>
                <code>MacWindowFrame</code> - macOS-style window chrome
              </li>
              <li>
                <code>MCPActionButton</code> - MCP tool invocation
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Design Tokens</h2>
        <p>
          All visual decisions flow through CSS custom properties defined in{" "}
          <code>shared/styles/variables.css</code>. Tokens are organized into
          categories:
        </p>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Category</th>
              <th>Token Pattern</th>
              <th>Example</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Colors</td>
              <td>
                <code>--color-*</code>
              </td>
              <td>
                <code>--color-primary</code>, <code>--color-success</code>
              </td>
            </tr>
            <tr>
              <td>Spacing</td>
              <td>
                <code>--space-*</code>
              </td>
              <td>
                <code>--space-layout-8</code>, <code>--space-layout-16</code>
              </td>
            </tr>
            <tr>
              <td>Typography</td>
              <td>
                <code>--font-size-*</code>
              </td>
              <td>
                <code>--font-size-text-m</code>,{" "}
                <code>--font-size-title-l</code>
              </td>
            </tr>
            <tr>
              <td>Radius</td>
              <td>
                <code>--radius-*</code>
              </td>
              <td>
                <code>--radius-sm</code>, <code>--radius-md</code>,{" "}
                <code>--radius-lg</code>, <code>--radius-xl</code>,{" "}
                <code>--radius-full</code>, <code>--radius-circle</code>
              </td>
            </tr>
            <tr>
              <td>Shadows</td>
              <td>
                <code>--shadow-*</code>
              </td>
              <td>
                <code>--shadow-sm</code>, <code>--shadow-md</code>,{" "}
                <code>--shadow-lg</code>, <code>--shadow-xl</code>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className={styles.section}>
        <h2>API Integration</h2>
        <p>
          The app ships Next.js App Router route handlers under{" "}
          <code>app/api/*/route.ts</code>. They use environment variables for
          secrets, Zod for validation, and rate limiting on write endpoints.
        </p>

        <div className={styles.apiGrid}>
          <div className={styles.apiItem}>
            <h3>/api/chat</h3>
            <p>
              AI chat endpoint using the Vercel AI SDK with streaming responses.
              Supports tool calling via MCP (Model Context Protocol) for
              structured data retrieval.
            </p>
            <pre className={styles.code}>
              {`POST /api/chat
Body: { messages: UIMessage[] }
Returns: streamed Response`}
            </pre>
          </div>

          <div className={styles.apiItem}>
            <h3>/api/contact & /api/save-contact</h3>
            <p>
              Contact form handlers. Email delivery is via Resend; submissions
              persist to MongoDB. Validated with Zod and rate-limited.
            </p>
            <pre className={styles.code}>
              {`POST /api/contact | /api/save-contact
Body: { name, email, phone?, message }
Returns: { success: boolean }`}
            </pre>
          </div>

          <div className={styles.apiItem}>
            <h3>/api/gdpr/delete-data</h3>
            <p>
              GDPR data-deletion endpoint. Removes stored contact submissions on
              verified request.
            </p>
            <pre className={styles.code}>
              {`POST /api/gdpr/delete-data
Body: { email, token }
Returns: { deleted: boolean }`}
            </pre>
          </div>

          <div className={styles.apiItem}>
            <h3>/api/[transport]</h3>
            <p>
              MCP server endpoint exposing the site&apos;s tools to Model Context
              Protocol clients over the configured transport.
            </p>
            <pre className={styles.code}>
              {`GET|POST /api/[transport]
MCP handshake + tool calls`}
            </pre>
          </div>

          <div className={styles.apiItem}>
            <h3>/api/download-cv</h3>
            <p>
              Password-protected CV download endpoint. Validates credentials and
              streams PDF file with proper content headers.
            </p>
            <pre className={styles.code}>
              {`POST /api/download-cv
Body: { password: string }
Returns: PDF stream or 401`}
            </pre>
          </div>

          <div className={styles.apiItem}>
            <h3>/api/test-health/*</h3>
            <p>
              Test health dashboard APIs for CI/CD observability. Exposes test
              runs, metrics, and visual regression status.
            </p>
            <pre className={styles.code}>
              {`GET /api/test-health/runs
GET /api/test-health/runs/latest
Returns: JSON test metrics`}
            </pre>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Getting Started</h2>
        <p>
          The app is Next.js 16 (App Router). Components import from{" "}
          <code>@dt/&lt;Name&gt;</code> in-repo, and from{" "}
          <code>@digitaltableteur/react</code> when consumed from the registry.
        </p>

        <pre className={styles.code}>
          {`// Install dependencies
npm install

// Start Storybook
npm run storybook

// Run tests
npm run test
npm run test:a11y
npm run test:visual

// Build Next.js
npm run build

// Deploy to Vercel
vercel --prod`}
        </pre>

        <h3>Component Usage</h3>
        <pre className={styles.code}>
          {`import Button from "@dt/Button";
import Title from "@dt/Title";
import Text from "@dt/Text";
import Card from "@dt/Card";
import { useTheme } from "@dt/ThemeProvider";
import { useTranslation } from "react-i18next";

function MyComponent() { const { t } = useTranslation();
  const { theme, cycleTheme } = useTheme();

  return (
    <Card title={t("cardTitle")} hoverable>
      <Title level={2}>
        {t("heading")}
      </Title>
      <Text as="p">
        {t("description")}
      </Text>
      <Button variant="primary" onClick={cycleTheme}>
        {t("toggleTheme")}
      </Button>
    </Card>
  );
}`}
        </pre>
      </section>

      <section className={styles.section}>
        <h2>Documentation Structure</h2>
        <p>Explore the comprehensive documentation organized by topic:</p>
        <ul>
          <li>
            <strong>Overview</strong> - Welcome, Getting Started, Design
            Principles
          </li>
          <li>
            <strong>Docs/Theming</strong> - Theme system, token usage, dark mode
          </li>
          <li>
            <strong>Docs/Localization</strong> - i18n setup, translation
            workflows
          </li>
          <li>
            <strong>Foundations/*</strong> - Color, Typography, Space, Radius,
            Elevation, Motion, Contrast tokens
          </li>
          <li>
            <strong>Docs/API Integration</strong> - App Router route handlers,
            MCP tools
          </li>
          <li>
            <strong>Overview/Test Health</strong> - test, a11y, and
            visual-regression metrics
          </li>
          <li>
            <strong>Components/*</strong> - Individual component documentation
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>Contributing</h2>
        <p>Before creating new components, always refer to:</p>
        <ul>
          <li>
            <code>docs/LLM_COMPONENT_GENERATION_RULES.md</code> - Comprehensive
            generation guide (12,000+ words)
          </li>
          <li>
            <code>docs/AI-POWERED-DS.md</code> - AI-native design system
            philosophy
          </li>
          <li>
            <code>.github/copilot-instructions.md</code> - Project conventions
          </li>
        </ul>

        <p>
          Every component must include: <code>.tsx</code>,{" "}
          <code>.module.css</code>, <code>.stories.tsx</code>,{" "}
          <code>.test.tsx</code>, and <code>index.ts</code>.
        </p>
      </section>
    </article>
  );
};

const meta: Meta = {
  title: "Docs/DesignSystemOverview",
  parameters: {
    layout: "fullscreen",
    vitest: {
      skip: true, // Skip Vitest tests for documentation showcase
    },
  },
};

export default meta;

type Story = StoryObj<typeof DesignSystemOverviewContent>;

export const Overview: Story = {
  render: () => <DesignSystemOverviewContent />,
};
