import path from "path";
import withMDX from "@next/mdx";
import type { NextConfig } from "next";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import rehypePrettyCode from "rehype-pretty-code";

const nextConfig: NextConfig = {
  experimental: {
    externalDir: true,
  },
  outputFileTracingRoot: path.join(__dirname, ".."),
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  webpack: (config) => {
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

export default withMdx(nextConfig);
