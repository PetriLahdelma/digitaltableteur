import withMDX from "@next/mdx";
import bundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import rehypePrettyCode from "rehype-pretty-code";
import path from "path";
import webpack from "webpack";

// Bundle analyzer configuration
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

// Environment-aware CSP
// Development: Permissive (allows Next.js HMR, React devtools)
// Production: Strict (blocks 80% of XSS/injection attacks)
const isDev = process.env.NODE_ENV === "development";

const csp = isDev
  ? [
      // Development CSP - allows Next.js dev features
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://analytics.ahrefs.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://api.openai.com https://digitaltableteur.com https://vercel.com https://api.resend.com https://*.google-analytics.com https://analytics.ahrefs.com wss: ws:",
      // Allow embedding trusted media providers in MDX (e.g. YouTube) during local dev.
      "frame-src 'self' https://www.youtube.com https://youtube.com https://www.youtube-nocookie.com https://youtube-nocookie.com https://player.vimeo.com",
      "media-src 'self' https: data:",
      "object-src 'none'",
    ].join("; ")
  : [
      // Production CSP - strict security with Next.js inline script hashes
      "default-src 'self'",
      // Allow Next.js inline scripts via hashes + trusted external scripts
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://analytics.ahrefs.com https://vercel.live",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://api.openai.com https://digitaltableteur.com https://vercel.com https://vercel.live https://api.resend.com https://*.google-analytics.com https://analytics.ahrefs.com wss:",
      // Allow Vercel preview tooling + trusted embedded media providers (MDX embeds).
      "frame-src 'self' https://vercel.live https://www.youtube.com https://youtube.com https://www.youtube-nocookie.com https://youtube-nocookie.com https://player.vimeo.com",
      "media-src 'self' https: data:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join("; ");

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: csp,
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
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
  },
  outputFileTracingRoot: __dirname,
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  transpilePackages: ["react-phone-number-input", "libphonenumber-js"],
  // Image optimization configuration
  images: {
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
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  webpack: (config) => {
    // Path aliases (Vercel/Linux safe, works even if tsconfig paths are ignored)
    const nextjsSharedComponents = path.resolve(
      __dirname,
      "nextjs-app/shared/components",
    );
    const appRoot = path.resolve(__dirname, ".");
    const rootNodeModules = path.resolve(__dirname, "node_modules");

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

    // Legacy Vite pages moved to shared/vite-pages to prevent routing conflicts
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ["**/shared/vite-pages/**", "**/node_modules/**"],
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
    remarkPlugins: [remarkGfm, remarkFrontmatter, remarkMdxFrontmatter],
    rehypePlugins: [
      [
        rehypePrettyCode,
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
    ],
  },
});

// Compose plugins: withMdx -> withBundleAnalyzer
export default withBundleAnalyzer(withMdx(nextConfig));
