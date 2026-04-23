"use client";

import React from "react";
import Title from "@dt/Title";
import Text from "@dt/Text";

import styles from "./colophon.module.css";

export function ColophonPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Title level={1} terminals="sans">
          Colophon
        </Title>
        <p className={styles.intro}>
          This site is its own case study. 100+ components, 4 theme modes, 3
          languages, streaming AI chat, and a design token system that enforces
          itself. Here&apos;s how it&apos;s built.
        </p>
      </header>

      {/* By the numbers */}
      <section className={styles.section}>
        <Title level={2} terminals="sans" className={styles.sectionTitle}>
          By the numbers
        </Title>
        <div className={styles.statGrid}>
          <div className={styles.stat}>
            <span className={styles.statNumber}>100+</span>
            <span className={styles.statLabel}>Components</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNumber}>4</span>
            <span className={styles.statLabel}>Theme modes</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNumber}>3</span>
            <span className={styles.statLabel}>Languages</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNumber}>~200</span>
            <span className={styles.statLabel}>Design tokens</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNumber}>12</span>
            <span className={styles.statLabel}>Blog posts</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNumber}>8</span>
            <span className={styles.statLabel}>MCP integrations</span>
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section className={styles.section}>
        <Title level={2} terminals="sans" className={styles.sectionTitle}>
          Architecture
        </Title>
        <div className={styles.grid}>
          <div className={styles.card}>
            <p className={styles.cardLabel}>Framework</p>
            <p className={styles.cardValue}>
              Next.js 15 App Router with React 19 and TypeScript 6. Server
              components by default, client components where interactivity
              demands it. ISR revalidation on all pages.
            </p>
          </div>
          <div className={styles.card}>
            <p className={styles.cardLabel}>Hosting</p>
            <p className={styles.cardValue}>
              Vercel serverless. Edge middleware for security headers. Sentry for
              error tracking. Vercel Analytics for performance.
            </p>
          </div>
          <div className={styles.card}>
            <p className={styles.cardLabel}>CMS</p>
            <p className={styles.cardValue}>
              Sanity CMS for structured content. Blog posts as MDX files with
              auto-generated TypeScript metadata. Dual pipeline — local-first
              with CMS sync.
            </p>
          </div>
          <div className={styles.card}>
            <p className={styles.cardLabel}>Database</p>
            <p className={styles.cardValue}>
              MongoDB for contact submissions and GDPR-compliant data
              management. PostgreSQL for structured queries.
            </p>
          </div>
        </div>
      </section>

      {/* Design System */}
      <section className={styles.section}>
        <Title level={2} terminals="sans" className={styles.sectionTitle}>
          Design system
        </Title>
        <div className={styles.grid}>
          <div className={styles.card}>
            <p className={styles.cardLabel}>Tokens</p>
            <p className={styles.cardValue}>
              ~200 CSS custom properties covering typography, color, spacing,
              grid, motion, and radius. No JSON intermediate — tokens defined
              directly in CSS and consumed by CSS Modules. Enforced by
              Stylelint + Rhythmguard.
            </p>
          </div>
          <div className={styles.card}>
            <p className={styles.cardLabel}>Styling</p>
            <p className={styles.cardValue}>
              CSS Modules exclusively. Logical properties throughout
              (margin-inline, padding-block). Tailwind available as a secondary
              utility layer. No inline styles except dynamic backgroundImage.
            </p>
          </div>
          <div className={styles.card}>
            <p className={styles.cardLabel}>Typography</p>
            <p className={styles.cardValue}>
              Syne for headings, Satoshi for body. Fluid sizing via clamp() —
              no breakpoint-based font scales. Display: 5–8rem, body: 0.75–1.25rem.
            </p>
          </div>
          <div className={styles.card}>
            <p className={styles.cardLabel}>Themes</p>
            <p className={styles.cardValue}>
              Four modes: light, dark, high-contrast black, high-contrast white.
              Switched via CSS class selectors on the root element. Cookie-persisted.
            </p>
          </div>
        </div>
      </section>

      {/* Components */}
      <section className={styles.section}>
        <Title level={2} terminals="sans" className={styles.sectionTitle}>
          Component architecture
        </Title>
        <Text as="p" terminals="sans">
          Every component follows the same structure: functional component,
          CSS Module, Storybook story, Vitest + axe-core test, and barrel
          export. No exceptions.
        </Text>
        <div className={styles.grid}>
          <div className={styles.card}>
            <p className={styles.cardLabel}>Primitives</p>
            <p className={styles.cardValue}>
              Built on Radix UI (Accordion, Checkbox, Dialog, Select, Tabs,
              Tooltip) for accessible behavior. Styled with CSS Modules, not
              the Radix theme layer.
            </p>
          </div>
          <div className={styles.card}>
            <p className={styles.cardLabel}>Layout</p>
            <p className={styles.cardValue}>
              Container, Stack, Grid, FlexBox, Spacer, Section, Center. Responsive
              grid: 4 → 8 → 12 columns.
            </p>
          </div>
          <div className={styles.card}>
            <p className={styles.cardLabel}>Storybook</p>
            <p className={styles.cardValue}>
              Storybook 10 with a11y addon, Vitest integration, and MCP addon.
              Every component has stories. WIP badge until a11y + visual +
              translation verification passes.
            </p>
          </div>
          <div className={styles.card}>
            <p className={styles.cardLabel}>Testing</p>
            <p className={styles.cardValue}>
              Vitest for unit tests. axe-core for accessibility. Playwright for
              visual regression. Every component test includes an accessibility
              assertion.
            </p>
          </div>
        </div>
      </section>

      {/* Animation */}
      <section className={styles.section}>
        <Title level={2} terminals="sans" className={styles.sectionTitle}>
          Animation
        </Title>
        <div className={styles.grid}>
          <div className={styles.card}>
            <p className={styles.cardLabel}>GSAP</p>
            <p className={styles.cardValue}>
              Primary animation engine. ScrollTrigger for scroll-driven
              animations. useGSAP hook for React integration. Named easing
              curves in the token system.
            </p>
          </div>
          <div className={styles.card}>
            <p className={styles.cardLabel}>Framer Motion</p>
            <p className={styles.cardValue}>
              React-specific transitions and AnimatePresence for enter/exit
              animations. Page transitions and layout animations.
            </p>
          </div>
          <div className={styles.card}>
            <p className={styles.cardLabel}>Lenis</p>
            <p className={styles.cardValue}>
              Smooth scrolling with momentum. Respects prefers-reduced-motion.
              Integrated via SmoothScrollProvider in the layout chain.
            </p>
          </div>
        </div>
      </section>

      {/* i18n */}
      <section className={styles.section}>
        <Title level={2} terminals="sans" className={styles.sectionTitle}>
          Internationalization
        </Title>
        <Text as="p" terminals="sans">
          English, Finnish, and Swedish — full coverage across all UI strings,
          form labels, error messages, and content. Powered by i18next +
          react-i18next with browser language detection and cookie persistence.
          100% translation coverage is a shipping requirement.
        </Text>
      </section>

      {/* AI */}
      <section className={styles.section}>
        <Title level={2} terminals="sans" className={styles.sectionTitle}>
          AI integration
        </Title>
        <div className={styles.grid}>
          <div className={styles.card}>
            <p className={styles.cardLabel}>Donny</p>
            <p className={styles.cardValue}>
              Studio guide chatbot for design systems intake. Streaming
              responses via Vercel AI SDK. Rate-limited, prompt-injection-guarded,
              with structured tool calling for project showcase and navigation.
            </p>
          </div>
          <div className={styles.card}>
            <p className={styles.cardLabel}>MCP</p>
            <p className={styles.cardValue}>
              8 Model Context Protocol integrations: Figma, GitHub, TypeScript
              LSP, Sentry, Vercel, Context7, Sanity, and Akaunting. The site is
              agent-aware from the ground up.
            </p>
          </div>
        </div>
      </section>

      {/* Security */}
      <section className={styles.section}>
        <Title level={2} terminals="sans" className={styles.sectionTitle}>
          Security
        </Title>
        <Text as="p" terminals="sans">
          Strict Content Security Policy in production. HSTS with 2-year max-age
          and preload. Input sanitized via mongo-sanitize and isomorphic-dompurify.
          Rate limiting on AI chat and contact endpoints. GDPR-compliant with
          automated weekly data cleanup. Permissions-Policy disables camera,
          microphone, and geolocation.
        </Text>
      </section>

      {/* OSS */}
      <section className={styles.section}>
        <Title level={2} terminals="sans" className={styles.sectionTitle}>
          Open-source tools used on this site
        </Title>
        <Text as="p" terminals="sans">
          This site uses Rhythmguard for design token enforcement at lint time,
          and was bootstrapped with Project Spine for agent-native operating
          context. Both are open-source tools we built and maintain.
        </Text>
      </section>
    </main>
  );
}
