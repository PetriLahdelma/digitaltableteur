import withMDX from "@next/mdx";
import bundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";
import path from "path";
import webpack from "webpack";

import { getAgentDiscoveryLinkHeader } from "./app/lib/agent-discovery";

// Shared path aliases (webpack + turbopack)
const nextjsSharedComponents = path.resolve(
  __dirname,
  "nextjs-app/shared/components",
);
const appRoot = path.resolve(__dirname, ".");
const rootNodeModules = path.resolve(__dirname, "node_modules");

// String plugin names + JSON-serializable options only — required for Turbopack MDX.
// Function imports (remarkGfm, rehypePrettyCode, …) break @next/mdx with Turbopack.
const mdxRemarkPlugins = [
  "remark-gfm",
  "remark-frontmatter",
  "remark-mdx-frontmatter",
];

const mdxRehypePlugins = [
  [
    "rehype-pretty-code",
    {
      theme: {
        light: "github-light",
        dark: "github-dark",
        hcw: "github-light-high-contrast",
        hcb: "github-dark-high-contrast",
      },
      keepBackground: false,
      bypassInlineCode: true,
      defaultLang: {
        block: "text",
        inline: "text",
      },
    },
  ],
];

// Bundle analyzer configuration
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

// Environment-aware CSP
// Development: Permissive (allows Next.js HMR, React devtools)
// Production: Strict (blocks 80% of XSS/injection attacks)
const isDev = process.env.NODE_ENV === "development";

// HTTPS-only hardening (upgrade-insecure-requests, HSTS) belongs on the real
// HTTPS deployment only. When a production build is served over plain HTTP —
// e.g. `next start` reached via a LAN IP from a phone on the same network —
// these directives rewrite every CSS/JS request to https://, which the local
// server can't answer, so the page loads with zero CSS and zero JS. Vercel
// sets VERCEL=1 on real deployments; FORCE_HTTPS_CSP=1 is an explicit override.
const isHttpsDeployment =
  process.env.VERCEL === "1" || process.env.FORCE_HTTPS_CSP === "1";

const csp = isDev
  ? [
      // Development CSP - allows Next.js dev features
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://analytics.ahrefs.com https://app.cal.com https://app.cal.eu",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://api.openai.com https://digitaltableteur.com https://vercel.com https://api.resend.com https://*.google-analytics.com https://analytics.ahrefs.com https://cal.com https://app.cal.com https://*.cal.com https://cal.eu https://app.cal.eu https://*.cal.eu wss: ws:",
      // Allow embedding trusted media providers in MDX (e.g. YouTube) during local dev.
      "frame-src 'self' https://www.youtube.com https://youtube.com https://www.youtube-nocookie.com https://youtube-nocookie.com https://player.vimeo.com https://cal.com https://app.cal.com https://*.cal.com https://cal.eu https://app.cal.eu https://*.cal.eu https://calendly.com https://*.calendly.com",
      "media-src 'self' https: data:",
      "object-src 'none'",
    ].join("; ")
  : [
      // Production CSP - strict security with Next.js inline script hashes
      "default-src 'self'",
      // Allow Next.js inline scripts via hashes + trusted external scripts
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://analytics.ahrefs.com https://vercel.live https://app.cal.com https://app.cal.eu",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://api.openai.com https://digitaltableteur.com https://vercel.com https://vercel.live https://api.resend.com https://*.google-analytics.com https://analytics.ahrefs.com https://cal.com https://app.cal.com https://*.cal.com https://cal.eu https://app.cal.eu https://*.cal.eu wss:",
      // Allow Vercel preview tooling + trusted embedded media providers (MDX embeds).
      "frame-src 'self' https://vercel.live https://www.youtube.com https://youtube.com https://www.youtube-nocookie.com https://youtube-nocookie.com https://player.vimeo.com https://cal.com https://app.cal.com https://*.cal.com https://cal.eu https://app.cal.eu https://*.cal.eu https://calendly.com https://*.calendly.com",
      "media-src 'self' https: data:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      // Only on a genuine HTTPS deployment — see isHttpsDeployment note above.
      ...(isHttpsDeployment ? ["upgrade-insecure-requests"] : []),
    ].join("; ");

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: csp,
  },
  // HSTS forces the browser to use https:// for this host. Sending it from a
  // local HTTP server can brick LAN-IP testing, so only emit it on real HTTPS.
  ...(isHttpsDeployment
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), interest-cohort=()",
  },
  {
    key: "Cross-Origin-Opener-Policy",
    value: "same-origin",
  },
  {
    key: "Cross-Origin-Resource-Policy",
    value: "same-origin",
  },
];

const nextConfig: NextConfig = {
  experimental: {
    externalDir: true,
    optimizePackageImports: [
      "@phosphor-icons/react",
      "react-icons",
      "react-icons/si",
      "framer-motion",
      "gsap",
      "@gsap/react",
      "lenis",
    ],
  },
  // Allow physical devices on the LAN (e.g. a phone reaching `next dev` via the
  // Mac's LAN IP) to load /_next/* dev resources. Next 16 blocks cross-origin
  // dev-asset requests by default, which strips CSS, client JS, and optimized
  // images on any non-localhost origin — the device renders an unstyled,
  // non-interactive page (dead hamburger, no nav background, broken images)
  // while desktop localhost looks fine. Production is unaffected: this gate is
  // dev-server-only. The subnet wildcard tolerates DHCP reassigning the IP.
  allowedDevOrigins: ["192.168.1.119", "192.168.1.*"],
  outputFileTracingRoot: __dirname,
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  transpilePackages: ["react-phone-number-input", "libphonenumber-js"],
  // Sentry + OpenTelemetry use dynamic `require()` patterns that webpack
  // can't statically analyse, producing repeated "Critical dependency: the
  // request of a dependency is an expression" warnings. Externalising the
  // packages tells webpack to leave them as Node-resolved requires at
  // runtime, which is also more correct: these are Node-native packages that
  // should never have been bundled. Sentry's official guidance for Next 15+.
  serverExternalPackages: [
    "@opentelemetry/instrumentation",
    "@opentelemetry/sdk-node",
    "@sentry/nextjs",
    "@sentry/node",
    "@sentry/profiling-node",
    "require-in-the-middle",
    "import-in-the-middle",
    "@modelcontextprotocol/sdk",
    "mcp-handler",
  ],
  // Image optimization configuration
  images: {
    // Local images with cache-busting query strings (e.g. ?v=2) require explicit patterns in Next 16.
    localPatterns: [
      {
        pathname: "/images/**",
      },
      {
        pathname: "/blog/**",
      },
    ],
    // Local SVG heroes/diagrams use <img> via BlogMediaImage; this allows raster fallbacks.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Enable modern image formats for better compression
    formats: ["image/avif", "image/webp"],
    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    // Image sizes for srcset
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Remote patterns for external images (Sanity, CDNs)
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
      {
        protocol: "https",
        hostname: "*.sanity.io",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  // TODO: Remove ignoreBuildErrors once the ~23 pre-existing type errors are resolved.
  // Root cause: dual @types/react versions from dependency tree conflicts.
  // CI enforces typecheck separately via .github/workflows/pr-validation.yml.
  // Next.js 16 removed the eslint config key — lint runs via npm run lint in CI.
  typescript: {
    ignoreBuildErrors: true,
  },
  turbopack: {
    // Turbopack aliases must be project-relative (absolute paths get `./` prefixed and break).
    resolveAlias: {
      "@": "./",
      "@dt": "./nextjs-app/shared/components",
      "@dt-pages": "./nextjs-app/shared/components/pages",
      // Pin i18n to root node_modules — duplicate copies break initReactI18next on Turbopack.
      i18next: "./node_modules/i18next",
      "react-i18next": "./node_modules/react-i18next",
      "i18next-browser-languagedetector":
        "./node_modules/i18next-browser-languagedetector",
    },
  },
  async headers() {
    const agentLinkHeader = {
      key: "Link",
      value: getAgentDiscoveryLinkHeader(),
    };

    return [
      {
        source: "/",
        headers: [...securityHeaders, agentLinkHeader],
      },
      {
        source: "/:path+",
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      // Legacy cookie policy URLs → privacy policy (301 permanent)
      {
        source: "/cookie-policy-full",
        destination: "/privacy-policy",
        permanent: true,
      },
      {
        source: "/cookie-policy-full-en",
        destination: "/privacy-policy",
        permanent: true,
      },
      {
        source: "/cookie-policy-full-fi",
        destination: "/privacy-policy",
        permanent: true,
      },
      {
        source: "/cookie-policy-full-sv",
        destination: "/privacy-policy",
        permanent: true,
      },
      {
        source: "/cookie-policy",
        destination: "/privacy-policy",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    // `/auth.md` cannot live as `app/auth.md/` — `.md` is a pageExtension (MDX).
    return [{ source: "/auth.md", destination: "/agent-auth" }];
  },
  webpack: (config, { dev }) => {
    // Use filesystem cache in dev so revisiting a route reuses work from earlier in the
    // session. Memory-only cache (maxGenerations: 2) forced ~1 min recompiles per route.
    // predev prunes .next/cache/webpack when it exceeds 400MB.
    if (dev) {
      config.cache = {
        type: "filesystem",
        cacheDirectory: path.join(__dirname, ".next", "cache", "webpack"),
        maxMemoryGenerations: 1,
      };
    }

    const existingAlias = config.resolve.alias;
    const normalizedAlias: Record<string, string | false> = Array.isArray(
      existingAlias,
    )
      ? Object.fromEntries(existingAlias.map((entry) => [entry.name, entry.alias]))
      : (existingAlias ?? {});

    config.resolve.alias = {
      ...normalizedAlias,
      "@": appRoot,
      "@dt": nextjsSharedComponents,
      "@dt-pages": path.join(nextjsSharedComponents, "pages"),
      i18next: path.join(rootNodeModules, "i18next"),
      "react-i18next": path.join(rootNodeModules, "react-i18next"),
      "i18next-browser-languagedetector": path.join(
        rootNodeModules,
        "i18next-browser-languagedetector",
      ),
    };

    // Ignore generated + build output so predev/build scripts do not trigger
    // full 16k-module recompiles while a route is still compiling.
    config.watchOptions = {
      ...config.watchOptions,
      ignored: [
        "**/node_modules/**",
        "**/.next/**",
        "**/storybook-static/**",
        "**/shared/vite-pages/**",
        "**/app/blog/postMetadata.ts",
        "**/nextjs-app/app/blog/postMetadata.ts",
        "**/nextjs-app/shared/data/blogManifest.ts",
        "**/nextjs-app/shared/components/CodeBlockWindow/codeBlockFixtures.ts",
      ],
    };

    // Redirect React imports from Sanity packages to a wrapper that includes useEffectEvent
    // This fixes the "useEffectEvent is not exported from react" build error
    const reactWrapper = path.resolve(__dirname, "lib/react-with-use-effect-event.js");
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /^react$/,
        (resource: { context?: string; request?: string }) => {
          // Only apply to Sanity-related packages
          if (
            resource.context?.includes("node_modules/sanity") ||
            resource.context?.includes("node_modules/@sanity") ||
            resource.context?.includes("node_modules/next-sanity")
          ) {
            resource.request = reactWrapper;
          }
        },
      ),
    );

    return config;
  },
};

const withMdx = withMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: mdxRemarkPlugins as string[],
    rehypePlugins: mdxRehypePlugins as [string, Record<string, unknown>][],
  },
});

// Compose plugins: withMdx -> withBundleAnalyzer
export default withBundleAnalyzer(withMdx(nextConfig));
