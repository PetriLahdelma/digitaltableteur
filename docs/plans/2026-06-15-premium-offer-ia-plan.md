# Premium Offer IA Plan

Date: 2026-06-15

Scope: Digitaltableteur public site, with focus on About, Pricing, Work, legal/proof pages and the rejected "How we work" / "Trust" direction.

## Current Site Read

The site is strongest when it is direct, sparse and proof-led. Home moves from a large editorial hero into selected work, client logos, services, productized sprint copy, a design-system proof asset and a CTA. Pricing is commercially clear: visible ranges, direct comparison against traditional agencies and package cards. About is strongest in the "What we bring" and "How we deliver at scale" sections, where the copy is concrete enough to explain senior-led delivery, networked capacity, governance, continuity and IP ownership.

The weak pattern is generic capability explanation. The previous standalone "How we work" and "Trust" pages failed because they used a separate corporate page grammar, made unsupported claims and duplicated the existing site instead of sharpening it. The better path is to strengthen the pages that already carry buyer intent.

## Tone Rules

- Use short declarative headings: "Strategy to scale", "Selected projects", "Transparent pricetags."
- Prefer proof language over promise language: audit, tokens, Storybook, handoff, governance, release habits.
- Keep the one-person/senior-led studio posture. Do not fake a large agency operating model.
- Avoid generic transformation language, broad "end-to-end" claims and procurement claims without a source artifact.
- Keep public selling pages sharp. Put long legal and compliance detail in legal/proof pages.
- Do not add top-level navigation items until the page has real evidence, real artifacts and a visual concept equal to the rest of the site.

## Better IA

### 1. About becomes the operating-model page

Do not create `/how-we-work` yet. The current About page already carries "Our approach" and can absorb a concise method section without adding navigation weight.

Ship a compact "Strategy to scale" section after "How we deliver at scale":

- Diagnose: audit the product, system and delivery model.
- Shape: turn opportunity into buyer context, flows, principles, scope and proof points.
- Build: design and implement the working surface.
- Scale: leave governance, release habits and backlog logic behind.

This keeps the method near the values, stats and delivery model, which is where a buyer already expects to learn how the studio works.

### 2. Pricing carries the commercial offer

Do not add a generic services page. Pricing already does the hard commercial work. Add new strategic offers there only when the package copy is specific enough to buy:

- Product Discovery Sprint
- Design System Maturity Audit
- AI Opportunity Mapping
- Service Innovation Sprint

Each offer needs price range, duration, best-for, not-for and a proof link. If one of those is missing, keep it in planning until the proof exists.

### 3. Work carries evidence

Case studies should become the main trust mechanism. Rewrite priority cases to answer:

- Problem
- Buyer context
- Role
- Timeline
- Team
- Deliverables
- Constraints
- Outcome

Start with SAP Build Apps, Helsinki Design System, DSharp Design System, LLM Component Schema and Project Spine because the site already has stronger proof surfaces for those.

### 4. Trust starts as proof aggregation, not a new page

Do not create `/trust` until the underlying artifacts exist. The site already has factual trust-adjacent surfaces:

- `/privacy-policy`
- `/ai-use`
- `/accessibility`
- `/imprint`
- `/colophon`

The near-term move is a small "For procurement" proof strip in the footer or contact flow that links to those pages and names what is available on request. Only claim DPA, insurance, subprocessors or security posture when the document exists and is reviewed.

## Visual Direction

Use the existing grammar:

- oversized type and restrained copy
- high-contrast light/dark bands
- 2-column cards on desktop, 1-column on mobile
- numerals or sober icons, not decorative illustrations
- real case-study and system artifacts as visual proof
- no corporate trust-center grid unless it has real documents behind it

The first implementation should reuse existing `ValuesSection`, `PricingPageContent`, Work case-study components and footer/legal link surfaces. New components are not justified yet.

## External Benchmark Read

The useful pattern from higher-maturity studios is not their exact page structure. It is how they connect strategy, design, technology, proof and operating maturity.

- Manyone positions around strategy, design and technology, with services and featured offerings: https://manyone.com/services/
- Bakken & Baeck presents itself as a design and technology studio building digital products from zero to launch: https://bakkenbaeck.com/
- Futurice frames services from vision and strategy through design, implementation and continuous improvement: https://www.futurice.com/services
- Nitor uses a Think / Build / Run service model and keeps the promise pragmatic: https://nitor.com/en/services
- Vercel's trust center is a document access and security/compliance hub, not a marketing page: https://security.vercel.com/
- Contrast's subprocessor page shows why trust content needs current vendor lists, locations and update mechanics: https://www.contrastsecurity.com/sub-processors-list

Digitaltableteur should borrow the operating-model discipline, not pretend to have enterprise compliance assets before they exist.

## Implementation Sequence

### Now

- Replace the generic About "Design / Development / Collaboration" blocks with a compact operating-model section.
- Keep `/how-we-work` and `/trust` absent from nav, sitemap and discovery until the content earns those routes.
- Keep package and case-study copy tied to existing proof.

### Next

- Add a Pricing subsection for strategic starts only after every offer has price, duration, best-for, not-for and proof.
- Rewrite 3 to 5 priority case studies with the evidence template.
- Add a contact/footer proof strip linking privacy, AI use, accessibility, imprint and colophon.

### Later

- Promote a Trust page only when there is a real trust pack: data handling summary, subprocessors, DPA terms, AI-use policy, accessibility methodology, legal entity details and insurance note if confirmed.
- Publish a design-system maturity model when it can link to real audit method, score bands and example outputs.
- Package retainers only after the operational promise is measurable: Design System Care, UX Intelligence Retainer and AI DesignOps Stewardship.

## Acceptance Criteria

- Every public claim maps to an existing page, case study, document or artifact.
- No new top-level nav item without a distinct buyer job and source material.
- New UI uses the existing section grammar and localization flow.
- English copy avoids Oxford-comma patterns where the current site has explicitly removed them.
- `npm run validate:translations`, `npm run typecheck` and a browser check of affected pages pass before shipping.
