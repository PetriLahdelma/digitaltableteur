"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";
import styles from "./Home.module.css";

// Above-fold patterns (eager)
import { HomeHero } from "../../../patterns/HomeHero";
import {
  ServicesSection,
  type ServiceItem,
} from "../../../patterns/ServicesSection";

// Below-fold patterns (lazy)
import { type ProjectItem } from "../../../patterns/WorkMagneticField";
const WorkMagneticField = dynamic(() =>
  import("../../../patterns/WorkMagneticField").then((m) => ({
    default: m.WorkMagneticField,
  })),
);
const CTASection = dynamic(() =>
  import("../../../patterns/CTASection").then((m) => ({
    default: m.CTASection,
  })),
);
const NewsBulletin = dynamic(() =>
  import("../../../patterns/NewsBulletin").then((m) => ({
    default: m.NewsBulletin,
  })),
);
const DesignSprintsSection = dynamic(() =>
  import("../../../patterns/DesignSprintsSection").then((m) => ({
    default: m.DesignSprintsSection,
  })),
);
const ClientLogoMarquee = dynamic(() =>
  import("../../ClientLogoMarquee").then((m) => ({
    default: m.ClientLogoMarquee,
  })),
);
const HighlightSection = dynamic(
  () => import("../../../patterns/HighlightSection"),
);

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
    title: "SAP Build Apps Design System",
    slug: "sap-build-apps",
    thumbnail: "/images/portfolio/sap-build-apps/Build Product Icon_1000px.png",
    category: "Design Systems",
    tags: ["Enterprise", "Low-Code", "Design System"],
  },
  {
    title: "Helsinki Design System",
    slug: "helsinki-design-system",
    thumbnail: "/images/portfolio/helsinki-design-system/HDS_logo.png",
    category: "Design Systems",
    tags: ["Design System", "Accessibility", "React"],
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
        donnyTarget: "home.services.designSystems",
      },
    ],
    [t],
  );

  return (
    <div>
      {/* Hero Section */}
      <HomeHero scrollTargetId="work" />

      {/* Work Preview Section */}
      <WorkMagneticField
        id="work"
        title={t("homeSelectedWork", "Selected work")}
        projects={FEATURED_PROJECTS}
        showViewAll
      />

      <section
        className="mx-auto w-full max-w-6xl px-6 py-12"
        data-donny-target="home.clients"
      >
        <div className="rounded-[2rem] border border-black/10 bg-white/70 p-6 shadow-sm backdrop-blur md:p-8 dark:border-white/10 dark:bg-neutral-950/60 hcb:border-white/30 hcb:bg-black [--selected-clients-label-color:rgb(4_27_35_/_70%)] [--selected-clients-divider-color:rgb(4_27_35_/_12%)] dark:[--selected-clients-label-color:rgb(255_255_255)] dark:[--selected-clients-divider-color:rgb(255_255_255_/_0.15)] hcb:[--selected-clients-label-color:rgb(0_0_0)] hcb:[--selected-clients-divider-color:rgb(0_0_0_/_0.18)] hcw:[--selected-clients-label-color:rgb(0_0_0)] hcw:[--selected-clients-divider-color:rgb(0_0_0_/_0.18)]">
          <p
            className={`${styles.selectedClientsLabel} text-[var(--selected-clients-label-color)] text-xs font-semibold uppercase tracking-[0.28em]`}
          >
            {t("homeSelectedClients")}
          </p>
          <div
            className={`${styles.selectedClientsDivider} mt-4 border-t border-t-[var(--selected-clients-divider-color)] pt-4`}
          >
            <ClientLogoMarquee ariaLabel={t("homeSelectedClientsAria")} />
          </div>
        </div>
      </section>

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

      {/* Contact CTA Section */}
      <CTASection
        id="contact-cta"
        donnyTarget="home.contactCta"
        title={t("homeCtaTitle", "Ready to create something extraordinary?")}
        primaryAction={{
          label: t("homeCtaLink", "Let's talk"),
          href: "/contact",
        }}
        background="primary"
        align="center"
      />

      <NewsBulletin />
    </div>
  );
}
