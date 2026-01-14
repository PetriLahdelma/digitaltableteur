"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";

// Patterns
import { HomeHero } from "../../../patterns/HomeHero";
import { ServicesSection, type ServiceItem } from "../../../patterns/ServicesSection";
import { WorkPreviewSection, type ProjectItem } from "../../../patterns/WorkPreviewSection";
import { CTASection } from "../../../patterns/CTASection";
import HighlightSection from "../../../patterns/HighlightSection";

// Service icons
import {
  UxInterfacesIcon,
  CreativeDevelopmentIcon,
  BrandingStrategyIcon,
  EditorialIllustrationIcon,
  AiSolutionsIcon,
  DesignSystemsIcon,
} from "../../icons/service-icons";

// Sample featured projects (replace with actual data from CMS)
const FEATURED_PROJECTS: ProjectItem[] = [
  {
    title: "Design System for SaaS Platform",
    slug: "design-system-saas",
    thumbnail: "/images/work/project-1.jpg",
    category: "Design Systems",
    tags: ["React", "Figma", "Tokens"],
  },
  {
    title: "AI-Powered Analytics Dashboard",
    slug: "analytics-dashboard",
    thumbnail: "/images/work/project-2.jpg",
    category: "Product Design",
    tags: ["AI/ML", "Data Viz", "UX"],
  },
  {
    title: "Brand Identity Refresh",
    slug: "brand-identity",
    thumbnail: "/images/work/project-3.jpg",
    category: "Branding",
    tags: ["Identity", "Strategy"],
  },
];

export function HomePage() {
  const { t } = useTranslation();

  // Services data with icons
  const services: ServiceItem[] = useMemo(
    () => [
      {
        icon: <UxInterfacesIcon />,
        title: t("homeUxInterfacesTitle"),
        description: t("homeUxInterfacesDescription"),
      },
      {
        icon: <CreativeDevelopmentIcon />,
        title: t("homeCreativeDevelopment"),
        description: t("homeCreativeDescription"),
      },
      {
        icon: <BrandingStrategyIcon />,
        title: t("homeStrategyBranding"),
        description: t("homeStrategyDescription"),
      },
      {
        icon: <EditorialIllustrationIcon />,
        title: t("homeIllustrationEditorial"),
        description: t("homeIllustrationDescription"),
      },
      {
        icon: <AiSolutionsIcon />,
        title: t("homeAiSolutionsTitle"),
        description: t("homeAiSolutionsDescription"),
      },
      {
        icon: <DesignSystemsIcon />,
        title: t("homeDesignSystemsTitle"),
        description: t("homeDesignSystemsDescription"),
      },
    ],
    [t]
  );

  return (
    <div>
      {/* Hero Section */}
      <HomeHero scrollTargetId="services" />

      {/* Services Section */}
      <ServicesSection
        id="services"
        title={t("homeExpertiseTitle", "What we do")}
        services={services}
        columns={3}
        cardVariant="bordered"
      />

      {/* Highlight Section (GenAI Schema) */}
      <HighlightSection
        cta={[
          {
            label: "Download Schema",
            onClick: () => {
              window.open(
                "https://petrilahdelma.gumroad.com/l/mcqoq",
                "_blank",
                "noopener,noreferrer"
              );
            },
          },
          {
            label: "Read Article",
            href: "https://medium.com/digitaltableteur/from-tokens-to-thinking-systems-making-ai-native-design-systems-actually-work-46a51931e8e0",
            target: "_blank",
            rel: "noopener noreferrer",
          },
        ]}
        description="Keep your AI-generated components consistent, predictable, and on-brand. This schema enforces shared prop structures, naming conventions, and design standards across your entire system."
        size="comfortable"
        title="Component Schema Template for GenAI Design Systems"
        variant="dots"
      />

      {/* Work Preview Section */}
      <WorkPreviewSection
        id="work"
        title={t("homeSelectedWork", "Selected work")}
        projects={FEATURED_PROJECTS}
        layout="featured"
        showViewAll
      />

      {/* Contact CTA Section */}
      <CTASection
        id="contact-cta"
        title={t("homeCtaTitle", "Ready to create something extraordinary?")}
        primaryAction={{
          label: t("homeCtaLink", "Let's talk"),
          href: "/contact",
        }}
        background="primary"
        align="center"
      />
    </div>
  );
}
