"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";

// Patterns
import { HomeHero } from "../../../patterns/HomeHero";
import {
  ServicesSection,
  type ServiceItem,
} from "../../../patterns/ServicesSection";
import {
  WorkPreviewSection,
  type ProjectItem,
} from "../../../patterns/WorkPreviewSection";
import { CTASection } from "../../../patterns/CTASection";
import { DesignSprintsSection } from "../../../patterns/DesignSprintsSection";
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

// Featured projects for homepage
const FEATURED_PROJECTS: ProjectItem[] = [
  {
    title: "Helsinki Design System",
    slug: "helsinki-design-system",
    thumbnail: "/images/portfolio/helsinki-design-system/HDS_logo.png",
    category: "Design Systems",
    tags: ["Design System", "Accessibility", "React"],
  },
  {
    title: "SAP Build Apps Design System",
    slug: "sap-build-apps",
    thumbnail: "/images/portfolio/sap-build-apps/Build Product Icon_1000px.png",
    category: "Design Systems",
    tags: ["Enterprise", "Low-Code", "SAP BTP"],
  },
  {
    title: "New Things Co",
    slug: "new-things-co",
    thumbnail: "/images/portfolio/new_things_co/new_things_co_item.webp",
    category: "Branding",
    tags: ["Branding", "Web Design", "Identity"],
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
    [t],
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

      {/* Design Sprints Section */}
      <DesignSprintsSection id="design-sprints" />

      {/* Highlight Section (GenAI Schema) */}
      <HighlightSection
        cta={[
          {
            label: t("homeHighlightCtaDownload", "Download Schema"),
            onClick: () => {
              window.open(
                "https://petrilahdelma.gumroad.com/l/mcqoq",
                "_blank",
                "noopener,noreferrer",
              );
            },
          },
          {
            label: t("homeHighlightCtaArticle", "Read Article"),
            href: "https://medium.com/digitaltableteur/from-tokens-to-thinking-systems-making-ai-native-design-systems-actually-work-46a51931e8e0",
            target: "_blank",
            rel: "noopener noreferrer",
          },
        ]}
        description={t(
          "homeHighlightDescription",
          "Keep your AI-generated components consistent, predictable, and on-brand. This schema enforces shared prop structures, naming conventions, and design standards across your entire system.",
        )}
        size="comfortable"
        title={t(
          "homeHighlightTitle",
          "Component Schema Template for GenAI Design Systems",
        )}
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
