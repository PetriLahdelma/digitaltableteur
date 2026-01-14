/**
 * Lighthouse CI Configuration
 *
 * Run locally: npm run lighthouse:ci
 * Run in CI: lhci autorun
 *
 * @see https://github.com/GoogleChrome/lighthouse-ci/blob/main/docs/configuration.md
 */
module.exports = {
  ci: {
    collect: {
      // Pages to audit
      url: [
        "http://localhost:3000/",
        "http://localhost:3000/about",
        "http://localhost:3000/work",
        "http://localhost:3000/blog",
        "http://localhost:3000/contact",
      ],
      // Start command (build happens before in CI)
      startServerCommand: "npm run start",
      startServerReadyPattern: "Ready in",
      startServerReadyTimeout: 30000,
      // Number of runs per URL for median
      numberOfRuns: 3,
      // Settings for more stable results
      settings: {
        chromeFlags: "--no-sandbox --disable-gpu --headless",
        // Simulate mobile-first
        preset: "desktop",
      },
    },
    assert: {
      assertions: {
        // Performance: Target >=80, warn at 70
        "categories:performance": ["warn", { minScore: 0.7 }],
        // Accessibility: Target >=90, error at 85
        "categories:accessibility": ["error", { minScore: 0.85 }],
        // Best Practices: Target >=90, warn at 80
        "categories:best-practices": ["warn", { minScore: 0.8 }],
        // SEO: Target >=90, warn at 80
        "categories:seo": ["warn", { minScore: 0.8 }],
        // PWA: Optional, just track
        "categories:pwa": ["off", {}],
      },
      // Budget assertions
      preset: "lighthouse:recommended",
    },
    upload: {
      // Use temporary public storage for reports
      target: "temporary-public-storage",
    },
    // Server settings for local testing
    server: {
      port: 9001,
      storage: {
        storageMethod: "sql",
        sqlDatabasePath: ".lighthouseci/lhci.db",
      },
    },
  },
};
