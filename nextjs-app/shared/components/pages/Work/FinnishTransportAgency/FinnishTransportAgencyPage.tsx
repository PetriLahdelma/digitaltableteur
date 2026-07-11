"use client";

import React from "react";
import Image from "next/image";
import { Text, Title } from "@digitaltableteur/react";
import ProcessBlock from "../../../../patterns/ProcessBlock";
import StoryBlock from "../../../../patterns/StoryBlock";
import GridBlock from "../../../../patterns/GridBlock";
import { ProjectDetailLayout } from "../../../../patterns/ProjectDetailLayout";
import { ProjectHero } from "../../../../patterns/ProjectHero";
import { RelatedProjects } from "../../../../patterns/RelatedProjects";
import { ProjectNav } from "../../../ProjectNav";
import { getProjectBySlug } from "../../../../data/projects";
import { ColorPalette } from "../../../FinnishTransportAgency/ColorPalette";
import { AdobeToolIcon } from "../AdobeToolIcon";

import styles from "./finnishTransportAgency.module.css";

export function FinnishTransportAgencyPage({ nav }: { nav?: React.ReactNode }) {
  const project = getProjectBySlug("finnish-transport-agency");

  if (!project) {
    return <div>Project not found</div>;
  }

  return (
    <ProjectDetailLayout
      nav={nav ?? <ProjectNav currentSlug={project.slug} />}
      hero={
        <ProjectHero
          title={project.title}
          description={project.description}
          image={{
            src: "/images/portfolio/finnish-transport-agency/logo-hero.webp",
            alt: "Liikennevirasto logo with cascading wordmark in four signature blues",
            width: 1240,
            height: 877,
          }}
          category={project.category.replace("-", " ")}
          tags={project.tags}
          variant="contained"
          showScrollIndicator={true}
          className={styles.hero}
        />
      }
      relatedProjects={<RelatedProjects currentSlug={project.slug} />}
      className={styles.page}
    >
      {/* Project Meta - Custom 2-column layout */}
      <section className={styles.metaSection}>
        <div className={styles.metaGrid}>
          <div className={styles.metaLeft}>
            <div className={styles.metaBlock}>
              <Title as="h3" unstyled className={styles.metaLabel}>Services</Title>
              <p className={styles.metaText}>
                Brand Identity, Logo System, Visual Guidelines and Multilingual Design
              </p>
            </div>
            <div className={styles.metaBlock}>
              <Title as="h3" unstyled className={styles.metaLabel}>Duration</Title>
              <p className={styles.metaText}>2009–2010</p>
            </div>
            <div className={styles.metaBlock}>
              <Title as="h3" unstyled className={styles.metaLabel}>Tools used</Title>
              <div className={styles.metaTools}>
                <AdobeToolIcon tool="illustrator" />
                <AdobeToolIcon tool="indesign" />
              </div>
            </div>
          </div>
          <div className={styles.metaRight}>
            <Title as="h3" unstyled className={styles.metaLabel}>Overview</Title>
            <p className={styles.metaOverview}>
              <strong>When Finland merged</strong> its Maritime Administration, Rail
              Administration, and Road Administration into a single transport agency,
              the new organization needed an identity that could unify three distinct
              cultures while serving citizens in Finnish, Swedish, and English.
            </p>
            <p className={styles.metaOverview}>
              <strong>The goal:</strong> Create a cohesive visual identity system
              that signals a fresh start for the merged organization, works across
              three official languages, and scales from business cards to highway
              signage.
            </p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className={styles.teamSection}>
        <div className={styles.teamContent}>
          <Title as="h3" unstyled className={styles.metaLabel}>Team</Title>
          <div className={styles.teamGrid}>
            <div className={styles.teamMember}>
              <Image
                src="/images/portfolio/helsinki-design-system/team/petri.png"
                alt=""
                width={80}
                height={80}
                className={styles.teamAvatar}
              />
              <span className={styles.teamName}>Petri Lahdelma</span>
              <span className={styles.teamRole}>Designer</span>
            </div>
            <div className={styles.teamMember}>
              <Image
                src="/images/portfolio/finnish-transport-agency/team/antti.png"
                alt=""
                width={80}
                height={80}
                className={styles.teamAvatar}
              />
              <span className={styles.teamName}>Antti Kivinen</span>
              <span className={styles.teamRole}>Designer</span>
            </div>
            <div className={styles.teamMember}>
              <Image
                src="/images/portfolio/finnish-transport-agency/team/yosi.png"
                alt=""
                width={80}
                height={80}
                className={styles.teamAvatar}
              />
              <span className={styles.teamName}>Yosi Bercovich</span>
              <span className={styles.teamRole}>Designer</span>
            </div>
          </div>
        </div>
      </section>

      {/* Design Process */}
      <div className={styles.processSection}>
        <ProcessBlock
          phases={[
            {
              title: "Discovery & Research",
              activities: [
                "Stakeholder interviews",
                "Legacy brand audit",
                "Competitor analysis",
                "Multilingual requirements",
              ],
            },
            {
              title: "Concept Development",
              activities: [
                "Name exploration",
                "Visual metaphors",
                "Wordmark sketches",
                "Color studies",
              ],
            },
            {
              title: "Identity Design",
              activities: [
                "Logo refinement",
                "Typography selection",
                "Color system",
                "Language lockups",
              ],
            },
            {
              title: "Guidelines & Rollout",
              activities: [
                "Brand guidelines",
                "Stationery design",
                "Signage templates",
                "Asset delivery",
              ],
            },
          ]}
          sectionTitle="Process"
          backgroundColor="transparent"
          maxWidth="lg"
          spacing="comfortable"
          columns={4}
        />
      </div>

      {/* The Concept */}
      <StoryBlock
        subtitle="Concept"
        title="The Conductor of Finland's Transport"
        content={[
          <Text key="p1" size="s">
            The logo structure is a graphic interpretation of a polyphonic musical
            score, positioning Liikennevirasto as the conductor orchestrating
            Finland's roads, rails, and waterways. The cascading word parts create
            a unique, human-friendly wordmark that signals a fresh start for the
            merged organization.
          </Text>,
          <Text key="p2" size="s">
            Unlike traditional government marks, the moving letters invite a second
            look. Staff and citizens get a memorable symbol that challenges
            expectations of what a transport agency can be.
          </Text>,
        ]}
        imageLayout="none"
        backgroundColor="transparent"
        maxWidth="lg"
        spacing="comfortable"
        className={styles.storySection}
      />

      {/* Language Versions */}
      <StoryBlock
        subtitle="Multilingual"
        title="Language Lockups"
        content={[
          <Text key="p1" size="s">
            The identity supports three official languages: Finnish (Liikennevirasto),
            Swedish (Trafikverket), and English (Finnish Transport Agency). Each
            lockup maintains the cascading wordmark with language descriptors in
            horizontal or vertical arrangements.
          </Text>,
        ]}
        images={{
          src: "/images/portfolio/finnish-transport-agency/language-lockups.webp",
          alt: "Four logo lockups showing Swedish and English variants in horizontal and vertical layouts",
          width: 1754,
          height: 1241,
          caption: "Language variants with locked descriptors for official documents",
        }}
        imageLayout="single"
        backgroundColor="transparent"
        maxWidth="lg"
        spacing="comfortable"
        className={styles.storySection}
      />

      {/* Protection Zones */}
      <StoryBlock
        subtitle="Construction"
        title="Minimum Clear Space"
        content={[
          <Text key="p1" size="s">
            The protection zone is defined by the height of the lowercase "i"
            as the base unit (x). A minimum of 5x clear space above and x on
            each side ensures the mark breathes across all applications, from
            business cards to highway signage.
          </Text>,
        ]}
        images={[
          {
            src: "/images/portfolio/finnish-transport-agency/safe-area.png",
            alt: "Logo construction showing clear space measurements with 5x above and x on sides",
            width: 1080,
            height: 1283,
            caption: "Clear space defined by x-height of lowercase i",
          },
          {
            src: "/images/portfolio/finnish-transport-agency/safe-area2.png",
            alt: "Protection zone grid applied to Swedish and English language variants",
            width: 1587,
            height: 1123,
            caption: "Clear space applied to language lockups",
          },
        ]}
        imageLayout="grid"
        backgroundColor="transparent"
        maxWidth="lg"
        spacing="comfortable"
        className={styles.storySection}
      />

      {/* Logo Usage Rules */}
      <StoryBlock
        subtitle="Guidelines"
        title="Usage Rules"
        content={[
          <Text key="p1" size="s">
            Five basic rules govern logo usage: always use official files, never
            modify element relationships, never alter colors, respect protection
            zones, and avoid adding effects like drop shadows or gradients. The
            guidelines show approved applications on various backgrounds.
          </Text>,
        ]}
        images={{
          src: "/images/portfolio/finnish-transport-agency/logo-usage-rules.webp",
          alt: "Logo usage examples showing correct and incorrect applications with checkmarks and X marks",
          width: 1754,
          height: 1241,
          caption: "Approved usage on white, tinted, and photographic backgrounds",
        }}
        imageLayout="single"
        backgroundColor="transparent"
        maxWidth="lg"
        spacing="comfortable"
        className={styles.storySection}
      />

      {/* Color System */}
      <section className={styles.colorSection}>
        <div className={styles.colorContent}>
          <Title level={3}>Color System</Title>
          <Text size="s" className={styles.colorIntro}>
            Four primary blues form the wordmark, supported by warm grays and
            accent colors. The palette was specified for Pantone (print), CMYK
            (process), and RGB (screen) to ensure consistency across all media.
          </Text>
          <ColorPalette showProportions={true} />
        </div>
      </section>

      {/* Typography */}
      <section className={styles.typographySection}>
        <div className={styles.typographyContent}>
          <Title level={3}>Typography</Title>
          <Text size="s" className={styles.typographyIntro}>
            The identity uses Agfa Monotype Felbridge Pro, designed by Robin
            Nicholas in 2003 specifically for electronic display. Its letter
            shapes reproduce clearly at low resolutions while maintaining elegance
            in print.
          </Text>
          <div className={styles.typographyWaterfall}>
            <div className={styles.waterfallItem}>
              <span className={styles.waterfallLabel}>Header</span>
              <span className={styles.waterfallHeader}>
                Moving Finland Forward
              </span>
            </div>
            <div className={styles.waterfallItem}>
              <span className={styles.waterfallLabel}>Subhead</span>
              <span className={styles.waterfallSubhead}>
                Connecting roads, rails, and waterways across the nation
              </span>
            </div>
            <div className={styles.waterfallItem}>
              <span className={styles.waterfallLabel}>Body</span>
              <span className={styles.waterfallBody}>
                The Finnish Transport Agency oversees the planning, construction,
                and maintenance of transport infrastructure. Our mission is to
                ensure safe, efficient, and sustainable mobility for all.
              </span>
            </div>
            <div className={styles.waterfallItem}>
              <span className={styles.waterfallLabel}>Caption</span>
              <span className={styles.waterfallCaption}>
                Photography: Maritime Administration Archives, 2009
              </span>
            </div>
          </div>
          <Text size="s" className={styles.typographyNote}>
            Specimen rendered in Felbridge Pro, designed by Robin Nicholas for Agfa Monotype.
          </Text>
        </div>
      </section>

      {/* Stamp Logos */}
      <StoryBlock
        subtitle="Official Seals"
        title="Stamp Logos"
        content={[
          <Text key="p1" size="s">
            For official documents and certificates, circular stamp variations
            combine the wordmark with trilingual descriptors. Different center
            treatments (open, filled, arrow, striped) allow hierarchical
            distinction between document types.
          </Text>,
        ]}
        images={{
          src: "/images/portfolio/finnish-transport-agency/stamp-logos.webp",
          alt: "Five circular stamp logo variations for official documents",
          width: 2481,
          height: 1754,
          caption: "Stamp variations for certificates, approvals, and official seals",
        }}
        imageLayout="single"
        backgroundColor="transparent"
        maxWidth="lg"
        spacing="comfortable"
        className={styles.storySection}
      />

      {/* Applications Grid */}
      <section className={styles.applicationsSection}>
        <div className={styles.applicationsHeader}>
          <Title level={3}>Applications</Title>
        </div>
        <div className={styles.applicationsGrid}>
          <figure className={styles.appItem}>
            <Image
              src="/images/portfolio/finnish-transport-agency/letterhead.webp"
              alt="Official letterhead with logo and structured layout"
              width={1241}
              height={1754}
              className={styles.appImage}
            />
            <figcaption className={styles.appCaption}>
              Letterhead with Swedish co-branding
            </figcaption>
          </figure>
          <figure className={styles.appItem}>
            <Image
              src="/images/portfolio/finnish-transport-agency/security-pass.webp"
              alt="Employee security pass with angular blue geometric shapes"
              width={505}
              height={322}
              className={styles.appImage}
            />
            <figcaption className={styles.appCaption}>
              Security pass with geometric accents
            </figcaption>
          </figure>
          <figure className={styles.appItem}>
            <Image
              src="/images/portfolio/finnish-transport-agency/rail-poster.webp"
              alt="Trilingual rail replacement bus information poster"
              width={2953}
              height={4134}
              className={styles.appImage}
            />
            <figcaption className={styles.appCaption}>
              Rail service poster with VR co-branding
            </figcaption>
          </figure>
        </div>
      </section>

      {/* Maritime Connection */}
      <GridBlock
        columns={2}
        gap="medium"
        backgroundColor="transparent"
        maxWidth="lg"
        spacing="comfortable"
        className={styles.maritimeGrid}
        cells={[
          {
            type: "image",
            src: "/images/portfolio/finnish-transport-agency/080628_Porkkalan_majakka11.jpg",
            alt: "Porkkala lighthouse on rocky Finnish coastline",
            width: 1200,
            height: 800,
            caption: "Porkkala lighthouse, one of many coastal assets",
          },
          {
            type: "image",
            src: "/images/portfolio/finnish-transport-agency/lighthouse-publication.webp",
            alt: "Finnish List of Lights 2010 publication cover and back",
            width: 2481,
            height: 1754,
            caption: "Finnish List of Lights 2010",
          },
        ]}
      />

      {/* Outcome */}
      <StoryBlock
        subtitle="Outcome"
        title="One Voice for Three Modes"
        content={[
          <Text key="p1" size="s">
            The identity unified three historically separate agencies under a
            single visual language. The musical score concept gave staff across
            road, rail, and maritime divisions a shared symbol, one that
            communicates movement, coordination, and national reach.
          </Text>,
          <Text key="p2" size="s">
            Trilingual support (Finnish, Swedish, English) ensures accessibility
            for all citizens, while strict construction rules maintain consistency
            from business cards to highway signs. The system scaled successfully
            across print, digital, environmental, and publication applications.
          </Text>,
        ]}
        imageLayout="none"
        backgroundColor="transparent"
        maxWidth="lg"
        spacing="comfortable"
        className={styles.outcomesSection}
      />

      {/* Key Results */}
      <section className={styles.resultsSection}>
        <div className={styles.resultsContent}>
          <Title level={3}>Key Results</Title>
          <div className={styles.resultsGrid}>
            <div className={styles.resultItem}>
              <span className={styles.resultValue}>3</span>
              <span className={styles.resultLabel}>Agencies Unified</span>
              <span className={styles.resultDetail}>
                Road, Rail, and Maritime administrations merged under one identity
              </span>
            </div>
            <div className={styles.resultItem}>
              <span className={styles.resultValue}>650</span>
              <span className={styles.resultLabel}>Employees</span>
              <span className={styles.resultDetail}>
                Staff from three distinct cultures united
              </span>
            </div>
            <div className={styles.resultItem}>
              <span className={styles.resultValue}>€2.1B</span>
              <span className={styles.resultLabel}>Annual Budget</span>
              <span className={styles.resultDetail}>
                Infrastructure investment managed under the new brand
              </span>
            </div>
            <div className={styles.resultItem}>
              <span className={styles.resultValue}>78,000 km</span>
              <span className={styles.resultLabel}>Road Network</span>
              <span className={styles.resultDetail}>
                Highways maintained with consistent signage
              </span>
            </div>
            <div className={styles.resultItem}>
              <span className={styles.resultValue}>6,000 km</span>
              <span className={styles.resultLabel}>Rail Network</span>
              <span className={styles.resultDetail}>
                Railways branded with the new identity
              </span>
            </div>
            <div className={styles.resultItem}>
              <span className={styles.resultValue}>16,000 km</span>
              <span className={styles.resultLabel}>Waterways</span>
              <span className={styles.resultDetail}>
                Coastal and inland fairways under one mark
              </span>
            </div>
          </div>
        </div>
      </section>
    </ProjectDetailLayout>
  );
}
