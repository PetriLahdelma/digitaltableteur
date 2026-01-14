# Phase 09-2: Contact Page Redesign

> **Phase**: 09 (About & Contact Pages)
> **Plan**: 2 of 2
> **Tasks**: 10

---

## Objective

Redesign the Contact page using new design system patterns. Transform the current layout into a modern, professional contact experience with:
- Hero section with animated title
- Redesigned contact form using Tailwind + Phase 05 form components
- Updated PersonCard component
- Map section with consistent styling
- CV download section as CTASection
- Confirmation/thank you states

---

## Context

### Current State
- ContactPage at `nextjs-app/shared/components/pages/ContactPage/`
- Uses: PageLayout, Title, Text, FlexBox, Link, PersonCard, ContactForm, SecureCVDownload
- Leaflet.js map with Helsinki marker
- ContactForm is complex: reducer state, file upload, honeypot, validation, API submission
- CSS Modules styling

### Key Components to Update
1. **ContactForm** - Uses old design system inputs (Inputs, TextArea, Select, etc.)
2. **PersonCard** - Works well but uses old Icon/Link components
3. **SecureCVDownload** - Should integrate into CTASection pattern

### Existing ContactForm Features to Preserve
- Honeypot spam protection
- File attachment with size validation
- API submission to /api/contact
- Toast success notification
- Modal error handling
- Phone input with country code
- Interest checkboxes
- "How did you hear about us" select

### Dependencies
- Phase 05: FormField, TextInput, TextArea, CheckboxField
- Phase 06: Dialog (for error modal), Toaster (for success)
- Phase 07: HeroSection, CTASection patterns

---

## Tasks

### Task 1: Create ContactHero pattern
**Files**: `patterns/ContactHero/ContactHero.tsx`, `patterns/ContactHero/index.ts`

Hero section for Contact page:
- Animated title using TextReveal
- Optional subtitle
- Minimal height (not full viewport like About)
- Background variant support

```tsx
interface ContactHeroProps {
  title: string;
  subtitle?: string;
  background?: "default" | "gradient" | "muted";
}
```

**Verification**: Hero renders with animation

---

### Task 2: Create EnhancedPersonCard component
**Files**: `components/EnhancedPersonCard/EnhancedPersonCard.tsx`, `components/EnhancedPersonCard/index.ts`

Update PersonCard with Tailwind styling:
- Next.js Image for avatar (optimized)
- Social links with Phosphor icons
- Hover effects on social icons
- Skeleton loading state preserved
- Modern card styling with border/shadow options

```tsx
interface EnhancedPersonCardProps {
  image: { src: string; alt: string };
  name: string;
  title: string;
  email: string;
  socials: Array<{
    platform: "linkedin" | "github" | "twitter" | "dribbble" | "medium" | "substack";
    url: string;
    label?: string;
  }>;
  variant?: "default" | "bordered" | "elevated";
  loading?: boolean;
}
```

**Verification**: Card renders with all socials, loading state works

---

### Task 3: Create ContactInfo pattern
**Files**: `patterns/ContactInfo/ContactInfo.tsx`, `patterns/ContactInfo/index.ts`

Section combining address and person card:
- Two-column layout (address + PersonCard)
- Office address with optional map
- Responsive: stacks on mobile
- FadeIn animations

```tsx
interface ContactInfoProps {
  address: {
    line1?: string;
    line2: string;
    line3: string;
    line4: string;
  };
  person: EnhancedPersonCardProps;
  showMap?: boolean;
  mapCoordinates?: [number, number];
}
```

**Verification**: Layout responds to breakpoints, map optional

---

### Task 4: Create MapSection component
**Files**: `components/MapSection/MapSection.tsx`, `components/MapSection/index.ts`

Encapsulate Leaflet map logic:
- Dynamic import of Leaflet (SSR-safe)
- Custom marker with DT icon
- Popup with office name
- Styled container matching design system
- Cleanup on unmount (memory leak prevention)

```tsx
interface MapSectionProps {
  center: [number, number];
  zoom?: number;
  markerIcon?: string;
  popupText?: string;
  height?: string;
  className?: string;
}
```

**Verification**: Map renders without SSR errors, marker shows popup

---

### Task 5: Create EnhancedContactForm component
**Files**: `components/EnhancedContactForm/EnhancedContactForm.tsx`, `components/EnhancedContactForm/index.ts`

Restyle ContactForm with Tailwind + Phase 05 components:
- Use TextInput from Phase 05 (or enhance existing)
- Use TextArea from Phase 05
- Create styled Select component if needed
- Keep all existing logic: reducer, validation, honeypot, file upload, submission
- Use Toaster for success instead of Toast
- Use Dialog for errors instead of Modal
- Responsive layout improvements

Preserve all existing functionality:
- `fullName`, `email`, `phone`, `interest`, `message`, `hearAbout` fields
- File attachment with 2MB limit
- Honeypot spam protection
- Form validation with error states
- API submission to /api/contact

```tsx
interface EnhancedContactFormProps {
  className?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}
```

**Verification**: Form submits successfully, all validations work, toasts/dialogs show

---

### Task 6: Create CVDownloadSection pattern
**Files**: `patterns/CVDownloadSection/CVDownloadSection.tsx`, `patterns/CVDownloadSection/index.ts`

Dedicated section for CV/resume download:
- Extends CTASection pattern
- Integrates SecureCVDownload component
- Full-width colored background
- Title, description, download button

```tsx
interface CVDownloadSectionProps {
  title: string;
  description: string;
  email?: string;
  background?: "primary" | "accent" | "gradient";
}
```

**Verification**: Download button works, styling consistent with CTASection

---

### Task 7: Create ContactFormSuccess component
**Files**: `components/ContactFormSuccess/ContactFormSuccess.tsx`, `components/ContactFormSuccess/index.ts`

Thank you state after successful form submission:
- Animated checkmark or success icon
- Thank you message
- Expected response time
- Option to send another message
- FadeIn animation

```tsx
interface ContactFormSuccessProps {
  title: string;
  message: string;
  onSendAnother?: () => void;
}
```

**Verification**: Success state renders, animation plays, "send another" resets form

---

### Task 8: Compose ContactPageContent component
**Files**: `patterns/ContactPageContent/ContactPageContent.tsx`, `patterns/ContactPageContent/index.ts`

Compose the full Contact page:
- ContactHero
- ContactInfo (address + PersonCard + optional map)
- EnhancedContactForm
- CVDownloadSection
- Track form success state for ContactFormSuccess

```tsx
interface ContactPageContentProps {
  showMap?: boolean;
  showCVDownload?: boolean;
}
```

**Verification**: Full page renders, form submission flow works end-to-end

---

### Task 9: Add i18n translation keys
**Files**: `locales/en/translation.json`, `locales/fi/translation.json`, `locales/sv/translation.json`

Add new translation keys:
- `contactHeroSubtitle`
- `contactFormSuccessTitle`
- `contactFormSuccessMessage`
- `contactSendAnother`
- Any new validation messages

Preserve all existing contact form translation keys.

**Verification**: All strings display correctly in EN/FI/SV

---

### Task 10: Update ContactPage to use new patterns
**Files**: `components/pages/ContactPage/ContactPage.tsx`, `app/contact/ContactContent.tsx`

Refactor to use ContactPageContent:
- Replace old markup with composed pattern
- Remove unused CSS classes
- Preserve metadata in app/contact/page.tsx
- Ensure backwards compatibility with i18n keys

**Verification**: Contact page renders, form works, no visual regressions

---

## Success Criteria

- [ ] ContactHero renders with animated title
- [ ] EnhancedPersonCard displays with social icons
- [ ] ContactInfo shows address + person card responsively
- [ ] MapSection renders Leaflet map without SSR errors
- [ ] EnhancedContactForm preserves all functionality (honeypot, file upload, validation, submission)
- [ ] CVDownloadSection integrates SecureCVDownload
- [ ] ContactFormSuccess shows after successful submission
- [ ] ContactPageContent composes all sections
- [ ] i18n keys added for EN/FI/SV
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
  ContactInfo/
    ContactInfo.tsx
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
  MapSection/
    MapSection.tsx
    index.ts
  EnhancedContactForm/
    EnhancedContactForm.tsx
    index.ts
  ContactFormSuccess/
    ContactFormSuccess.tsx
    index.ts

Updated:
  components/pages/ContactPage/ContactPage.tsx
  app/contact/ContactContent.tsx
  locales/{en,fi,sv}/translation.json
  patterns/index.ts (barrel exports)
  components/ui/index.ts (barrel exports)
```

---

## Notes

- **Leaflet SSR**: Must use dynamic import with `ssr: false` to avoid window/document errors
- **Form complexity**: EnhancedContactForm has significant logic; preserve all of it
- **SecureCVDownload**: Existing component, just wrap in CVDownloadSection pattern
- **Honeypot**: Critical spam protection, do not remove
- **File upload**: 2MB limit, email attachment limit separate (also 2MB)

---

*Created: 2026-01-14*
