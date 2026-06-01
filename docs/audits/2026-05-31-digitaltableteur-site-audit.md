# Digitaltableteur Site Audit

Date: 2026-05-31

Scope: full local repository audit of the Next.js site, representative runtime pages, SEO/AEO surfaces, conversion paths, portfolio/blog content, recruiter/candidate paths, security/privacy posture, and build/test health.

Primary goal: attract more clients, recruiters, and employee candidates while increasing visibility, trust, lead quality, and profit.

## Executive Verdict

Digitaltableteur has unusually strong ingredients: a clear design-system niche, visible pricing, a polished design language, strong agent/LLM discovery endpoints, real case-study breadth, and a credible author/founder voice. The main growth problem is not lack of quality. It is that the site still makes high-intent visitors work too hard to answer three buying questions:

1. What exactly should I buy first?
2. Why should I trust this team for my context?
3. What is the next step that preserves momentum?

The biggest blockers are more technical than strategic right now:

- Production build currently fails on `/api/download-cv`.
- The default `npm test` suite is broken before tests execute.
- Programmatic SEO pages render duplicate section bodies and are mostly generic generated copy.
- Analytics and tracking scripts load before the cookie consent layer can gate them.
- The homepage headline changes after hydration, weakening stable positioning and SEO clarity.

Fix those first. Then turn the existing credibility into revenue by making each commercial path more specific: package-specific booking CTAs, proof tied to each package, recruiter/candidate pages, stronger case-study metrics, and Search Console backed content expansion around design systems, AI-ready DesignOps, and agent-ready component libraries.

## Evidence Gathered

Commands and checks:

- `npm run typecheck`: passed.
- `npm run lint`: passed with warnings.
- `npm test -- --runInBand`: invalid Vitest flag for this project.
- `npm test`: failed before executing tests due Storybook browser setup importing Node-only `fs` into the browser project.
- `npm run test:ci`: passed, 204 files and 1747 tests.
- `npm run build`: failed while collecting page data for `/api/download-cv`.
- Local dev runtime checks on `/`, `/pricing`, `/contact?mode=book`, `/pseo/design-system-audit-react-startups`, `/robots.txt`, `/llms.txt`, and sitemap/metadata surfaces.
- Browser snapshots on desktop and mobile for the homepage and mobile contact booking path.
- Repository content inspection for blog, portfolio, PSEO catalog, structured data, sitemap, analytics, contact form, CV download, and layout/navigation.
- Cross-check against Google Search Central and web.dev guidance listed in "Sources".

Local screenshots captured:

- `/tmp/digitaltableteur-home-desktop.png`
- `/tmp/digitaltableteur-home-mobile.png`
- `/tmp/digitaltableteur-contact-book-mobile.png`

## P0: Must Fix Before Growth Work

### 1. Production Build Fails

`npm run build` compiled, then failed during page data collection:

```text
PageNotFoundError: Cannot find module for page: /api/download-cv
Build error occurred
Failed to collect page data for /api/download-cv
```

Relevant file:

- `app/api/download-cv/route.ts:69`

Why it matters:

- A site that cannot produce a production build is the highest revenue risk. It blocks deployment confidence, SEO validation, bundle analysis, and proper performance measurement.
- The CV route is also part of the recruiter path, so the failure intersects with a growth audience.

Recommended fix:

- Isolate why Next treats `/api/download-cv` as a missing module during page-data collection.
- Add a focused route test for successful auth, failed auth, missing `CV_PASSWORD`, missing file, CORS OPTIONS, and cache headers.
- Re-run `npm run build` and only then run production Lighthouse/PageSpeed/bundle analysis.

### 2. Default Test Command Is Broken

`npm test` fails before executing tests. Storybook browser tests import `.storybook/vitest.setup.ts`, which imports `.storybook/lib/resolve-figma-from-contract.ts`, which imports Node `fs`; browser Vitest then errors because `node:fs` is externalized for browser compatibility.

Observed warnings also include:

- Storybook 10.3 automatically applies `setProjectAnnotations`, but setup still contains it.
- Storybook `test.include` is ignored in favor of `stories`.
- Mixed `vitest@4.1.7` and `@vitest/browser@4.0.18` are unsupported.
- PostCSS warning: `@import "tw-animate-css"` appears after `@plugin "@tailwindcss/typography"`.

Why it matters:

- `npm run test:ci` passes, but the default test command is the command most agents and humans will try first.
- Broken default tests slow down every future improvement pass and make automated QA less trustworthy.

Recommended fix:

- Split browser-safe Storybook setup from Node-only Figma contract resolution.
- Align Vitest and `@vitest/browser` versions.
- Update Storybook 10 config to remove deprecated/manual setup.
- Fix Tailwind/PostCSS import order.

### 3. Build-Time Type And Lint Checks Are Disabled

`next.config.ts:153` says build validation is disabled because of older type conflicts:

- `next.config.ts:157` has `eslint.ignoreDuringBuilds: true`.
- `next.config.ts:160` has `typescript.ignoreBuildErrors: true`.

Current `npm run typecheck` passes, which means the comment is likely stale.

Why it matters:

- Silent production builds with ignored lint/type errors are acceptable only as a temporary migration escape hatch.
- The site is now in a phase where commercial confidence matters more than keeping an old workaround.

Recommended fix:

- Re-enable TypeScript and ESLint checks in build once the `/api/download-cv` build failure is resolved.
- If any build-only type errors appear, fix them directly and delete the stale TODO.

## P1: Revenue And Conversion

### 4. The Homepage Proposition Is Too Volatile

The homepage hero selects headline and subtext variants from session storage after hydration:

- `nextjs-app/shared/patterns/HomeHero/HomeHero.tsx:73`
- `nextjs-app/shared/patterns/HomeHero/HomeHero.tsx:87`
- `nextjs-app/shared/patterns/HomeHero/HomeHero.tsx:129`

Observed:

- SSR HTML contained a different H1 than the browser-rendered page.
- Browser-rendered H1: "World-class design. Startup speed."

Why it matters:

- The first viewport is polished, but the core business promise is not stable.
- Search engines, AI summarizers, social previews, returning users, and screenshots may see different propositions.
- For high-value B2B leads, clarity beats novelty.

Recommended fix:

- Use one stable H1 that states the literal offer and buyer outcome.
- Move variant testing into controlled experiments with analytics event tracking, not random session selection.
- Strong candidate: "AI-ready design systems for teams shipping faster."
- Make the subtext name the buyer and result: "We audit, design, and implement component systems that help product teams ship consistent interfaces without slowing engineering."

### 5. Pricing Exists, But Package CTAs Are Not Specific Enough

The pricing page is a major strength. It already has visible package ranges:

- UX Sprint: EUR 8-14k.
- AI-Ready DesignOps: EUR 11-17k.
- Design System Lift-Off: EUR 14-20k.

Relevant file:

- `nextjs-app/shared/patterns/PricingPageContent/PricingPageContent.tsx:60`
- The only primary CTA is `/contact?mode=book` at `PricingPageContent.tsx:301`.

Gap:

- Package cards do not have their own CTAs.
- Package clicks do not pass package context into contact or booking.
- Proof is not tied to the package a buyer is considering.

Recommended fix:

- Add package-specific CTAs:
  - `/contact?mode=book&package=ux-sprint`
  - `/contact?mode=book&package=ai-ready-designops`
  - `/contact?mode=book&package=design-system-lift-off`
- Preselect/expand matching form fields from `package`.
- Add one proof module under each package: case study, outcome, artifact preview, or before/after.
- Add "best for" and "not for" copy so qualified buyers self-select faster.

### 6. Booking Can Fall Back To "Not Live"

The contact booking path has a configured path and a fallback:

- `nextjs-app/shared/patterns/ContactInquiryPanel/ContactInquiryPanel.tsx:107`
- Fallback copy at `ContactInquiryPanel.tsx:110`

Local runtime showed Cal.com is configured, which is good. But if env config is absent in production, the main pricing CTA can land a buyer on "Online scheduling is not live yet."

Recommended fix:

- Add a smoke test or deploy check that fails when pricing CTAs are live but booking env is missing.
- If booking is missing, automatically redirect to the message form with package context and a high-intent subject.

### 7. Contact Form Captures Leads, But Does Not Close The Loop

The form posts to `/api/contact` and collects useful optional context:

- `nextjs-app/shared/components/ContactFormEditorial/ContactFormEditorial.tsx:347`

Server behavior:

- Sends Resend email first.
- Inserts MongoDB record second.
- If Mongo fails after email sends, the client receives a 500 and may retry, creating duplicate emails.

Relevant file:

- `app/api/contact/route.ts:181`

Recommended fix:

- Persist lead first with a status, then send email, then mark sent.
- Or return success when email succeeds and DB logging fails, while logging the DB failure separately.
- Add conversion events for:
  - contact form viewed
  - optional details expanded
  - package selected
  - form submitted
  - booking clicked
  - booking opened externally

## P1: SEO, AEO, And AI Search Visibility

### 8. Programmatic SEO Is Currently The Biggest Search Risk

The PSEO system generates 100 leaf pages from 4 services, 5 stacks, and 5 audiences:

- `lib/pseo/catalog.ts:33`

But custom PSEO copy is empty:

- `content/pseo/copy.json:1`

And each section body is rendered twice:

- `nextjs-app/shared/components/pages/Pseo/PseoLeafPage.tsx:153`
- duplicate `MarkdownMessage` at `PseoLeafPage.tsx:158` and `PseoLeafPage.tsx:163`

Additional issue:

- `titleCase()` at `lib/pseo/catalog.ts:13` turns names like "Next.js" into "Next.Js".

Why it matters:

- Google guidance warns that scaled generated pages without added value may violate scaled-content spam policies.
- Duplicated content wastes crawl budget and weakens perceived quality.
- AI search features still depend on indexable, helpful, textual content. Thin templated pages are less likely to be cited or trusted.

Recommended fix:

- Remove the duplicate body render immediately.
- Either noindex PSEO leaf pages until unique copy exists, or reduce the set to a small number of genuinely useful pages.
- For each retained page, add:
  - unique buyer problem
  - concrete deliverables
  - proof/example
  - pricing or engagement model
  - FAQ visible on page if structured
  - internal links to relevant case studies and pricing package
- Replace naive title casing with explicit display names.

### 9. FAQ Structured Data Is Low ROI And Potentially Stale

The homepage emits JSON-LD FAQ-like structured data that is not visible as matching FAQ content in the first viewport/content inspection.

Google now states FAQ rich results no longer appear in Search as of May 7, 2026 and support is being removed from tools. It also requires FAQ content to be visible on the source page for eligibility.

Recommended fix:

- Remove FAQPage JSON-LD unless the matching FAQ is visibly present and strategically useful.
- Prefer Organization, WebSite, BreadcrumbList, Article, Person, Service, and Product/Offer-like schema only where each maps to visible page content.
- Validate high-value pages with Rich Results Test and URL Inspection after deploy.

### 10. Sitemap Uses "Today" For Too Many Stable URLs

`app/sitemap.ts:13` sets `today = new Date()` and applies it to static, work, author, PSEO, and pillar routes.

Why it matters:

- Artificially changing `lastModified` can make the site look noisier to crawlers.
- It hides which pages actually changed.

Recommended fix:

- Use real modified dates from content metadata, project metadata, or a checked-in route manifest.
- For stable pages, set a fixed last meaningful update date.
- For generated PSEO pages, tie `lastModified` to the source catalog/copy version.

### 11. Blog Metadata Is Incomplete

Observed from `app/blog/postMetadata.ts`:

- Visible posts include strong topics, and scheduled June 2026 posts show an agentic design systems editorial plan.
- Several visible older posts lack `mainImageUrl`.
- All visible inspected posts lacked explicit `seoTitle` and `seoDescription`.

Relevant fields:

- `app/blog/postMetadata.ts:17`
- `app/blog/postMetadata.ts:22`

Recommended fix:

- Add SEO titles/descriptions for every visible post.
- Add OG images for every post, especially the older posts that still rank or get shared.
- Build topic clusters:
  - agent-ready design systems
  - design-system audits
  - AI DesignOps
  - component contracts
  - Figma to code governance
  - Storybook adoption
- Each post should link to a relevant package and one case study.

### 12. LLM Discovery Is Strong, But Do Not Treat It As A Ranking Shortcut

The site has `llms.txt`, `llms-full.txt`, `.well-known` endpoints, and crawler-specific robots handling. This is ahead of many competitors.

But Google's current AI Search guidance says no special machine-readable AI text files or special schema are required to appear in AI features. The fundamentals still matter: crawlability, internal links, page experience, textual content, high-quality media, and structured data matching visible content.

Recommended fix:

- Keep LLM files because they help agents and non-Google tools.
- Use them as a content distribution surface, not a replacement for strong public pages.
- Add examples, pricing, case studies, and proof to agent-readable summaries so AI tools can answer "why Digitaltableteur?" with specifics.

## P1: Portfolio And Proof

### 13. Case Studies Need Business Outcomes

The portfolio breadth is good: 12 projects, 7 featured. The gap is measurable outcomes.

Observed:

- Project data has no `metrics` field usage for the inspected projects.
- Several projects lack `liveUrl`.
- Work index ends after the grid with no next conversion step.

Relevant files:

- `nextjs-app/shared/data/projects.ts`
- `nextjs-app/shared/components/pages/Work/WorkIndex/WorkIndexPage.tsx:67`

Recommended fix:

- Add a metrics model to project data:
  - adoption
  - delivery speed
  - accessibility score
  - component count
  - Storybook/test coverage
  - design debt reduced
  - team size supported
  - time saved
- Add a bottom CTA to the work index:
  - "Want this level of system clarity in your product?"
  - CTAs: "Book a design-system audit" and "See pricing"
- Add case-study-specific CTAs:
  - Client path: "Audit our system"
  - Recruiter path: "Request CV"
  - Candidate/collaborator path: "Work with us"

### 14. Some High-Value Work Pages Lack Route-Specific OG Assets

Several work pages do not appear to have route-specific `opengraph-image.tsx` equivalents:

- `dsharp-design-system`
- `rhythmguard`
- `project-spine`
- `llm-component-schema`

Why it matters:

- Portfolio links are shared in recruiter/client contexts.
- Missing strong OG images wastes a trust moment in Slack, LinkedIn, email, and AI citation previews.

Recommended fix:

- Generate route-specific OG images for every featured case study.
- Include the client/product name, role, and one measurable outcome.

### 15. Project Spine Page Uses Legacy Next Image Props

Runtime dev server reported legacy `layout` prop warnings for Project Spine images:

- `nextjs-app/shared/components/pages/Work/ProjectSpine/ProjectSpinePage.tsx:152`
- `ProjectSpinePage.tsx:177`
- `ProjectSpinePage.tsx:202`

Recommended fix:

- Replace legacy `layout` prop with modern Next Image sizing.
- Run the codemod or update manually.

## P1: Recruiters And Candidates

### 16. Recruiter Path Exists, But It Is Too Hidden

The site has About and secure CV download components, but the main navigation does not explicitly serve recruiter intent. The CV component posts to an external proxy:

- `nextjs-app/shared/components/SecureCVDownload/SecureCVDownload.tsx:55`
- `nextjs-app/shared/components/SecureCVDownload/SecureCVDownload.tsx:105`

Why it matters:

- Recruiters and hiring managers need fast answers: role fit, CV, availability, location/time zone, work authorization, seniority, and proof.
- An external `digitaltableteursecureproxy.vercel.app` endpoint may lower trust compared with the main domain.

Recommended fix:

- Fix and use the local `/api/download-cv` route or put the proxy behind the main domain.
- Add a recruiter-focused page or section:
  - "Senior design systems, product design, and frontend leadership"
  - CV request
  - short role matrix
  - availability
  - location/time zone
  - selected proof
  - LinkedIn/GitHub links
- Add structured Person/ProfilePage data where it maps to visible content.

### 17. Candidate/Collaborator Path Is Underdeveloped

If the goal includes employee candidates, the site needs an explicit reason to join or collaborate.

Recommended fix:

- Add a "Work with Digitaltableteur" page or section.
- Include:
  - operating principles
  - current/future roles
  - collaboration model
  - expectations
  - benefits of working on design systems, AI tooling, and product craft
  - candidate contact CTA
- Link it from About and footer. Only add top-nav placement if hiring is an active priority.

## P2: UX, Accessibility, And Trust

### 18. Duplicate Skip Links

There are two skip links:

- `app/layout.tsx:151`
- `nextjs-app/shared/components/NextLayout/NextLayout.tsx:33`

Browser accessibility snapshot confirmed two "Skip to main content" links.

Recommended fix:

- Keep one skip link in the layout system, not both root layout and `NextLayout`.

### 19. Mobile Contact Booking Starts With Contact Copy, Not Booking Context

The mobile contact booking screenshot shows the "Let's talk." intro and bottom tab navigation, but the booking context is not immediately visible in the screenshot.

Recommended fix:

- When `?mode=book`, make the booking tab and booking content visually primary above the fold.
- Keep the message tab available, but do not force booking visitors to infer where the booking UI is.

### 20. Chat Widget Competes With Primary CTAs

The chat bubble is visually strong and appears on the homepage and mobile contact path.

Potential issue:

- It can help conversion if it answers buying questions.
- It can also distract from booking/contact CTAs if not measured.

Recommended fix:

- Track chat opens and assisted conversions.
- If chat does not assist leads, suppress it on high-intent checkout-style pages like pricing/contact or make it less visually dominant.

## P2: Privacy, Consent, And Security

### 21. Analytics Load Before Consent

Tracking scripts are rendered before the cookie consent provider:

- GTM at `app/layout.tsx:123`
- Ahrefs at `app/layout.tsx:132`
- gtag at `app/layout.tsx:137`
- Vercel Analytics at `app/layout.tsx:181`
- Cookie consent provider starts at `app/layout.tsx:190`

Why it matters:

- This is a trust and compliance issue, especially for EU visitors.
- It also weakens the credibility of analytics consent claims.

Recommended fix:

- Default analytics consent to denied before loading tracking.
- Load analytics only after consent or use consent mode where appropriate.
- Keep essential operational telemetry separate from marketing analytics.

### 22. CV Download Response Should Be Explicitly Non-Cacheable

The CV route returns PDF headers but no explicit private/no-store cache header:

- `app/api/download-cv/route.ts:171`

Recommended fix:

- Add `Cache-Control: private, no-store, max-age=0`.
- Consider `X-Robots-Tag: noindex, noarchive`.
- Remove the duplicated `CV_PASSWORD` configuration check at `app/api/download-cv/route.ts:90` and `app/api/download-cv/route.ts:124`.

### 23. CSP Still Allows Unsafe Inline

Production CSP allows `unsafe-inline` for scripts/styles in `next.config.ts` security headers.

Recommended fix:

- Keep as-is only if required by current Next/analytics setup.
- Long term, move toward nonce/hashes for scripts and reduce inline style reliance.
- Align `X-Frame-Options: SAMEORIGIN` with `frame-ancestors 'none'` to avoid mixed intent.

## P2: Performance

### 24. Bundle And Runtime Need Production Measurement After Build Is Fixed

Dev cold routes were slow:

- `/`: 200 after compile, about 122 KB HTML.
- `/pricing`: 200 after compile, about 91 KB HTML.
- `/contact?mode=book`: 200 after compile, about 102 KB HTML.
- `/pseo/design-system-audit-react-startups`: 200 after compile, about 379 KB HTML.

These are not production metrics, but they point to areas to measure:

- animation libraries
- chat widget
- analytics tags
- PSEO Markdown/render payload
- homepage hero animation
- cookie/chat overlays

Recommended fix:

- Fix build first.
- Run production `next build` with bundle analyzer.
- Run PageSpeed/Lighthouse on production or a local production server.
- Track Core Web Vitals using field data, especially LCP, INP, and CLS at the 75th percentile.

## Growth Opportunities

### A. Make The Offer Ladder Explicit

Current packages are close to useful. Turn them into a clear ladder:

1. Audit: lower-friction entry offer, fixed price, fast turnaround.
2. Sprint: prototype/eval/handoff.
3. Lift-Off: design-system implementation.
4. Retainer: governance, components, and agent-ready operations.

Each offer should have:

- price range or starting price
- duration
- deliverables
- best fit
- not a fit
- sample output
- proof
- package-specific booking CTA

### B. Create Three Landing Pages For Three Audiences

Clients:

- `/services/design-system-audit`
- `/services/ai-ready-designops`
- `/services/design-system-lift-off`

Recruiters:

- `/hire-petri-lahdelma` or `/cv`
- CV, role fit, availability, proof, and contact.

Candidates/collaborators:

- `/work-with-us`
- collaboration model, values, open opportunities, and contact.

### C. Turn Case Studies Into Sales Assets

For each priority service, create a proof chain:

- Service page
- Pricing package
- Case study
- Blog article
- Contact/booking CTA

Example:

- "Design System Lift-Off" package links to Helsinki Design System, SAP Build Apps, D# Design System, and a blog post about component contracts.

### D. Build Search Demand Around Specific Problems

The strongest content topics are not generic "design systems". They are high-intent problems:

- "design system audit"
- "Storybook design system audit"
- "AI-ready design system"
- "Figma to Storybook governance"
- "component contract examples"
- "design system adoption playbook"
- "design tokens governance"
- "frontend design system consultant"

Each topic should answer:

- symptoms
- cost of inaction
- diagnostic checklist
- example output
- pricing/engagement model
- case-study proof
- CTA

### E. Add A Trust Strip Near Every CTA

Use concrete proof near CTAs:

- selected clients/products
- years of experience
- shipped systems
- components/tokens/tests count where accurate
- accessibility or performance outcomes
- testimonials with attribution
- logos only where permission exists

Avoid anonymous testimonials on pricing unless attribution is impossible and the copy clearly labels it as representative feedback.

### F. Build A Measurement Plan

Required events:

- `view_home_hero`
- `click_primary_cta`
- `view_pricing`
- `select_package`
- `click_book_call`
- `open_cal`
- `submit_contact`
- `contact_success`
- `download_cv_attempt`
- `download_cv_success`
- `open_chat`
- `chat_lead`

Required dimensions:

- package
- source page
- language
- audience intent
- CTA label
- form mode
- consent state

## 30/60/90 Day Plan

### First 7 Days

- Fix production build for `/api/download-cv`.
- Fix default `npm test`.
- Re-enable build type/lint checks.
- Remove duplicate PSEO body rendering.
- Remove or noindex thin PSEO leaf pages until unique content exists.
- Add consent-gated analytics loading.
- Add one stable homepage H1.
- Add package query params from pricing to contact/booking.

### Days 8-30

- Add package-specific proof modules and CTAs.
- Add portfolio metrics fields and update top 5 case studies.
- Add recruiter/CV page or improve About with recruiter-specific path.
- Add missing blog SEO metadata and OG images.
- Fix sitemap `lastModified` values.
- Add conversion tracking events.
- Run production PageSpeed, Search Console URL inspection, and Rich Results validation.

### Days 31-60

- Publish three high-intent service pages.
- Publish 4-6 problem-led articles tied to service pages.
- Add route-specific OG images for featured case studies.
- Add bottom CTA to Work index and case-study pages.
- Add candidate/collaborator page if hiring/collaboration is active.
- Build a lead dashboard: source, package, CTA, conversion rate, close rate.

### Days 61-90

- Expand only the PSEO pages that show impressions or clear demand.
- Turn successful posts into lead magnets or diagnostic checklists.
- Add email follow-up for contact/booking leads.
- Test homepage proposition variants with tracked experiments.
- Build public proof assets: audits, teardown posts, component contract examples, short video walkthroughs.

## Priority Stack Rank

1. Fix build failure.
2. Fix default tests.
3. Stop shipping build with ignored type/lint checks.
4. Repair/noindex PSEO leaf pages.
5. Consent-gate analytics.
6. Stabilize homepage proposition.
7. Add package-specific CTAs and lead context.
8. Add proof and metrics to pricing and portfolio.
9. Build recruiter/CV path on main domain.
10. Add measurement and Search Console feedback loops.

## Sources

- Google Search Central, AI features and your website: https://developers.google.com/search/docs/appearance/ai-features
- Google Search Central, using generative AI content on your website: https://developers.google.com/search/docs/fundamentals/using-gen-ai-content
- Google Search Central, SEO Starter Guide: https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- Google Search Central, General structured data guidelines: https://developers.google.com/search/docs/appearance/structured-data/sd-policies
- Google Search Central, FAQ structured data: https://developers.google.com/search/docs/appearance/structured-data/faqpage
- web.dev, Web Vitals: https://web.dev/articles/vitals
- web.dev, Core Web Vitals thresholds: https://web.dev/articles/defining-core-web-vitals-thresholds
