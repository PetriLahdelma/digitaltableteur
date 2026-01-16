# Digitaltableteur Redesign — Roadmap

> **Milestone**: v2.0 Full Site Redesign
> **Status**: In Progress
> **Created**: 2026-01-14

---

## Overview

Transform Digitaltableteur from a portfolio site into a world-class studio presence with bold typography, kinetic animations, and a cohesive design system. This roadmap covers the complete frontend redesign while preserving existing functionality.

**Vision**: Studio aesthetic inspired by It's Nice That and Primary.studio — bold typography, generous whitespace, structured grids, distinctive palettes, subtle textures, and purposeful animation.

---

## Phases

### Phase 01: Foundation & Tailwind Setup
**Goal**: Establish Tailwind CSS infrastructure alongside existing CSS Modules for gradual migration.

**Scope**:
- Install and configure Tailwind CSS 4.x
- Set up Tailwind design tokens matching existing CSS variables
- Create theme configuration for 4 themes (light, dark, HC white, HC black)
- Configure PostCSS pipeline for hybrid CSS Modules + Tailwind
- Update build configuration

**Research Required**: Tailwind 4.x migration patterns, CSS Modules coexistence

---

### Phase 02: Typography & Font System
**Goal**: Implement new font pairing and typography scale.

**Scope**:
- Research and select new font pairing (replace TiemposHeadline + Moderat)
- Create typography scale in Tailwind config
- Build type primitives (Heading, Text, Display components)
- Implement responsive typography
- Test across all themes

**Research Required**: Font pairing options, variable font optimization

---

### Phase 03: Animation Infrastructure
**Goal**: Set up professional animation toolkit for kinetic experience.

**Scope**:
- Install and configure GSAP (ScrollTrigger, SplitText)
- Install and configure Lenis for smooth scroll
- Create animation primitives (fade, slide, scale)
- Build scroll-driven animation hooks
- Set up animation context/provider
- Integrate Three.js for 3D elements (optional, can defer)

**Research Required**: GSAP licensing for commercial use, Lenis + Next.js patterns

---

### Phase 04: Layout System
**Goal**: Build responsive grid and layout primitives.

**Scope**:
- Create grid system with Tailwind (12-column, asymmetric options)
- Build Container component with breakpoint variants
- Create Section component for page structure
- Build spacing utilities
- Implement responsive patterns

**Research Required**: None

---

### Phase 05: Core UI Components
**Goal**: Rebuild essential UI components with Tailwind and new design language.

**Scope**:
- Button (variants: primary, secondary, ghost, outline)
- Card (variants: default, elevated, bordered)
- Icon (SVG system, size variants)
- Link (inline, standalone)
- Badge / Tag
- Input, Textarea, Select (form primitives)
- Divider, Spacer

**Research Required**: None

---

### Phase 06: Interactive Components
**Goal**: Build complex interactive components with animation.

**Scope**:
- Modal / Dialog
- Accordion
- Tabs
- Tooltip
- Navigation (Header, Mobile Menu, Footer)
- Image Gallery / Lightbox
- Toast notifications (update existing)

**Research Required**: None

---

### Phase 07: Homepage Redesign
**Goal**: Redesign homepage with Hero → Services → Work → Contact flow.

**Scope**:
- Hero section (kinetic typography, scroll CTA)
- Services section (Design & Development above the fold)
- Work preview (portfolio highlights with hover effects)
- Contact CTA section
- Scroll-driven animations throughout
- Mobile responsive design

**Research Required**: None

---

### Phase 08: Portfolio & Projects
**Goal**: Redesign work listing and project detail pages.

**Scope**:
- Work index page (grid layout, filters)
- Project detail template (case study format)
- Project gallery component
- Next/Previous project navigation
- Related projects section
- Sanity CMS integration (restyle, preserve schema)

**Research Required**: None

---

### Phase 09: About & Contact Pages
**Goal**: Redesign About and Contact pages.

**Scope**:
- About page (studio story, team, values)
- Contact page (form, location, social links)
- Update contact form with new design
- Integrate maps or location visual (if desired)
- Thank you / confirmation states

**Research Required**: None

---

### Phase 10: Blog Redesign
**Goal**: Redesign blog listing and article pages.

**Scope**:
- Blog index (article grid, categories, pagination)
- Article template (rich text, images, code blocks)
- Author component
- Share functionality
- Related posts
- Sanity CMS integration (restyle, preserve schema)

**Research Required**: None

---

### Phase 11: Theme & Accessibility Polish
**Goal**: Ensure all 4 themes work correctly and meet WCAG standards.

**Scope**:
- Verify all components in 4 themes
- Run axe-core accessibility tests
- Test keyboard navigation throughout
- Ensure proper focus states
- Fix any color contrast issues
- Screen reader testing

**Research Required**: None

---

### Phase 12: Performance & Launch Prep
**Goal**: Optimize performance and prepare for launch.

**Scope**:
- Lighthouse performance audit (target: ≥80)
- Bundle size optimization
- Image optimization
- Font loading optimization
- i18n coverage verification (EN/FI/SV)
- Visual regression test baseline
- Deploy to staging for final QA

**Research Required**: None

---

## Phase Dependencies

```
01 Foundation ─────┐
                   ├─→ 04 Layout ─────┐
02 Typography ─────┤                  │
                   │                  ├─→ 07 Homepage ─→ 08 Portfolio ─→ 09 About/Contact
03 Animation ──────┘                  │                                         │
                                      │                                         ↓
                   05 Core UI ────────┼─────────────────────────────────→ 10 Blog
                                      │
                   06 Interactive ────┘

                   11 Theme/A11y ──────────────────────────────────────→ 12 Launch
```

---

## Success Criteria

From PROJECT.md:

- [ ] Visual design matches studio aesthetic (subjective review)
- [ ] All pages redesigned and functional
- [ ] 4 themes working correctly
- [ ] Animation system smooth (60fps)
- [ ] WCAG AA compliance
- [ ] Lighthouse performance ≥80
- [ ] i18n coverage 100%
- [ ] All existing functionality preserved

---

## Notes

- **AI Chat Widget**: Preserve current implementation (out of scope)
- **CMS Schema**: No changes to Sanity schemas — restyle only
- **Backend**: No new backend functionality — frontend redesign only
- **Migration Strategy**: Hybrid CSS Modules + Tailwind during transition

---

*Last updated: 2026-01-14*
