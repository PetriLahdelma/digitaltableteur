# Phase 09-2: Contact Page Redesign

> **Phase**: 09 (About & Contact Pages)
> **Plan**: 2 of 2
> **Tasks**: 10

---

## Objective

Redesign the Contact page using the new design system patterns. Preserve all existing functionality (form validation, API contract, Leaflet map, CV download) while applying Tailwind-first styling, animation patterns, and improved visual hierarchy.

---

## Context

### Current State
- ContactPage at `nextjs-app/shared/components/pages/ContactPage/`
- Uses: PageLayout, Title, Text, PersonCard, ContactForm, SecureCVDownload
- Sections: Hero, Office/Map, PersonCard, Contact Form, CV Download
- ContactForm has complex logic (honeypot, file upload, useReducer, validation)
- Leaflet map with cleanup logic for React StrictMode + Fast Refresh
- 40+ i18n keys already defined across EN/FI/SV

### Critical Functionality to Preserve

**ContactForm (MUST preserve exactly):**
- useReducer pattern with UPDATE_FIELD and RESET actions
- Email regex: `/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/`
- Honeypot spam protection (hidden field)
- File upload: 2MB upload limit, 2KB email attachment limit
- API contract: POST /api/contact with exact Zod schema
- Fields: fullName, email, phone, interest (checkboxes), message, hearAbout, attachment
- Toast success + Modal error handling

**Leaflet Map (MUST preserve cleanup logic):**
- Dynamic import with `ssr: false`
- React StrictMode-compatible cleanup
- Fast Refresh handling
- Helsinki coordinates: `[60.1810882006689, 24.952352100000002]`
- Custom marker with `/dt-blue.svg`

**SecureCVDownload:**
- Modal with password input
- API validation via secure proxy
- Debounced validation (500ms)
- Download as PDF blob

### Available Patterns (from prior phases)
- `AboutHero` / `HeroSection` - animated hero patterns
- `ContentSection` - subtitle, title, content layout
- `Section` / `Container` - layout primitives
- `FadeIn` - animation component
- `CTASection` - call-to-action pattern
- Form components: `TextInput`, `TextArea`, `FormField`, `FormGroup`
- Interactive: `Dialog`, `Toaster`

### Dependencies
- Phase 05: TextInput, TextArea, FormField, FormGroup
- Phase 06: Dialog, Toaster, Tabs
- Phase 07: CTASection pattern
- Phase 09-1: AboutHero, ValuesSection patterns

---

## Tasks

### Task 1: Create ContactHero pattern
**Files**: `patterns/ContactHero/ContactHero.tsx`, `patterns/ContactHero/index.ts`

Hero section for Contact page:
- Use Section + Container layout primitives
- Animated title using TextReveal or FadeIn
- Optional subtitle with FadeIn animation
- Compact variant (60-70vh instead of full viewport)
- Background variant support (gradient, minimal)

```tsx
interface ContactHeroProps {
  title: string;
  subtitle?: string;
  background?: "gradient" | "minimal";
  compact?: boolean;
  className?: string;
}
```

**Verification**: Hero renders with animation, responsive on mobile

---

### Task 2: Create EnhancedPersonCard component
**Files**: `components/EnhancedPersonCard/EnhancedPersonCard.tsx`, `components/EnhancedPersonCard/index.ts`

Redesign PersonCard with Tailwind styling:
- Preserve all existing props (8 social platforms, image, loading)
- Use cn() for Tailwind class merging
- Layout variants: `horizontal` (2-col), `vertical` (stacked), `compact`
- Next/Image for avatar optimization
- FadeIn animation on mount
- Hover effects on social links (scale, color change)
- Skeleton loading state
- Accessible: aria-labels, focus-visible states

```tsx
interface EnhancedPersonCardProps {
  imageSrc: string;
  imageAlt: string;
  name: string;
  title: string;
  email: string;
  linkedinUrl?: string;
  linkedinLabel?: string;
  githubUrl?: string;
  githubLabel?: string;
  // ... all 8 social platforms
  variant?: "horizontal" | "vertical" | "compact";
  loading?: boolean;
  className?: string;
}
```

**Verification**: All social links work, loading skeleton shows, responsive layout

---

### Task 3: Create MapSection pattern
**Files**: `patterns/MapSection/MapSection.tsx`, `patterns/MapSection/index.ts`

Extract and enhance Leaflet map functionality:
- Dynamic import with `next/dynamic` and `ssr: false`
- **CRITICAL**: Preserve React StrictMode cleanup logic exactly
- Tailwind styling for container and fallback
- Custom marker with configurable icon
- Accessible: role="img", aria-label
- Optional popup text on marker
- Configurable zoom and height

```tsx
interface MapSectionProps {
  coordinates: [number, number];
  markerIcon?: string;
  popupText?: string;
  zoom?: number;
  height?: string;
  fallbackText?: string;
  className?: string;
}
```

**Verification**: Map loads correctly, cleanup works with Fast Refresh, marker shows

---

### Task 4: Create LocationCard component
**Files**: `components/LocationCard/LocationCard.tsx`, `components/LocationCard/index.ts`

Card for office location display:
- Office name heading
- Multi-line address
- Optional email/phone links
- Tailwind styling with card variants (default, bordered, elevated)
- FadeIn animation
- Icon support (map pin)

```tsx
interface LocationCardProps {
  officeName: string;
  address: string[];
  email?: string;
  phone?: string;
  variant?: "default" | "bordered" | "elevated";
  className?: string;
}
```

**Verification**: Card renders with all content, links work

---

### Task 5: Create EnhancedContactForm component
**Files**: `components/EnhancedContactForm/EnhancedContactForm.tsx`, `components/EnhancedContactForm/index.ts`

**CRITICAL TASK**: Restyle ContactForm while preserving ALL logic

Preserve exactly:
- useReducer state management (FormState type, UPDATE_FIELD, RESET)
- Email validation regex
- Honeypot field (hidden, aria-hidden)
- File upload with dual size limits (2MB upload, 2KB email)
- API submission to POST /api/contact
- All 7 form fields: fullName, email, phone, interest, message, hearAbout, attachment

Restyle with:
- TextInput from Phase 05 (or new Tailwind inputs)
- TextArea from Phase 05
- shadcn/ui Checkbox for interests (replace CheckboxGroup)
- shadcn/ui Select for "hear about" dropdown
- Toaster for success (replace Toast)
- Dialog for errors (replace Modal)
- FormGroup for visual grouping
- FadeIn animations on form sections
- Better visual hierarchy and spacing

```tsx
interface EnhancedContactFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  className?: string;
}
```

**Verification**: Form submits to API successfully, all validations work, honeypot blocks bots

---

### Task 6: Create CVDownloadSection pattern
**Files**: `patterns/CVDownloadSection/CVDownloadSection.tsx`, `patterns/CVDownloadSection/index.ts`

Enhance CV download section:
- Use CTASection styling principles
- Preserve SecureCVDownload component functionality
- Title and description text
- Email link for password request
- Background variants (primary, gradient, dark)
- FadeIn animation

```tsx
interface CVDownloadSectionProps {
  title: string;
  description: string;
  email: string;
  background?: "primary" | "gradient" | "dark";
  className?: string;
}
```

**Verification**: SecureCVDownload modal works, password validation functional

---

### Task 7: Create ContactFormSuccess component
**Files**: `components/ContactFormSuccess/ContactFormSuccess.tsx`, `components/ContactFormSuccess/index.ts`

Thank you state after successful form submission:
- Animated success icon (Check from lucide-react)
- Thank you message
- Expected response time
- "Send another message" button
- FadeIn animation

```tsx
interface ContactFormSuccessProps {
  title: string;
  message: string;
  responseTime?: string;
  onSendAnother?: () => void;
  className?: string;
}
```

**Verification**: Success state renders, animation plays, "send another" resets form

---

### Task 8: Compose ContactPageContent pattern
**Files**: `patterns/ContactPageContent/ContactPageContent.tsx`, `patterns/ContactPageContent/index.ts`

Compose the full Contact page:
- ContactHero
- LocationCard + MapSection (side-by-side on desktop, stacked on mobile)
- EnhancedPersonCard
- EnhancedContactForm with ContactFormSuccess state
- CVDownloadSection
- Smooth scroll animations between sections

```tsx
interface ContactPageContentProps {
  showMap?: boolean;
  showCVDownload?: boolean;
  className?: string;
}
```

**Verification**: Full page renders, form submission flow works end-to-end

---

### Task 9: Add i18n translation keys
**Files**: `locales/en/translation.json`, `locales/fi/translation.json`, `locales/sv/translation.json`

Add new translation keys:
- `contactHeroSubtitle`
- `contactLocationTitle`
- `contactFormSuccessTitle`
- `contactFormSuccessMessage`
- `contactFormSuccessResponseTime`
- `contactSendAnother`

**CRITICAL**: Preserve all existing 40+ contact keys - only ADD new ones

**Verification**: All strings display correctly in EN/FI/SV

---

### Task 10: Update ContactPage and cleanup
**Files**: `components/pages/ContactPage/ContactPage.tsx`, various

Refactor and cleanup:
- Replace ContactPage markup with ContactPageContent
- Remove unused CSS from ContactPage.module.css
- Update barrel exports (patterns/index.ts, components/index.ts)
- Preserve metadata in app/contact/page.tsx
- Run typecheck to verify no errors
- Manual test of form submission end-to-end

**Verification**: Contact page renders, form works, map loads, no TS errors

---

## Success Criteria

- [ ] ContactHero renders with animated title
- [ ] EnhancedPersonCard has 3 layout variants working
- [ ] MapSection loads Leaflet map (handles Fast Refresh cleanup)
- [ ] LocationCard displays office information
- [ ] EnhancedContactForm preserves ALL validation and API contract
- [ ] CVDownloadSection preserves password flow
- [ ] ContactFormSuccess shows after successful submission
- [ ] ContactPageContent composes all sections
- [ ] i18n keys added for EN/FI/SV (existing preserved)
- [ ] ContactPage refactored to use new patterns
- [ ] No TypeScript errors
- [ ] Form submission works end-to-end

---

## Output

```
patterns/
  ContactHero/
    ContactHero.tsx
    index.ts
  MapSection/
    MapSection.tsx
    index.ts
  CVDownloadSection/
    CVDownloadSection.tsx
    index.ts
  ContactPageContent/
    ContactPageContent.tsx
    index.ts

components/
  EnhancedPersonCard/
    EnhancedPersonCard.tsx
    index.ts
  LocationCard/
    LocationCard.tsx
    index.ts
  EnhancedContactForm/
    EnhancedContactForm.tsx
    index.ts
  ContactFormSuccess/
    ContactFormSuccess.tsx
    index.ts

Updated:
  components/pages/ContactPage/ContactPage.tsx
  locales/{en,fi,sv}/translation.json
  patterns/index.ts (barrel exports)
  components/index.ts (barrel exports)
```

---

## Notes

- **EnhancedContactForm is highest risk**: Copy logic exactly, only restyle
- **Leaflet cleanup is critical**: Do NOT simplify the React StrictMode handling
- **API contract MUST remain unchanged**: POST /api/contact with exact schema
- **Test form submission**: Before committing, verify end-to-end submission works
- **Honeypot field**: Must remain hidden with aria-hidden for spam protection

---

*Created: 2026-01-14*
*Updated: 2026-01-14 (added comprehensive analysis)*
