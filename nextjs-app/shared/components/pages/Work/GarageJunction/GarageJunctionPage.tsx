"use client";

import React from "react";
import Image from "next/image";
import Text from "@dt/Text";
import Title from "@dt/Title";
import ProcessBlock from "../../../../patterns/ProcessBlock";
import StoryBlock from "../../../../patterns/StoryBlock";
import { ProjectDetailLayout } from "../../../../patterns/ProjectDetailLayout";
import { ProjectHero } from "../../../../patterns/ProjectHero";
import { RelatedProjects } from "../../../../patterns/RelatedProjects";
import { ProjectNav } from "../../../ProjectNav";
import { getProjectBySlug } from "../../../../data/projects";
import { SiFigma, SiAdobeillustrator, SiAdobeaftereffects } from "react-icons/si";

import styles from "./garageJunction.module.css";

export function GarageJunctionPage({ nav }: { nav?: React.ReactNode }) {
  const project = getProjectBySlug("garage-junction");

  if (!project) {
    return <div>Project not found</div>;
  }

  return (
    <ProjectDetailLayout
      nav={nav ?? <ProjectNav currentSlug={project.slug} />}
      hero={
        <ProjectHero
          title={project.title}
          description="Brand identity and event promotion for an underground music event series at Merikerho, Helsinki. Capturing the raw energy of UK garage culture with a Nordic twist."
          image={{
            src: "/images/portfolio/garage_junction/gallery/gj_horiz@2x.webp",
            alt: "Garage Junction event brand horizontal lockup",
            width: 1200,
            height: 600,
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
              <h3 className={styles.metaLabel}>Services</h3>
              <p className={styles.metaText}>
                Brand Identity, Event Visuals, Sound Design and Social Media Assets
              </p>
            </div>
            <div className={styles.metaBlock}>
              <h3 className={styles.metaLabel}>Duration</h3>
              <p className={styles.metaText}>2018</p>
            </div>
            <div className={styles.metaBlock}>
              <h3 className={styles.metaLabel}>Tools used</h3>
              <div className={styles.metaTools}>
                <SiFigma size={24} title="Figma" />
                <SiAdobeillustrator size={24} title="Illustrator" />
                <SiAdobeaftereffects size={24} title="After Effects" />
              </div>
            </div>
          </div>
          <div className={styles.metaRight}>
            <h3 className={styles.metaLabel}>Overview</h3>
            <p className={styles.metaOverview}>
              <strong>Garage Junction</strong> was a collaborative event series
              launched at Merikerho, Helsinki, in 2018. The project brought together
              music lovers, artists, and creative professionals for club nights
              celebrating underground music and visual arts.
            </p>
            <p className={styles.metaOverview}>
              <strong>The vision:</strong> Create an inclusive platform capturing
              the raw energy and diversity of Helsinki&apos;s nightlife with a UK
              garage twist. The brand identity needed to be bold, memorable, and
              flexible for both digital and print promotion.
            </p>
          </div>
        </div>
      </section>

      {/* Design Process */}
      <div className={styles.processSection}>
        <ProcessBlock
          phases={[
            {
              title: "Research & Discovery",
              activities: [
                "Scene analysis",
                "Audience research",
                "Competitor mapping",
                "Vision workshops",
              ],
            },
            {
              title: "Brand Strategy",
              activities: [
                "Name development",
                "Brand positioning",
                "Tone of voice",
                "Visual direction",
              ],
            },
            {
              title: "Visual Identity",
              activities: [
                "Logo design",
                "Color system",
                "Pattern library",
                "Motion graphics",
              ],
            },
            {
              title: "Launch & Support",
              activities: [
                "Event materials",
                "Social templates",
                "Sound design",
                "Ongoing assets",
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
        subtitle="The Concept"
        title="Where Underground Meets Helsinki"
        content={[
          <Text key="p1" size="S">
            The name "Garage Junction" references both UK garage music and the
            idea of a meeting point for diverse sounds and people. The visual
            identity uses bold typography and a checkerboard pattern inspired
            by the Helsinki Underground/Subway, or as Finns call it, the metro
            and its high-contrast two-tone aesthetics.
          </Text>,
          <Text key="p2" size="S">
            The color palette combines high-energy orange with soft blue and
            clean white, creating contrast that works across dark club
            environments and bright social media feeds.
          </Text>,
        ]}
        imageLayout="none"
        backgroundColor="transparent"
        maxWidth="lg"
        spacing="comfortable"
        className={styles.storySection}
      />

      {/* Video Section - Promo Video */}
      <section className={styles.videoSection}>
        <div className={styles.videoContainer}>
          <video
            aria-label="Garage Junction promotional video with original sound design"
            controls
            playsInline
            poster="/images/portfolio/garage_junction/gallery/gj_horiz@2x.webp"
          >
            <source
              src="/images/portfolio/garage_junction/gallery/garage_junction_ad_video.webm"
              type="video/webm"
            />
            <source
              src="/images/portfolio/garage_junction/gallery/garage_junction_ad_video.mp4"
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>
          <p className={styles.videoCaption}>
            Promotional video with original sound design and motion graphics
          </p>
        </div>
      </section>

      {/* Brand Identity */}
      <StoryBlock
        subtitle="Brand Identity"
        title="Bold and Flexible"
        content={[
          <Text key="p1" size="S">
            <span style={{ fontWeight: 600 }}>
              The logo system was designed for maximum impact
            </span>{" "}
            in both horizontal and vertical formats. The checkerboard pattern
            provides a distinctive secondary element that can be used as
            backgrounds, borders, or accent graphics.
          </Text>,
        ]}
        images={[
          {
            src: "/images/portfolio/garage_junction/gallery/gj_horiz2@2x.webp",
            alt: "Garage Junction horizontal logo on dark background",
            width: 1200,
            height: 600,
            caption: "Horizontal lockup for wide formats",
          },
          {
            src: "/images/portfolio/garage_junction/gallery/gj_vert@2x.webp",
            alt: "Garage Junction vertical logo stack",
            width: 600,
            height: 800,
            caption: "Vertical lockup for posters",
          },
        ]}
        imageLayout="grid"
        backgroundColor="transparent"
        maxWidth="lg"
        spacing="comfortable"
        className={styles.brandSection}
      />

      {/* Color Palette */}
      <section className={styles.colorSection}>
        <div className={styles.colorContent}>
          <Title level={3} terminals="sans">Color Palette</Title>
          <Text size="S">
            High contrast colors optimized for club environments and social media.
          </Text>
          <div className={styles.colorComposition}>
            <div className={styles.colorBlack}>
              <span className={styles.colorLabel}>Black #000</span>
            </div>
            <div className={styles.colorRed}>
              <span className={styles.colorLabel}>Metro Red #FF0000</span>
            </div>
            <div className={styles.colorBlue}>
              <span className={styles.colorLabel}>Garage Blue #1976D2</span>
            </div>
            <div className={styles.colorWhite}>
              <span className={`${styles.colorLabel} ${styles.colorLabelDark}`}>Pure White #FFFFFF</span>
            </div>
            <div className={styles.colorOrange}>
              <span className={styles.colorLabel}>Junction Orange #F57C00</span>
            </div>
          </div>
        </div>
      </section>

      {/* Social Media Assets */}
      <StoryBlock
        subtitle="Social Media"
        title="Event Promotion"
        content={[
          <Text key="p1" size="S">
            Square format assets for Instagram and Facebook with consistent
            branding. Each post maintains the bold visual identity while
            allowing space for event-specific details and guest DJ information.
          </Text>,
        ]}
        images={[
          {
            src: "/images/portfolio/garage_junction/gallery/social_square@2x.webp",
            alt: "Garage Junction social media post design 1",
            width: 800,
            height: 800,
            caption: "Event announcement",
          },
          {
            src: "/images/portfolio/garage_junction/gallery/social_square2@2x.webp",
            alt: "Garage Junction social media post design 2",
            width: 800,
            height: 800,
            caption: "DJ lineup announcement",
          },
          {
            src: "/images/portfolio/garage_junction/gallery/social_square3@2x.webp",
            alt: "Garage Junction social media post design 3",
            width: 800,
            height: 800,
            caption: "Event countdown",
          },
          {
            src: "/images/portfolio/garage_junction/gallery/check_pattern@2x.webp",
            alt: "Garage Junction checkerboard pattern",
            width: 800,
            height: 800,
            caption: "Brand pattern",
          },
        ]}
        imageLayout="grid"
        backgroundColor="light"
        maxWidth="lg"
        spacing="comfortable"
        className={styles.storySection}
      />

      {/* Applications Section */}
      <section className={styles.applicationsSection}>
        <div className={styles.applicationsHeader}>
          <Title level={3} terminals="sans">Applications</Title>
        </div>
        <div className={styles.applicationsGrid}>
          <figure className={styles.appItem}>
            <Image
              src="/images/portfolio/garage_junction/gallery/poster_vert@2x.webp"
              alt="Garage Junction event poster"
              width={600}
              height={800}
              className={styles.appImage}
            />
            <figcaption className={styles.appCaption}>
              Mobile teaser for Instagram
            </figcaption>
          </figure>
          <div className={styles.appStack}>
            <figure className={styles.appItem}>
              <Image
                src="/images/portfolio/garage_junction/gallery/application@2x.webp"
                alt="Garage Junction brand application mockup"
                width={1200}
                height={800}
                className={styles.appImage}
              />
              <figcaption className={styles.appCaption}>
                Brand application mockup
              </figcaption>
            </figure>
            <figure className={styles.appItem}>
              <Image
                src="/images/portfolio/garage_junction/gallery/colors@2x.webp"
                alt="Garage Junction color system documentation"
                width={1200}
                height={600}
                className={styles.appImage}
              />
              <figcaption className={styles.appCaption}>
                Color system documentation
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* Outcome */}
      <StoryBlock
        subtitle="Outcome"
        title="Building a Scene"
        content={[
          <Text key="p1" size="S">
            Garage Junction quickly gained recognition as a fresh and authentic
            addition to Helsinki&apos;s nightlife. The brand identity helped attract
            a loyal following and fostered a collaborative community around music
            and art.
          </Text>,
          <Text key="p2" size="S">
            The flexible design system allowed for easy event-to-event variation
            while maintaining strong brand recognition across all touchpoints.
          </Text>,
        ]}
        imageLayout="none"
        backgroundColor="transparent"
        maxWidth="lg"
        spacing="comfortable"
        className={styles.outcomesSection}
      />

      {/* Results Section */}
      <section className={styles.resultsSection}>
        <div className={styles.resultsContent}>
          <Title level={3} terminals="sans">Key Results</Title>
          <div className={styles.resultsGrid}>
            <div className={styles.resultItem}>
              <span className={styles.resultValue}>Merikerho</span>
              <span className={styles.resultLabel}>Launch Venue</span>
              <span className={styles.resultDetail}>
                Historic Helsinki yacht club turned event space
              </span>
            </div>
            <div className={styles.resultItem}>
              <span className={styles.resultValue}>2018</span>
              <span className={styles.resultLabel}>Series Launch</span>
              <span className={styles.resultDetail}>
                Successful debut in Helsinki club scene
              </span>
            </div>
            <div className={styles.resultItem}>
              <span className={styles.resultValue}>Sound</span>
              <span className={styles.resultLabel}>Original Design</span>
              <span className={styles.resultDetail}>
                Custom audio branding for promo videos
              </span>
            </div>
            <div className={styles.resultItem}>
              <span className={styles.resultValue}>UK</span>
              <span className={styles.resultLabel}>Garage Influence</span>
              <span className={styles.resultDetail}>
                Bringing two-tone aesthetic to Nordic nightlife
              </span>
            </div>
          </div>
        </div>
      </section>
    </ProjectDetailLayout>
  );
}
