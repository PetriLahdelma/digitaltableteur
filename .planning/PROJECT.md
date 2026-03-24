# Accessibility Audit

## What This Is

A comprehensive accessibility audit and remediation project for the entire public-facing Digitaltableteur website. Covers all visitor-accessible pages against WCAG 2.1 AA standards, producing both a detailed findings report and implementing fixes for all identified issues.

## Core Value

**Every user can access and use the site regardless of ability.** Screen reader users, keyboard-only users, users with low vision, color blindness, or motor impairments should all have equivalent access to content and functionality.

## Current Milestone: v1.0 Full Site Audit + Fixes

**Goal:** Audit entire public site against WCAG 2.1 AA, document findings, and fix all issues.

**Target areas:**
- Alt texts and image accessibility
- ARIA attributes and landmark roles
- Keyboard navigation and tab order
- Focus visible patterns and indicators
- Color contrast (text, UI components, graphics)
- Semantic HTML structure
- Screen reader compatibility
- Form accessibility
- Interactive component accessibility

## Requirements

### Validated

(None yet — audit to validate)

### Active

- [ ] Complete audit of all public pages
- [ ] Document all WCAG 2.1 AA violations with severity ratings
- [ ] Fix critical issues (blockers that prevent use)
- [ ] Fix major issues (significant barriers)
- [ ] Fix minor issues (inconveniences)
- [ ] Verify fixes with automated and manual testing
- [ ] Create ongoing a11y testing strategy

### Out of Scope

- WCAG 2.1 AAA compliance — exceeds current needs
- Third-party embedded content (YouTube, external widgets) — limited control
- Legacy Vite app (`src-legacy-vite-DO-NOT-USE/`) — deprecated, not public-facing
- Admin/internal tools — focus on public site only

## Context

**Existing a11y infrastructure:**
- axe-core integrated in component tests
- `npm run test:a11y` command exists
- High contrast themes (HCB, HCW) already implemented
- Some components have ARIA attributes

**Site structure (public pages):**
- Home page (`/`)
- About page (`/about`)
- Work/Portfolio pages (`/work`, `/work/[slug]`)
- Blog pages (`/blog`, `/blog/[slug]`)
- Contact page (`/contact`)
- Services pages
- Legal pages (privacy, terms)

**Component library:**
- 80+ shared components in `nextjs-app/shared/components/`
- Design system with Title, Text, Button, Card, Icon, Grid, FlexBox
- Interactive components: ChatWidget, Modal, forms, navigation

**Priority approach:** Severity-first
- Critical (P0): Complete blockers — user cannot access content/functionality
- Major (P1): Significant barriers — user can work around but with difficulty
- Minor (P2): Inconveniences — suboptimal but functional

## Constraints

- **Standard**: WCAG 2.1 AA (not AAA)
- **Tech stack**: Next.js 15, React 19, TypeScript, CSS Modules
- **Testing**: axe-core for automated, manual testing for keyboard/screen reader
- **Browsers**: Modern browsers (Chrome, Firefox, Safari, Edge)
- **Screen readers**: VoiceOver (macOS), NVDA (Windows) as primary targets

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Severity-first prioritization | Fix critical blockers before polish issues | — Pending |
| WCAG 2.1 AA (not AAA) | Industry standard, achievable, covers most user needs | — Pending |
| Full site scope | Proactive quality, ensure consistent experience everywhere | — Pending |

---
*Last updated: 2026-01-27 after initialization*
