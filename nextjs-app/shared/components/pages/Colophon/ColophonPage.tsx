"use client";

import Link from "next/link";
import React from "react";

import { Text, Title } from "@digitaltableteur/react";

import styles from "./colophon.module.css";

export function ColophonPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Title level={1}>
          Colophon
        </Title>
        <Text as="p" className={styles.intro}>
          This site is its own case study — a production portfolio, content
          platform, and agent-aware design system in one codebase. Twelve case
          studies, a crawlable blog, a hundred programmatic SEO guides,
          streaming AI chat with booking, and a token system that enforces
          itself. Here is how it is built today.
        </Text>
      </header>

      <section className={styles.section}>
        <Title level={2} className={styles.sectionTitle}>
          By the numbers
        </Title>
        <div className={styles.statGrid}>
          <div className={styles.stat}>
            <span className={styles.statNumber}>200+</span>
            <span className={styles.statLabel}>Components & patterns</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNumber}>12</span>
            <span className={styles.statLabel}>Portfolio case studies</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNumber}>100</span>
            <span className={styles.statLabel}>Topic guides (PSEO)</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNumber}>12</span>
            <span className={styles.statLabel}>Published blog posts</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNumber}>350+</span>
            <span className={styles.statLabel}>Design tokens</span>
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
            <span className={styles.statNumber}>14</span>
            <span className={styles.statLabel}>MCP server configs</span>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <Title level={2} className={styles.sectionTitle}>
          Architecture
        </Title>
        <div className={styles.grid}>
          <div className={styles.card}>
            <p className={styles.cardLabel}>Framework</p>
            <p className={styles.cardValue}>
              Next.js 16 App Router with React 19 and TypeScript 6. Server
              components by default; client components where interactivity,
              i18n, or animation require them. ISR revalidation on marketing and
              content routes.
            </p>
          </div>
          <div className={styles.card}>
            <p className={styles.cardLabel}>Hosting</p>
            <p className={styles.cardValue}>
              Vercel serverless with edge middleware for security headers.
              Sentry for error tracking and release health. Vercel Analytics for
              performance signals.
            </p>
          </div>
          <div className={styles.card}>
            <p className={styles.cardLabel}>Content</p>
            <p className={styles.cardValue}>
              Sanity CMS for structured publishing, plus local MDX articles with
              generated TypeScript metadata. Blog bodies are server-rendered for
              crawlers; RSS at{" "}
              <code className={styles.inlineCode}>/blog/feed.xml</code>. Dual
              pipeline — local-first with CMS sync.
            </p>
          </div>
          <div className={styles.card}>
            <p className={styles.cardLabel}>Data</p>
            <p className={styles.cardValue}>
              MongoDB for contact submissions and GDPR-compliant retention.
              PostgreSQL via Neon for structured queries. Weekly automated GDPR
              cleanup on stored submissions.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <Title level={2} className={styles.sectionTitle}>
          Content & discovery
        </Title>
        <div className={styles.grid}>
          <div className={styles.card}>
            <p className={styles.cardLabel}>SEO & AEO</p>
            <p className={styles.cardValue}>
              Dynamic sitemap and robots.txt, canonical URLs, CollectionPage and
              Article JSON-LD, author Person schema, and{" "}
              <code className={styles.inlineCode}>llms.txt</code> for AI
              crawlers. Human-readable Sitemap at{" "}
              <code className={styles.inlineCode}>/sitemap</code> using the
              SiteTree component.
            </p>
          </div>
          <div className={styles.card}>
            <p className={styles.cardLabel}>Programmatic SEO</p>
            <p className={styles.cardValue}>
              One hundred service × stack × audience topic pages under{" "}
              <code className={styles.inlineCode}>/pseo</code>, generated from a
              typed catalog with pillar pages for services, stacks, and
              audiences.
            </p>
          </div>
          <div className={styles.card}>
            <p className={styles.cardLabel}>Portfolio</p>
            <p className={styles.cardValue}>
              Twelve case-study routes with shared ProjectDetailLayout,
              ProjectMetaSection, StoryBlock, and ProcessBlock patterns — each
              with bespoke CSS Modules where the story demands it.
            </p>
          </div>
          <div className={styles.card}>
            <p className={styles.cardLabel}>Blog</p>
            <p className={styles.cardValue}>
              MDX articles with server-rendered prose, related posts, author
              pages, reading-time metadata, and share actions. Scheduled posts
              stay out of the public index until their publish date.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <Title level={2} className={styles.sectionTitle}>
          Design system
        </Title>
        <div className={styles.grid}>
          <div className={styles.card}>
            <p className={styles.cardLabel}>Tokens</p>
            <p className={styles.cardValue}>
              350+ CSS custom properties for typography, color, spacing, grid,
              motion, and radius. Defined in CSS and consumed by CSS Modules.
              Enforced by Stylelint and Rhythmguard.
            </p>
          </div>
          <div className={styles.card}>
            <p className={styles.cardLabel}>Styling</p>
            <p className={styles.cardValue}>
              CSS Modules as the primary styling layer with logical properties
              throughout. Tailwind v4 utilities for layout shells and editorial
              pages. No inline styles except dynamic{" "}
              <code className={styles.inlineCode}>backgroundImage</code>.
            </p>
          </div>
          <div className={styles.card}>
            <p className={styles.cardLabel}>Typography</p>
            <p className={styles.cardValue}>
              Satoshi throughout, headings and body. Fluid sizing via clamp(), no
              breakpoint-based font scales. Title and Text components wrap every
              typographic surface.
            </p>
          </div>
          <div className={styles.card}>
            <p className={styles.cardLabel}>Themes</p>
            <p className={styles.cardValue}>
              Light, dark, high-contrast black, and high-contrast white.
              Switched via CSS class selectors on the root element and persisted
              in a cookie.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <Title level={2} className={styles.sectionTitle}>
          Component architecture
        </Title>
        <Text as="p">
          Every component ships as a folder: functional component, CSS Module,
          Storybook story, Vitest test (including axe-core where applicable),
          contract.json, spec.md, and barrel export.
        </Text>
        <div className={styles.grid}>
          <div className={styles.card}>
            <p className={styles.cardLabel}>Primitives</p>
            <p className={styles.cardValue}>
              Radix UI for accessible behavior (Accordion, Checkbox, Dialog,
              Select, Tabs, Tooltip). Combobox and MultiCombobox for editorial
              forms. Styled with CSS Modules, not the Radix theme layer.
            </p>
          </div>
          <div className={styles.card}>
            <p className={styles.cardLabel}>Layout</p>
            <p className={styles.cardValue}>
              Container, Stack, Grid, FlexBox, Spacer, Section, Center, and
              PageLayout with responsive page-margin tokens. SiteTree for
              hierarchical navigation displays.
            </p>
          </div>
          <div className={styles.card}>
            <p className={styles.cardLabel}>Storybook</p>
            <p className={styles.cardValue}>
              Storybook 10 with a11y addon, Vitest integration, and MCP addon.
              WIP badge until a11y, visual, and translation verification pass.
            </p>
          </div>
          <div className={styles.card}>
            <p className={styles.cardLabel}>Testing</p>
            <p className={styles.cardValue}>
              Vitest for unit tests, axe-core for accessibility, Playwright for
              visual regression against Storybook. CI runs typecheck, lint, and
              tests before every merge.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <Title level={2} className={styles.sectionTitle}>
          Animation
        </Title>
        <div className={styles.grid}>
          <div className={styles.card}>
            <p className={styles.cardLabel}>GSAP</p>
            <p className={styles.cardValue}>
              Primary animation engine. ScrollTrigger for scroll-driven motion.
              useGSAP for React lifecycle safety. Named easing curves in the
              token system.
            </p>
          </div>
          <div className={styles.card}>
            <p className={styles.cardLabel}>Framer Motion</p>
            <p className={styles.cardValue}>
              React transitions and AnimatePresence for enter/exit animations,
              page transitions, and layout animations.
            </p>
          </div>
          <div className={styles.card}>
            <p className={styles.cardLabel}>Lenis</p>
            <p className={styles.cardValue}>
              Smooth scrolling with momentum. Respects{" "}
              <code className={styles.inlineCode}>prefers-reduced-motion</code>.
              Integrated via SmoothScrollProvider in the layout chain.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <Title level={2} className={styles.sectionTitle}>
          Internationalization
        </Title>
        <Text as="p">
          English, Finnish, and Swedish — full coverage across UI strings, form
          labels, error messages, and cookie consent. Powered by i18next and
          react-i18next with browser language detection and cookie persistence.
          Complete translation coverage is a shipping requirement.
        </Text>
      </section>

      <section className={styles.section}>
        <Title level={2} className={styles.sectionTitle}>
          AI & agent integration
        </Title>
        <div className={styles.grid}>
          <div className={styles.card}>
            <p className={styles.cardLabel}>Donny</p>
            <p className={styles.cardValue}>
              Studio guide chatbot for design-system intake. Streaming responses
              via the Vercel AI SDK with rate limiting and prompt-injection
              guards. Tool calling for portfolio showcase, in-app navigation,
              lead capture, Cal.com booking handoff, and avatar expressions.
            </p>
          </div>
          <div className={styles.card}>
            <p className={styles.cardLabel}>Contact</p>
            <p className={styles.cardValue}>
              Editorial contact form with file uploads, MongoDB persistence, and
              Cal.com scheduling tabs on the contact page. Donny can pre-fill
              the form and spotlight relevant fields.
            </p>
          </div>
          <div className={styles.card}>
            <p className={styles.cardLabel}>MCP</p>
            <p className={styles.cardValue}>
              Fourteen Model Context Protocol configurations for development and
              operations: Figma, GitHub, Sentry, Vercel, Sanity, Context7,
              TypeScript LSP, Akaunting, Docker, Next.js devtools, and more. The
              repo and CMS workflows are agent-native by design. The{" "}
              <Link href="/design-system/agent" className={styles.inlineLink}>
                design system agent demo
              </Link>{" "}
              shows MCP tools, golden evals, and pattern recipes without
              changing production chrome.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <Title level={2} className={styles.sectionTitle}>
          Security
        </Title>
        <Text as="p">
          Strict Content Security Policy in production. HSTS with two-year
          max-age and preload. Input sanitized via mongo-sanitize and
          isomorphic-dompurify. Rate limiting on AI chat and contact endpoints.
          GDPR-compliant data deletion API with automated weekly cleanup.
          Permissions-Policy disables camera, microphone, and geolocation.
        </Text>
      </section>

      <section className={styles.section}>
        <Title level={2} className={styles.sectionTitle}>
          Open-source tools built here
        </Title>
        <Text as="p">
          Rhythmguard enforces design tokens at lint time. Project Spine
          bootstraps agent-native operating context. LLM Component Schema
          publishes structured component contracts for AI consumption — all
          three appear as portfolio case studies and ship from this codebase.
        </Text>
      </section>
    </main>
  );
}
