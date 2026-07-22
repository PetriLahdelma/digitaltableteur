import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import styles from "./Documentation.module.css";
import { expect } from "storybook/test";
const LocalizationDocsContent = () => {
  return (
    <article className={styles.wrapper}>
      <header className={styles.header}>
        <h1>Localization (i18n)</h1>
        <p className={styles.lead}>
          Complete internationalization support for English, Finnish, and
          Swedish with automatic browser detection, localStorage persistence,
          and 100% translation coverage enforcement.
        </p>
      </header>

      <section className={styles.section}>
        <h2>Supported Languages</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Language</th>
              <th>Code</th>
              <th>File</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>English</td>
              <td>
                <code>en</code>
              </td>
              <td>
                <code>nextjs-app/shared/locales/en/translation.json</code>
              </td>
              <td>✅ Primary</td>
            </tr>
            <tr>
              <td>Finnish (Suomi)</td>
              <td>
                <code>fi</code>
              </td>
              <td>
                <code>nextjs-app/shared/locales/fi/translation.json</code>
              </td>
              <td>✅ Complete</td>
            </tr>
            <tr>
              <td>Swedish (Svenska)</td>
              <td>
                <code>sv</code>
              </td>
              <td>
                <code>nextjs-app/shared/locales/sv/translation.json</code>
              </td>
              <td>✅ Complete</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className={styles.section}>
        <h2>Implementation</h2>

        <h3>1. Using Translations in Components</h3>
        <p>
          Import <code>useTranslation</code> from react-i18next and call{" "}
          <code>t()</code> with translation keys:
        </p>
        <pre className={styles.code}>
          {`import { useTranslation } from "react-i18next";
import { Title, Text, Button } from "@dt/ComponentName";

function MyComponent() { const { t, i18n } = useTranslation();

  return (
    <div>
      <Title level={1}>
        {t("pageTitle")}
      </Title>
      <Text as="p">
        {t("pageDescription")}
      </Text>
      <Button onClick={() => i18n.changeLanguage("fi")}>
        {t("switchToFinnish")}
      </Button>
    </div>
  );
}`}
        </pre>

        <h3>2. Translation Key Structure</h3>
        <p>Keys follow a hierarchical dot notation for organization:</p>
        <pre className={styles.code}>
          {`// Flat keys (simple)
"navHome": "Home"
"navAbout": "About"
"navContact": "Contact"

// Nested keys (grouped)
"navigation": {
  "home": "Home",
  "about": "About",
  "contact": "Contact"
}

// Component-specific namespaces
"button": {
  "submit": "Submit",
  "cancel": "Cancel",
  "loading": "Loading..."
}

// Usage: t("navigation.home") or t("button.submit")`}
        </pre>

        <h3>3. Interpolation & Variables</h3>
        <p>Pass dynamic values into translations:</p>
        <pre className={styles.code}>
          {`// translation.json
{
  "greeting": "Hello, {{name}}!",
  "itemCount": "You have {{count}} items",
  "dateRange": "From {{start}} to {{end}}"
}

// Component usage
t("greeting", { name: "Petri" })
// Output: "Hello, Petri!"

t("itemCount", { count: 5 })
// Output: "You have 5 items"

t("dateRange", { start: "Jan 1", end: "Dec 31" })
// Output: "From Jan 1 to Dec 31"`}
        </pre>

        <h3>4. Pluralization</h3>
        <p>Handle singular/plural forms automatically:</p>
        <pre className={styles.code}>
          {`// translation.json
{
  "item_one": "{{count}} item",
  "item_other": "{{count}} items"
}

// Component usage
t("item", { count: 1 })  // "1 item"
t("item", { count: 5 })  // "5 items"`}
        </pre>
      </section>

      <section className={styles.section}>
        <h2>Language Detection & Persistence</h2>

        <h3>Detection Order</h3>
        <p>i18next checks for language preference in this order:</p>
        <ol>
          <li>
            <code>localStorage.getItem("i18nextLng")</code> - User's saved
            preference
          </li>
          <li>
            <code>document.cookie</code> (i18next) - Fallback when storage
            blocked
          </li>
          <li>
            <code>navigator.language</code> - Browser language setting
          </li>
          <li>
            <code>"en"</code> - Default fallback
          </li>
        </ol>

        <h3>Changing Language Programmatically</h3>
        <pre className={styles.code}>
          {`import { useTranslation } from "react-i18next";

function LanguageSwitcher() { const { i18n } = useTranslation();
  const currentLang = i18n.language; // "en", "fi", or "sv"

  const changeLanguage = (code: string) => { i18n.changeLanguage(code);
    
    // Persist to storage
    localStorage.setItem("i18nextLng", code);
    
    // Persist to cookie (for SSR)
    document.cookie = \`i18next=\${code}; path=/; max-age=31536000\`;
  };

  return (
    <div>
      <button onClick={() => changeLanguage("en")}>English</button>
      <button onClick={() => changeLanguage("fi")}>Suomi</button>
      <button onClick={() => changeLanguage("sv")}>Svenska</button>
      <p>Current: {currentLang}</p>
    </div>
  );
}`}
        </pre>

        <h3>Hydration Handling (Next.js)</h3>
        <p>
          Language detection happens client-side, which can cause hydration
          mismatches. Add <code>suppressHydrationWarning</code> to affected
          elements:
        </p>
        <pre className={styles.code}>
          {`// Navigation with translated labels
<nav aria-label={t("navMenuTitle")} suppressHydrationWarning>
  <Link href="/" suppressHydrationWarning>
    {t("navHome")}
  </Link>
</nav>`}
        </pre>
      </section>

      <section className={styles.section}>
        <h2>Translation Coverage Enforcement</h2>
        <p>
          The project includes automated tests that ensure 100% translation
          parity across all languages. Every key must exist in EN, FI, and SV.
        </p>

        <h3>Coverage Test</h3>
        <pre className={styles.code}>
          {`// nextjs-app/shared/__tests__/translation-coverage.test.tsx
describe("Translation Coverage", () => { it("has complete FI translations", () => { const enKeys = Object.keys(flattenObject(enTranslation));
    const fiKeys = Object.keys(flattenObject(fiTranslation));
    
    const missing = enKeys.filter(key => !fiKeys.includes(key));
    
    expect(missing).toEqual([]);
  });

  it("has complete SV translations", () => {
    // Same check for Swedish
  });
});`}
        </pre>

        <h3>Adding New Translations</h3>
        <p>
          When adding a new translation key, add it to all three language files:
        </p>
        <pre className={styles.code}>
          {`// 1. Add to nextjs-app/shared/locales/en/translation.json
{
  "myNewKey": "My new English text"
}

// 2. Add to nextjs-app/shared/locales/fi/translation.json
{
  "myNewKey": "Minun uusi suomenkielinen teksti"
}

// 3. Add to nextjs-app/shared/locales/sv/translation.json
{
  "myNewKey": "Min nya svenska text"
}

// 4. Run tests to verify coverage
npm run test`}
        </pre>
      </section>

      <section className={styles.section}>
        <h2>Storybook Localization</h2>
        <p>
          Storybook includes a language switcher in the toolbar. Test component
          translations in all languages:
        </p>
        <ol>
          <li>Open any component story</li>
          <li>Click the globe icon in the toolbar (top-right)</li>
          <li>Select EN / FI / SV</li>
          <li>Language persists across page navigation</li>
        </ol>

        <h3>Testing Translations in Stories</h3>
        <pre className={styles.code}>
          {`export const Default: Story = { render: () => { const { t } = useTranslation();
    return <MyComponent title={t("componentTitle")} />;
  },
};

// Test all languages at once
export const AllLanguages: Story = { render: () => (
    <div>
      <div lang="en">
        <I18nextProvider i18n={createInstance("en")}>
          <MyComponent />
        </I18nextProvider>
      </div>
      <div lang="fi">
        <I18nextProvider i18n={createInstance("fi")}>
          <MyComponent />
        </I18nextProvider>
      </div>
      <div lang="sv">
        <I18nextProvider i18n={createInstance("sv")}>
          <MyComponent />
        </I18nextProvider>
      </div>
    </div>
  ),
};`}
        </pre>
      </section>

      <section className={styles.section}>
        <h2>Best Practices</h2>

        <h3>✅ Do</h3>
        <ul>
          <li>
            Always use <code>t()</code> for user-facing text
          </li>
          <li>Add translations for aria-labels and alt text</li>
          <li>Use nested keys for component-specific translations</li>
          <li>
            Include context in key names: <code>button.submit</code> not just{" "}
            <code>submit</code>
          </li>
          <li>Test all three languages before committing</li>
          <li>Use interpolation for dynamic content</li>
          <li>Keep translations concise—respect character limits</li>
        </ul>

        <h3>❌ Don't</h3>
        <ul>
          <li>Never hardcode user-facing text in components</li>
          <li>
            Don't concatenate translations: <code>t("hello") + " " + name</code>
          </li>
          <li>Don't use translation keys as fallback text</li>
          <li>Don't skip translation coverage tests</li>
          <li>
            Don't translate developer-only content (console.log, code comments)
          </li>
        </ul>

        <h3>Example: Complete Component</h3>
        <pre className={styles.code}>
          {`// ❌ BAD - Hardcoded text
function BadComponent() { return (
    <div>
      <h1>Welcome to Digitaltableteur</h1>
      <p>We create amazing designs</p>
      <button>Contact Us</button>
    </div>
  );
}

// ✅ GOOD - Fully translated
function GoodComponent() { const { t } = useTranslation();
  
  return (
    <div>
      <Title level={1}>
        {t("welcome.title")}
      </Title>
      <Text as="p">
        {t("welcome.description")}
      </Text>
      <Button variant="primary">
        {t("welcome.ctaButton")}
      </Button>
    </div>
  );
}`}
        </pre>
      </section>

      <section className={styles.section}>
        <h2>Translation Workflow</h2>

        <h3>For Developers</h3>
        <ol>
          <li>Identify user-facing text in your component</li>
          <li>Create descriptive translation keys (use component namespace)</li>
          <li>Add English translations first</li>
          <li>
            Use automated translation tools for FI/SV (DeepL, Google Translate)
          </li>
          <li>Review machine translations for accuracy</li>
          <li>
            Run <code>npm run test</code> to verify coverage
          </li>
          <li>Test all three languages in Storybook</li>
        </ol>

        <h3>For Translators</h3>
        <ol>
          <li>
            Review English source in{" "}
            <code>nextjs-app/shared/locales/en/translation.json</code>
          </li>
          <li>Edit FI/SV files with culturally appropriate translations</li>
          <li>Maintain consistent terminology across translations</li>
          <li>Test character length constraints in UI</li>
          <li>Verify special characters and punctuation</li>
        </ol>
      </section>

      <section className={styles.section}>
        <h2>Common Patterns</h2>

        <h3>Conditional Content by Language</h3>
        <pre className={styles.code}>
          {`function LanguageSpecificContent() { const { i18n } = useTranslation();
  const isFinnish = i18n.language === "fi";

  return (
    <div>
      {isFinnish ? (
        <FinnishSpecificComponent />
      ) : (
        <DefaultComponent />
      )}
    </div>
  );
}`}
        </pre>

        <h3>Date & Number Formatting</h3>
        <pre className={styles.code}>
          {`import { useTranslation } from "react-i18next";

function FormattedContent() { const { i18n } = useTranslation();
  const locale = i18n.language; // "en", "fi", "sv"

  const date = new Date("2025-11-25");
  const price = 1234.56;

  return (
    <div>
      <p>
        {new Intl.DateTimeFormat(locale).format(date)}
      </p>
      <p>
        {new Intl.NumberFormat(locale, { style: "currency",
          currency: "EUR"
        }).format(price)}
      </p>
    </div>
  );
}`}
        </pre>

        <h3>Accessible Translated Labels</h3>
        <pre className={styles.code}>
          {`function AccessibleButton() { const { t } = useTranslation();

  return (
    <button
      aria-label={t("button.closeDialog")}
      title={t("button.closeDialog")}
    >
      <Icon name="x" decorative />
    </button>
  );
}`}
        </pre>
      </section>

      <section className={styles.section}>
        <h2>Files & Configuration</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>File</th>
              <th>Purpose</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>nextjs-app/shared/locales/*/translation.json</code>
              </td>
              <td>Translation files for each language</td>
            </tr>
            <tr>
              <td>
                <code>i18n/config.ts</code>
              </td>
              <td>i18next configuration and initialization</td>
            </tr>
            <tr>
              <td>
                <code>providers/I18nProvider.tsx</code>
              </td>
              <td>Next.js i18n provider wrapper</td>
            </tr>
            <tr>
              <td>
                <code>__tests__/translation-coverage.test.tsx</code>
              </td>
              <td>Automated translation parity testing</td>
            </tr>
            <tr>
              <td>
                <code>.storybook/preview.tsx</code>
              </td>
              <td>Storybook language switcher integration</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className={styles.section}>
        <h2>Troubleshooting</h2>

        <h3>Missing Translation Keys</h3>
        <p>If a key is missing, i18next falls back to the key itself:</p>
        <pre className={styles.code}>
          {`// If "myMissingKey" doesn't exist:
t("myMissingKey") // Returns: "myMissingKey"

// With fallback:
t("myMissingKey", "Default text") // Returns: "Default text"`}
        </pre>

        <h3>Language Not Switching</h3>
        <p>Check these common issues:</p>
        <ul>
          <li>
            Verify <code>useTranslation()</code> is called inside component
          </li>
          <li>
            Check <code>I18nextProvider</code> wraps the component tree
          </li>
          <li>
            Inspect localStorage for <code>i18nextLng</code> value
          </li>
          <li>Clear browser cache and cookies</li>
          <li>Verify translation JSON files have no syntax errors</li>
        </ul>

        <h3>Hydration Mismatches</h3>
        <p>If seeing React hydration errors related to translated text:</p>
        <ol>
          <li>
            Add <code>suppressHydrationWarning</code> to elements with{" "}
            <code>t()</code>
          </li>
          <li>
            Ensure <code>&lt;html&gt;</code> and <code>&lt;body&gt;</code> have
            the attribute
          </li>
          <li>
            Check that server and client use same language detection logic
          </li>
        </ol>
      </section>
    </article>
  );
};

const meta: Meta = {
  title: "Docs/Localization",
  parameters: {
    layout: "fullscreen",
    vitest: {
      skip: true, // Skip Vitest tests for documentation showcase
    },
  },
};

export default meta;

type Story = StoryObj<typeof LocalizationDocsContent>;

export const LocalizationGuide: Story = {
  render: () => <LocalizationDocsContent />,
};
