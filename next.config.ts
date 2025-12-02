import withMDX from "@next/mdx";
import type { NextConfig } from "next";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import path from "path";

const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https: blob:",
  "style-src 'self' 'unsafe-inline' https:",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https: wss:",
  "frame-src https:",
  "media-src 'self' https: data:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https:",
  "frame-ancestors 'self'",
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
    // Add path alias for @dt
    config.resolve.alias = {
      ...config.resolve.alias,
      "@dt": path.resolve(__dirname, "nextjs-app/shared/components"),
    };

    // Legacy Vite pages moved to shared/vite-pages to prevent routing conflicts
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ["**/shared/vite-pages/**", "**/node_modules/**"],
    };
    return config;
  },
};

const withMdx = withMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [remarkGfm, remarkFrontmatter, remarkMdxFrontmatter],
  },
});

export default withMdx(nextConfig);
