// Page patterns
export { default as PageLayout } from "./PageLayout/PageLayout";
export type { PageLayoutProps } from "./PageLayout/PageLayout";

// Hero patterns
export { HeroSection, type HeroSectionProps } from "./HeroSection";
export { HomeHero, type HomeHeroProps } from "./HomeHero";
export { default as Hero, type HeroProps, type HeroAction } from "./Hero";

// Content blocks
export { default as GridBlock, type GridBlockProps } from "./GridBlock";
export {
  default as ProcessBlock,
  type ProcessBlockProps,
} from "./ProcessBlock";
export { default as ProofBlock, type ProofBlockProps } from "./ProofBlock";
export {
  default as ServicesBlock,
  type ServicesBlockProps,
} from "./ServicesBlock";
export { default as StoryBlock, type StoryBlockProps } from "./StoryBlock";
export { default as TeamBlock, type TeamBlockProps } from "./TeamBlock";

// Services section
export {
  ServicesSection,
  type ServicesSectionProps,
  type ServiceItem,
} from "./ServicesSection";

// Work/Portfolio preview
export {
  WorkPreviewSection,
  type WorkPreviewSectionProps,
  type ProjectItem,
} from "./WorkPreviewSection";
export { WorkHero, type WorkHeroProps } from "./WorkHero";

// Project detail patterns
export {
  ProjectDetailLayout,
  type ProjectDetailLayoutProps,
} from "./ProjectDetailLayout";
export {
  ProjectHero,
  type ProjectHeroProps,
  type ProjectHeroImage,
} from "./ProjectHero";
export {
  ProjectMetaSection,
  type ProjectMetaSectionProps,
  type ToolItem,
  type TeamMember,
  type ClientInfo,
} from "./ProjectMetaSection";
export {
  ProjectDetailTemplate,
  type ProjectDetailTemplateProps,
} from "./ProjectDetailTemplate";
export {
  ContentSection,
  type ContentSectionProps,
  type ContentImage,
} from "./ContentSection";
export { RelatedProjects, type RelatedProjectsProps } from "./RelatedProjects";

// Highlight/CTA sections
export {
  default as HighlightSection,
  type HighlightSectionProps,
} from "./HighlightSection";
export {
  CTASection,
  type CTASectionProps,
  type ActionItem,
} from "./CTASection";
export {
  DesignSprintsSection,
  type DesignSprintsSectionProps,
} from "./DesignSprintsSection";

// About page patterns
export { AboutHero, type AboutHeroProps } from "./AboutHero";
export {
  ValuesSection,
  type ValuesSectionProps,
  type ValueItem,
} from "./ValuesSection";
export {
  ManifestoSection,
  type ManifestoSectionProps,
  type ManifestoToken,
} from "./ManifestoSection";
export {
  AboutPageContent,
  type AboutPageContentProps,
} from "./AboutPageContent";

// Contact page patterns
export { ContactHero, type ContactHeroProps } from "./ContactHero";
export {
  CVDownloadSection,
  type CVDownloadSectionProps,
} from "./CVDownloadSection";

// Navigation
export { SiteHeader, type SiteHeaderProps, type NavItem } from "./SiteHeader";
export { MobileDrawer } from "./SiteHeader";
export { SiteFooter, type SiteFooterProps } from "./SiteFooter";

// Navigation barrel (for detailed imports)
export * from "./navigation";

// Blog patterns
export { BlogHero, type BlogHeroProps } from "./BlogHero";
export {
  BlogIndexContent,
  type BlogIndexContentProps,
} from "./BlogIndexContent";

// Article patterns
export { ArticleHero, type ArticleHeroProps } from "./ArticleHero";
export { ArticleLayout, type ArticleLayoutProps } from "./ArticleLayout";
export {
  ArticlePageTemplate,
  type ArticlePageTemplateProps,
} from "./ArticlePageTemplate";
export { RelatedPosts, type RelatedPostsProps } from "./RelatedPosts";
