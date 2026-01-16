# Digitaltableteur Redesign

> Full site redesign with studio aesthetic, Tailwind CSS migration, and kinetic animation system.

## Vision

Transform Digitaltableteur from a portfolio site into a world-class studio presence. Inspired by **It's Nice That** and **Primary.studio** — bold typography, generous whitespace, structured grids, distinctive palettes, subtle textures, and purposeful animation.

**Core Focus**: Visual design excellence. Every element serves a purpose.

---

## Design Philosophy

> Form follows function — every design element should have a purpose.

### Style References
- **It's Nice That** — Editorial feel, bold type, asymmetric layouts
- **Primary.studio** — Clean modernism, whitespace mastery, subtle motion

### Visual Language
- Bold typography with new font pairing (replacing TiemposHeadline + Moderat)
- Generous whitespace and structured grids
- Distinctive color palettes with subtle grain/noise textures
- Full kinetic experience: scroll-driven animations, parallax, complex sequences

### Theming
- 4 themes: Light, Dark, High Contrast White, High Contrast Black
- Tailwind CSS theming system
- WCAG accessibility compliance across all themes

---

## Requirements

### Validated

*Existing capabilities to preserve:*

- ✓ Next.js 15 App Router with SSR/SSG/ISR — existing
- ✓ React 19 with Server Components — existing
- ✓ i18n support (EN/FI/SV) — existing
- ✓ Sanity CMS integration for blog/portfolio — existing
- ✓ MongoDB for contacts/GDPR — existing
- ✓ AI chat widget (streaming) — existing (preserve as-is)
- ✓ Contact form with validation — existing
- ✓ SEO optimization (JSON-LD, sitemap, robots.txt) — existing
- ✓ Security hardening (CSP, CORS, rate limiting) — existing
- ✓ Sentry error tracking — existing
- ✓ Vercel deployment — existing

### Active

*New work for the redesign:*

**Design System**
- [ ] Migrate from CSS Modules to Tailwind CSS
- [ ] Rebuild 77+ components from scratch with Tailwind
- [ ] Implement 4-theme system (light, dark, HC white, HC black)
- [ ] Select and implement new font pairing
- [ ] Create design token system in Tailwind config
- [ ] Build responsive grid system

**Animation System**
- [ ] Integrate GSAP for timeline animations
- [ ] Add Lenis for smooth scroll
- [ ] Integrate Three.js for 3D elements
- [ ] Build scroll-driven animation primitives
- [ ] Create kinetic typography components

**Pages**
- [ ] Redesign Homepage (Hero → Services → Work → Contact flow)
- [ ] Redesign About page
- [ ] Redesign Work/Portfolio page
- [ ] Redesign individual project pages
- [ ] Redesign Contact page
- [ ] Redesign Blog listing and article pages

**Content**
- [ ] Services section showcasing Design & Development above the fold
- [ ] Portfolio with 4 existing projects
- [ ] Case study template for future projects

### Out of Scope

- AI chat widget redesign — keep current implementation
- CMS/Sanity schema changes — restyle only, preserve data structure
- New backend functionality — frontend redesign only
- Mobile app — web only

---

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Tailwind CSS migration | Modern utility-first approach, better DX, easier theming | Pending |
| Rebuild components from scratch | Clean slate better than incremental migration for design-first project | Pending |
| New font pairing | Current typography doesn't match studio aesthetic | Pending selection |
| GSAP + Lenis + Three.js | Full kinetic experience requires professional animation tools | Pending |
| 4 themes | Accessibility (high contrast) + user preference (light/dark) | Pending |
| Homepage flow: Hero → Services → Work → Contact | Classic agency storytelling, services prominent | Pending |

---

## Technical Approach

### Stack Changes

| Current | New |
|---------|-----|
| CSS Modules | Tailwind CSS |
| 77+ legacy components | New component library |
| TiemposHeadline + Moderat | TBD font pairing |
| Framer Motion only | Framer Motion + GSAP + Lenis + Three.js |

### Preserved

- Next.js 15.5.9 (App Router)
- React 19.2.3 (Server Components)
- TypeScript 5.9.3 (strict mode)
- i18next (EN/FI/SV)
- Sanity CMS
- MongoDB
- Sentry
- Vercel deployment

### Architecture

- Component-driven design system (Tailwind)
- Server Components by default
- Client Components for animation/interaction
- Scroll-based animation orchestration

---

## Constraints

### Non-Negotiable

1. **i18n (EN/FI/SV)** — All text must support three languages via translation keys
2. **WCAG Accessibility** — All components must pass axe-core, support keyboard navigation, proper ARIA
3. **Performance** — Despite heavy animation, maintain Lighthouse performance score ≥80
4. **4 Themes** — Every component must work in light, dark, HC white, HC black

### Technical

- Next.js App Router patterns
- TypeScript strict mode
- Vitest for testing
- Storybook for component development

---

## Content Inventory

### Services (Above the Fold)
- Web Design
- UI/UX Design
- Frontend Development

### Portfolio
- 4 existing projects (from Sanity CMS)
- Room for additional case studies

### Pages
- Home
- About
- Work (index + project detail)
- Contact
- Blog (listing + article)

---

## Success Metrics

- [ ] Visual design matches studio aesthetic (subjective review)
- [ ] All pages redesigned and functional
- [ ] 4 themes working correctly
- [ ] Animation system smooth (60fps)
- [ ] WCAG AA compliance
- [ ] Lighthouse performance ≥80
- [ ] i18n coverage 100%
- [ ] All existing functionality preserved

---

*Last updated: 2026-01-14 after initialization*
