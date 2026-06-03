"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Section } from "../../components/Section";
import { Container } from "../../components/Container";
import { FadeIn } from "../../components/animations/FadeIn";
import { ContactHero } from "../ContactHero";
import { CVDownloadSection } from "../CVDownloadSection";
import Title from "@dt/Title";

// Dynamic import for MapSection - Leaflet is heavy (~150KB) and requires client-side only
const MapSection = dynamic(() => import("../MapSection").then(mod => mod.MapSection), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-muted text-muted-foreground font-body text-sm">
      Loading map...
    </div>
  ),
});
import { LocationCard } from "../../components/LocationCard";
import { EnhancedPersonCard } from "../../components/EnhancedPersonCard";
import { EnhancedContactForm } from "../../components/EnhancedContactForm";
import { ContactFormSuccess } from "../../components/ContactFormSuccess";

// Helsinki office coordinates
const HELSINKI_COORDINATES: [number, number] = [60.1810882006689, 24.952352100000002];

export interface ContactPageContentProps {
  /** Show the map section */
  showMap?: boolean;
  /** Show the CV download section */
  showCVDownload?: boolean;
  /** Custom className */
  className?: string;
}

export function ContactPageContent({
  showMap = true,
  showCVDownload = true,
  className,
}: ContactPageContentProps) {
  const { t } = useTranslation();
  const [showSuccess, setShowSuccess] = useState(false);

  const handleFormSuccess = () => {
    setShowSuccess(true);
  };

  const handleSendAnother = () => {
    setShowSuccess(false);
  };

  return (
    <div className={cn("min-h-screen", className)}>
      {/* Hero */}
      <ContactHero
        title={t("contactHeroTitle")}
        subtitle={t("contactHeroSubtitle", "")}
        background="minimal"
        compact
      />

      {/* Location + Map Section */}
      <Section spacing="lg" className="py-16">
        <Container size="lg">
          <FadeIn direction="up">
            <Title
              level={2}
              className="font-display font-semibold text-2xl tablet:text-3xl text-foreground mb-8"
            >
              {t("contactSectionHeading")}
            </Title>
          </FadeIn>

          <div className="grid grid-cols-1 desktop:grid-cols-2 gap-8">
            {/* Location Card */}
            <LocationCard
              officeName={t("contactHelsinkiOffice")}
              address={[
                t("contactAddressLine1"),
                t("contactAddressLine2"),
                t("contactAddressLine3"),
              ]}
              email="mail@digitaltableteur.com"
              variant="bordered"
            />

            {/* Map */}
            {showMap && (
              <FadeIn direction="up" delay={0.2}>
                <div className="rounded-lg overflow-hidden ring-1 ring-border h-[300px] desktop:h-full desktop:min-h-[300px]">
                  <MapSection
                    coordinates={HELSINKI_COORDINATES}
                    markerIcon="/dt-blue.svg"
                    popupText={t("contactHelsinkiOffice")}
                    zoom={20}
                    height="100%"
                    className="h-full"
                  />
                </div>
              </FadeIn>
            )}
          </div>
        </Container>
      </Section>

      {/* Person Card Section */}
      <Section spacing="lg" className="py-16 bg-muted/30">
        <Container size="md">
          <FadeIn direction="up">
            <Title
              level={2}
              className="font-display font-semibold text-xl tablet:text-2xl text-foreground mb-8 text-center"
            >
              {t("contactTitle")}
            </Title>
          </FadeIn>
          <div className="flex justify-center">
            <EnhancedPersonCard
              imageSrc="/pete.png"
              imageAlt={t("contactPersonAlt")}
              name={t("contactPersonName")}
              title={t("contactPersonTitle")}
              email="mail@digitaltableteur.com"
              linkedinUrl="https://www.linkedin.com/in/petrilahdelma/"
              linkedinLabel={t("contactLinkedInLabel")}
              githubUrl="https://github.com/PetriLahdelma"
              githubLabel={t("contactGitHubLabel")}
              mediumUrl="https://medium.com/digitaltableteur"
              mediumLabel={t("contactMediumLabel")}
              twitterUrl="https://x.com/dtdoesdesign"
              twitterLabel={t("footerAriaX")}
              dribbbleUrl="https://dribbble.com/digitaltableteur"
              dribbbleLabel={t("contactDribbbleLabel")}
              substackUrl="https://substack.com/@petrilahdelma"
              substackLabel={t("contactSubstackLabel")}
              variant="vertical"
              className="max-w-md"
            />
          </div>
        </Container>
      </Section>

      {/* Contact Form Section */}
      <Section spacing="lg" className="py-16">
        <Container size="sm">
          <FadeIn direction="up">
            <Title
              level={2}
              className="font-display font-semibold text-xl tablet:text-2xl text-foreground mb-4 text-center"
            >
              {t("contactFormTitle")}
            </Title>
            <p className="font-body text-muted-foreground text-center mb-8">
              {t("contactInfo")}{" "}
              <a
                href="mailto:mail@digitaltableteur.com"
                className="text-primary underline underline-offset-4 hover:text-primary/80"
              >
                mail@digitaltableteur.com
              </a>
            </p>
          </FadeIn>

          {showSuccess ? (
            <ContactFormSuccess
              title={t("contactFormSuccessTitle", "Thank you!")}
              message={t("contactFormSuccessMessage", "Your message has been sent successfully.")}
              responseTime={t("contactFormSuccessResponseTime", "We'll get back to you within 24-48 hours.")}
              onSendAnother={handleSendAnother}
              sendAnotherLabel={t("contactSendAnother", "Send another message")}
            />
          ) : (
            <EnhancedContactForm onSuccess={handleFormSuccess} />
          )}
        </Container>
      </Section>

      {/* CV Download Section */}
      {showCVDownload && (
        <CVDownloadSection
          title={t("resumeSectionTitle")}
          description={t("resumeSectionDescription")}
          email="mail@digitaltableteur.com"
          background="primary"
        />
      )}
    </div>
  );
}

ContactPageContent.displayName = "ContactPageContent";
