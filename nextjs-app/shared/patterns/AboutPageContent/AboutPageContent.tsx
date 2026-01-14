"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Palette, Code2, Users, Sparkles, Brain, Layers } from "lucide-react";

import { AboutHero } from "../AboutHero";
import { ContentSection } from "../ContentSection";
import { ValuesSection, type ValueItem } from "../ValuesSection";
import { ManifestoSection, type ManifestoToken } from "../ManifestoSection";
import { CTASection } from "../CTASection";

export interface AboutPageContentProps {
  /** Show CTA section at bottom */
  showCTA?: boolean;
  /** Custom className */
  className?: string;
}

export function AboutPageContent({
  showCTA = true,
  className,
}: AboutPageContentProps) {
  const { t, i18n } = useTranslation();

  // Value items for the expertise section
  const values: ValueItem[] = useMemo(
    () => [
      {
        icon: <Palette className="w-6 h-6" />,
        title: t("aboutValueDesignTitle"),
        description: t("aboutValueDesignDescription"),
      },
      {
        icon: <Code2 className="w-6 h-6" />,
        title: t("aboutValueDevelopmentTitle"),
        description: t("aboutValueDevelopmentDescription"),
      },
      {
        icon: <Users className="w-6 h-6" />,
        title: t("aboutValueCollaborationTitle"),
        description: t("aboutValueCollaborationDescription"),
      },
      {
        icon: <Brain className="w-6 h-6" />,
        title: t("aboutValueAITitle"),
        description: t("aboutValueAIDescription"),
      },
      {
        icon: <Layers className="w-6 h-6" />,
        title: t("aboutValueSystemsTitle"),
        description: t("aboutValueSystemsDescription"),
      },
      {
        icon: <Sparkles className="w-6 h-6" />,
        title: t("aboutValueCraftTitle"),
        description: t("aboutValueCraftDescription"),
      },
    ],
    [t, i18n.language]
  );

  // Manifesto tokens (intro + highlightable phrases)
  const manifestoTokens: ManifestoToken[] = useMemo(
    () => [
      { text: t("aboutManifestoIntro"), highlightable: false },
      { text: t("aboutManifestoPhrase1"), highlightable: true },
      { text: t("aboutManifestoPhrase2"), highlightable: true },
      { text: t("aboutManifestoPhrase3"), highlightable: true },
      { text: t("aboutManifestoPhrase4"), highlightable: true },
      { text: t("aboutManifestoPhrase5"), highlightable: true },
      { text: t("aboutManifestoPhrase6"), highlightable: true },
      { text: t("aboutManifestoPhrase7"), highlightable: true },
      { text: t("aboutManifestoPhrase8"), highlightable: true },
      { text: t("aboutManifestoPhrase9"), highlightable: true },
      { text: t("aboutManifestoPhrase10"), highlightable: true },
      { text: t("aboutManifestoPhrase11"), highlightable: true },
    ],
    [t, i18n.language]
  );

  return (
    <div className={cn("min-h-screen", className)}>
      {/* Hero Section */}
      <AboutHero
        title={t("aboutHeroTitle")}
        subtitle={t("aboutHeroSubtitle")}
        background="gradient"
        showScrollIndicator
      />

      {/* Story/Intro Section */}
      <ContentSection
        subtitle={t("aboutWhoSubtitle")}
        title={t("aboutWhoTitle")}
        content={
          <p className="text-lg text-muted-foreground leading-relaxed">
            {t("aboutWhoText")}
          </p>
        }
        background="default"
      />

      {/* Values/Expertise Section */}
      <ValuesSection
        title={t("aboutValuesTitle")}
        subtitle={t("aboutValuesSubtitle")}
        values={values}
        cardVariant="bordered"
        background="muted"
      />

      {/* What I Do - Design */}
      <ContentSection
        subtitle={t("aboutDesignSubtitle")}
        title={t("aboutDesignTitle")}
        content={
          <p className="text-muted-foreground leading-relaxed">
            {t("aboutDesignText")}
          </p>
        }
        background="default"
      />

      {/* What I Do - Development */}
      <ContentSection
        subtitle={t("aboutDevelopmentSubtitle")}
        title={t("aboutDevelopmentTitle")}
        content={
          <p className="text-muted-foreground leading-relaxed">
            {t("aboutDevelopmentText")}
          </p>
        }
        background="default"
      />

      {/* What I Do - Collaboration */}
      <ContentSection
        subtitle={t("aboutCollaborationSubtitle")}
        title={t("aboutCollaborationTitle")}
        content={
          <p className="text-muted-foreground leading-relaxed">
            {t("aboutCollaborationText")}
          </p>
        }
        background="default"
      />

      {/* Manifesto Section */}
      <ManifestoSection
        title={t("aboutManifestoTitle")}
        tokens={manifestoTokens}
        interval={2400}
        separator="✕"
        background="transparent"
      />

      {/* CTA Section */}
      {showCTA && (
        <CTASection
          title={t("aboutCTATitle")}
          description={t("aboutCTADescription")}
          primaryAction={{
            label: t("aboutCTAPrimaryLabel"),
            href: "/contact",
          }}
          secondaryAction={{
            label: t("aboutCTASecondaryLabel"),
            href: "/work",
          }}
          background="primary"
          align="center"
        />
      )}
    </div>
  );
}

AboutPageContent.displayName = "AboutPageContent";
