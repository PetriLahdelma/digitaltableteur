"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import {
  Code,
  Sparkles,
  UserCheck,
  Network,
  ClipboardCheck,
  RefreshCw,
  KeyRound,
} from "lucide-react";
import {
  Trophy,
  HandsClapping,
  HeadCircuit,
  PuzzlePiece,
} from "@phosphor-icons/react";

import { AboutHero } from "../AboutHero";
import { ContentSection } from "../ContentSection";
import { ValuesSection, type ValueItem } from "../ValuesSection";
import { StatsSection } from "../../patterns/StatsSection/StatsSection";
import { ManifestoSection, type ManifestoToken } from "../ManifestoSection";
import { CTASection } from "../CTASection";

export interface AboutPageContentProps {
  /** Show CTA section at bottom */
  showCTA?: boolean;
  /** Custom className */
  className?: string;
}

/**
 * AboutPageContent component.
 */
export function AboutPageContent({
  showCTA = true,
  className,
}: AboutPageContentProps) {
  const { t, i18n } = useTranslation();

  // Value items for the expertise section
  const values: ValueItem[] = useMemo(
    () => [
      {
        icon: <Trophy className="w-6 h-6" />,
        title: t("aboutValueDesignTitle"),
        description: t("aboutValueDesignDescription"),
      },
      {
        icon: <Code className="w-6 h-6" />,
        title: t("aboutValueDevelopmentTitle"),
        description: t("aboutValueDevelopmentDescription"),
      },
      {
        icon: <HandsClapping className="w-6 h-6" />,
        title: t("aboutValueCollaborationTitle"),
        description: t("aboutValueCollaborationDescription"),
      },
      {
        icon: <HeadCircuit className="w-6 h-6" />,
        title: t("aboutValueAITitle"),
        description: t("aboutValueAIDescription"),
      },
      {
        icon: <PuzzlePiece className="w-6 h-6" />,
        title: t("aboutValueSystemsTitle"),
        description: t("aboutValueSystemsDescription"),
      },
      {
        icon: <Sparkles className="w-6 h-6" />,
        title: t("aboutValueCraftTitle"),
        description: t("aboutValueCraftDescription"),
      },
    ],
    [t, i18n.language],
  );

  // "How we deliver at scale" — addresses enterprise-buyer concerns
  // (continuity, governance, ownership) beyond a single-person dependency.
  const deliveryValues: ValueItem[] = useMemo(
    () => [
      {
        icon: <UserCheck className="w-6 h-6" />,
        title: t("aboutDeliverySeniorTitle"),
        description: t("aboutDeliverySeniorDescription"),
      },
      {
        icon: <Network className="w-6 h-6" />,
        title: t("aboutDeliveryNetworkTitle"),
        description: t("aboutDeliveryNetworkDescription"),
      },
      {
        icon: <ClipboardCheck className="w-6 h-6" />,
        title: t("aboutDeliveryGovernanceTitle"),
        description: t("aboutDeliveryGovernanceDescription"),
      },
      {
        icon: <RefreshCw className="w-6 h-6" />,
        title: t("aboutDeliveryContinuityTitle"),
        description: t("aboutDeliveryContinuityDescription"),
      },
      {
        icon: <KeyRound className="w-6 h-6" />,
        title: t("aboutDeliveryOwnershipTitle"),
        description: t("aboutDeliveryOwnershipDescription"),
      },
    ],
    [t, i18n.language],
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
    [t, i18n.language],
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

      {/* Values/Expertise Section */}
      <ValuesSection
        title={t("aboutValuesTitle")}
        subtitle={t("aboutValuesSubtitle")}
        values={values}
        cardVariant="bordered"
        background="muted"
      />

      {/* Stats Section */}
      <StatsSection
        stats={[
          { value: 20, suffix: "+", label: t("statsYearsExperience", "Years of experience"), duration: 2 },
          { value: 8, suffix: "K+", label: t("statsComponentsBuilt", "Design system components built"), duration: 2.5 },
          { value: 300, suffix: "+", label: t("statsProjectsDelivered", "Projects delivered"), duration: 2 },
        ]}
        background="primary"
      />

      {/* How we deliver at scale */}
      <ValuesSection
        title={t("aboutDeliveryTitle")}
        subtitle={t("aboutDeliverySubtitle")}
        values={deliveryValues}
        cardVariant="bordered"
        background="default"
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
        centered
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
        centered
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
        centered
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
