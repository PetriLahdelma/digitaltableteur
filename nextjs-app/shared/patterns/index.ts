// Page patterns
export { default as PageLayout } from "./PageLayout/PageLayout";
export type { PageLayoutProps } from "./PageLayout/PageLayout";

// Hero patterns
export { HeroSection, type HeroSectionProps } from "./HeroSection";
export { HomeHero, type HomeHeroProps } from "./HomeHero";
export { default as Hero, type HeroProps, type HeroAction } from "./Hero";

// Content blocks
export { default as GridBlock, type GridBlockProps } from "./GridBlock";
export { default as ProcessBlock, type ProcessBlockProps } from "./ProcessBlock";
export { default as ProofBlock, type ProofBlockProps } from "./ProofBlock";
export { default as ServicesBlock, type ServicesBlockProps } from "./ServicesBlock";
export { default as StoryBlock, type StoryBlockProps } from "./StoryBlock";
export { default as TeamBlock, type TeamBlockProps } from "./TeamBlock";

// Highlight/CTA sections
export { default as HighlightSection, type HighlightSectionProps } from "./HighlightSection";

// Navigation
export { SiteHeader, type SiteHeaderProps, type NavItem } from "./SiteHeader";
export { MobileDrawer } from "./SiteHeader";
export { SiteFooter, type SiteFooterProps } from "./SiteFooter";

// Navigation barrel (for detailed imports)
export * from "./navigation";
