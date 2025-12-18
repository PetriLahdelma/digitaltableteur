# Cookie Consent Library

**Inspired by**: [Helsinki Design System](https://hds.hel.fi/components/cookie-consent)  
**Built for**: Digitaltableteur design system  
**Zero dependencies**: Uses only DT components

---

## Architecture

```
shared/lib/cookieConsent/
├── types.ts                  # TypeScript definitions
├── storage.ts                # localStorage utilities
├── CookieConsentContext.tsx  # React Context provider
└── index.ts                  # Public API
```

### Key Patterns

1. **Context-based state management** - Single source of truth
2. **localStorage persistence** - Versioned schema for migrations
3. **Type-safe API** - Full TypeScript coverage
4. **Event-driven** - Subscribe to consent changes
5. **SSR-compatible** - No runtime errors on server

---

## Public API

### `CookieConsentProvider`

```tsx
import { CookieConsentProvider } from '@dt/CookieConsent';

<CookieConsentProvider
  autoShow={true}              // Auto-show banner if no consent
  onChange={(event) => {...}}  // Listen to consent changes
>
  {children}
</CookieConsentProvider>
```

### `useCookieConsent` Hook

```tsx
const {
  isReady, // boolean - Context loaded
  consents, // CategoryConsent[] - Current state
  hasConsent, // (category) => boolean
  acceptAll, // () => void
  acceptEssentialOnly, // () => void
  setConsents, // (categories) => void
  revokeAll, // () => void
  openBanner, // () => void
  closeBanner, // () => void
  isBannerOpen, // boolean
} = useCookieConsent();
```

---

## Types

### `CookieCategory`

```typescript
type CookieCategory =
  | "essential" // Required, cannot disable
  | "analytics" // Google Analytics, etc.
  | "functional" // Chat, preferences
  | "marketing"; // Reserved for future use
```

### `CategoryConsent`

```typescript
interface CategoryConsent {
  category: CookieCategory;
  consented: boolean;
  required: boolean; // If true, toggle disabled
}
```

### `ConsentState` (localStorage)

```typescript
interface ConsentState {
  version: number; // Schema version
  timestamp: string; // ISO 8601
  language: string; // Consent language
  categories: Record<CookieCategory, boolean>;
}
```

### `ConsentChangeEvent`

```typescript
interface ConsentChangeEvent {
  type: "accept-all" | "accept-required" | "custom" | "revoke";
  categories: CategoryConsent[];
  timestamp: string;
}
```

---

## Storage Functions

### Core Utilities

```typescript
// Load from localStorage
loadConsentState(): ConsentState | null

// Save to localStorage
saveConsentState(
  categories: Record<CookieCategory, boolean>,
  language: string
): void

// Clear storage (revoke)
clearConsentState(): void

// Check if consent given
hasGivenConsent(): boolean

// Get specific category status
getCategoryConsent(category: CookieCategory): boolean

// Convert state to array format
stateToConsents(state: ConsentState | null): CategoryConsent[]
```

### Constants

```typescript
// Default consent values (all false except essential)
DEFAULT_CONSENTS: Record<CookieCategory, boolean>;

// Category configuration (which are required)
CATEGORY_CONFIG: Record<CookieCategory, { required: boolean }>;

// Cookie documentation
COOKIE_DEFINITIONS: Array<{
  name: string;
  category: CookieCategory;
  purpose: string;
  duration: string;
  provider?: string;
}>;
```

---

## Storage Schema

### localStorage Key

`dt-cookie-consent`

### Schema v1

```json
{
  "version": 1,
  "timestamp": "2025-12-01T12:00:00.000Z",
  "language": "en",
  "categories": {
    "essential": true,
    "analytics": false,
    "functional": false,
    "marketing": false
  }
}
```

### Migration Strategy

When `CURRENT_VERSION` increments:

1. Check `state.version < CURRENT_VERSION`
2. Apply migration transformations
3. Save migrated state
4. If migration fails, return `null` (re-prompt user)

---

## Examples

### Conditional Script Loading

```tsx
import { useCookieConsent } from "@dt/CookieConsent";

function GoogleAnalytics() {
  const { hasConsent } = useCookieConsent();

  if (!hasConsent("analytics")) {
    return null;
  }

  return (
    <Script
      src="https://www.googletagmanager.com/gtag/js"
      strategy="afterInteractive"
    />
  );
}
```

### Settings Page

```tsx
function CookieSettingsPage() {
  const { consents, setConsents, acceptAll, acceptEssentialOnly, revokeAll } =
    useCookieConsent();

  const [custom, setCustom] = useState(() => {
    const map = {};
    consents.forEach((c) => (map[c.category] = c.consented));
    return map;
  });

  return (
    <div>
      <h1>Cookie Preferences</h1>

      {consents.map((consent) => (
        <label key={consent.category}>
          <input
            type="checkbox"
            checked={custom[consent.category]}
            disabled={consent.required}
            onChange={(e) =>
              setCustom({
                ...custom,
                [consent.category]: e.target.checked,
              })
            }
          />
          {consent.category}
        </label>
      ))}

      <button onClick={() => setConsents(custom)}>Save</button>
      <button onClick={acceptAll}>Accept All</button>
      <button onClick={acceptEssentialOnly}>Only Essential</button>
      <button onClick={revokeAll}>Reset</button>
    </div>
  );
}
```

### Analytics Integration

```tsx
<CookieConsentProvider
  onChange={(event) => {
    const analytics = event.categories.find(
      c => c.category === 'analytics'
    );

    if (analytics?.consented) {
      // Enable GA
      window.gtag('consent', 'update', {
        analytics_storage: 'granted'
      });
    } else {
      // Disable GA
      window.gtag('consent', 'update', {
        analytics_storage: 'denied'
      });
    }
  }}
>
```

---

## Testing

### Unit Tests

```typescript
import { render, screen } from "@testing-library/react";
import { CookieConsentProvider, useCookieConsent } from "./index";

describe("CookieConsentProvider", () => {
  it("loads consent from localStorage", () => {
    localStorage.setItem(
      "dt-cookie-consent",
      JSON.stringify({
        version: 1,
        timestamp: new Date().toISOString(),
        language: "en",
        categories: {
          essential: true,
          analytics: true,
          functional: false,
          marketing: false,
        },
      }),
    );

    const { result } = renderHook(() => useCookieConsent(), {
      wrapper: CookieConsentProvider,
    });

    expect(result.current.hasConsent("analytics")).toBe(true);
  });
});
```

---

## Future Enhancements

### Cookie Monitoring

Detect and notify about unauthorized cookies (HDS feature):

```typescript
class CookieMonitor {
  scan(): UnauthorizedCookie[] {
    const allowed = getAllowedCookies();
    const current = document.cookie.split(";");
    return current.filter((c) => !allowed.includes(c));
  }
}
```

### Auto-Expiry

Re-prompt after 13 months (GDPR requirement):

```typescript
function isConsentExpired(state: ConsentState): boolean {
  const age = Date.now() - new Date(state.timestamp).getTime();
  const thirteenMonths = 13 * 30 * 24 * 60 * 60 * 1000;
  return age > thirteenMonths;
}
```

### Consent History

Track all consent changes for GDPR audit:

```typescript
interface ConsentHistory {
  events: ConsentChangeEvent[];
  export(): Blob; // Download as JSON
}
```

---

## License

Part of Digitaltableteur design system.  
Inspired by Helsinki Design System (MIT License).
