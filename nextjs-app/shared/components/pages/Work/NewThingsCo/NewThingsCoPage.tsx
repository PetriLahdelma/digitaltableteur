"use client";

import React from "react";
import Image from "next/image";
import Text from "@dt/Text";
import Title from "@dt/Title";
import Gallery from "@dt/Gallery";
import ProcessBlock from "../../../../patterns/ProcessBlock";
import StoryBlock from "../../../../patterns/StoryBlock";
import { ProjectDetailLayout } from "../../../../patterns/ProjectDetailLayout";
import { ProjectHero } from "../../../../patterns/ProjectHero";
import { RelatedProjects } from "../../../../patterns/RelatedProjects";
import { ProjectNav } from "../../../ProjectNav";
import { getProjectBySlug } from "../../../../data/projects";
import { SiFigma, SiReact } from "react-icons/si";
import { AdobeToolIcon } from "../AdobeToolIcon";

import styles from "./newThingsCo.module.css";

export function NewThingsCoPage({ nav }: { nav?: React.ReactNode }) {
  const project = getProjectBySlug("new-things-co");

  if (!project) {
    return <div>Project not found</div>;
  }

  return (
    <ProjectDetailLayout
      nav={nav ?? <ProjectNav currentSlug={project.slug} />}
      hero={
        <ProjectHero
          title={project.title}
          description="Complete brand identity and design system for a Helsinki-based software consultancy. From strategic positioning and visual identity to digital presence and internal culture assets."
          image={{
            src: "/images/portfolio/new_things_co/gallery/logo@2x.webp",
            alt: "New Things Co logo wordmark on white background",
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
              <Title as="h3" unstyled className={styles.metaLabel}>Services</Title>
              <p className={styles.metaText}>
                Brand Strategy, Visual Identity, Design System and Digital Presence
              </p>
            </div>
            <div className={styles.metaBlock}>
              <Title as="h3" unstyled className={styles.metaLabel}>Duration</Title>
              <p className={styles.metaText}>2017–2018</p>
            </div>
            <div className={styles.metaBlock}>
              <Title as="h3" unstyled className={styles.metaLabel}>Tools used</Title>
              <div className={styles.metaTools}>
                <SiFigma size={24} title="Figma" />
                <AdobeToolIcon tool="illustrator" />
                <SiReact size={24} title="React" />
              </div>
            </div>
          </div>
          <div className={styles.metaRight}>
            <Title as="h3" unstyled className={styles.metaLabel}>Overview</Title>
            <p className={styles.metaOverview}>
              <strong>New Things Co</strong> (originally Lab of New) approached us
              in September 2017 seeking to establish a cohesive brand identity that
              reflected their innovative approach to software development. The
              company was founded by Reaktor alumni and owned jointly with Talented.
            </p>
            <p className={styles.metaOverview}>
              <strong>The challenge:</strong> Create a complete rebrand from
              strategic pillars and core values through visual identity, down to
              the most minute details for marketing, events, recruitment, and
              company culture.
            </p>
          </div>
        </div>
      </section>

      {/* Design Process */}
      <div className={styles.processSection}>
        <ProcessBlock
          phases={[
            {
              title: "Discovery",
              activities: [
                "Stakeholder workshops",
                "Brand positioning",
                "Competitive analysis",
                "Values definition",
              ],
            },
            {
              title: "Strategy",
              activities: [
                "Name development",
                "Brand architecture",
                "Messaging framework",
                "Target audiences",
              ],
            },
            {
              title: "Identity Design",
              activities: [
                "Logo system",
                "Color palette",
                "Typography",
                "Visual language",
              ],
            },
            {
              title: "Delivery",
              activities: [
                "Brand guidelines",
                "Design system (React)",
                "Asset library",
                "Launch support",
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

      {/* The Challenge */}
      <StoryBlock
        subtitle="The Challenge"
        title="From Lab of New to New Things Co"
        content={[
          <Text key="p1" size="s">
            The existing identity lacked a unified visual language, making it
            challenging to communicate their values and expertise effectively.
            Their online presence needed a complete overhaul to match their
            ambition and culture.
          </Text>,
          <Text key="p2" size="s">
            The task was comprehensive: rename the company, establish strategic
            pillars and purpose, create the complete visual identity, and deliver
            all assets needed for marketing, events, recruitment, and internal
            culture over a 16-month period.
          </Text>,
        ]}
        imageLayout="none"
        backgroundColor="transparent"
        maxWidth="lg"
        spacing="comfortable"
        className={styles.storySection}
      />

      {/* Brand Identity */}
      <StoryBlock
        subtitle="Brand Identity"
        title="A Fresh Start for Innovation"
        content={[
          <Text key="p1" size="s">
            <span style={{ fontWeight: 600 }}>
              The name "New Things Co" captured their experimental spirit
            </span>{" "}
            while being memorable and approachable. The visual identity uses bold
            typography and a vibrant green palette that signals energy and growth.
          </Text>,
          <Text key="p2" size="s">
            The logo system was designed for flexibility across digital and print
            applications, from business cards to office signage and social media
            profiles.
          </Text>,
        ]}
        images={[
          {
            src: "/images/portfolio/new_things_co/gallery/concept.webp",
            alt: "New Things Co logo concept showing the mark in various applications",
            width: 1200,
            height: 800,
            caption: "Logo concept exploration",
          },
          {
            src: "/images/portfolio/new_things_co/gallery/colors@2x.webp",
            alt: "New Things Co brand color palette with primary green and supporting colors",
            width: 1200,
            height: 800,
            caption: "Brand color system",
          },
          {
            src: "/images/portfolio/new_things_co/gallery/typography@2x.webp",
            alt: "New Things Co typography system showing headline and body fonts",
            width: 1200,
            height: 800,
            caption: "Typography scale",
          },
        ]}
        imageLayout="grid"
        backgroundColor="transparent"
        maxWidth="lg"
        spacing="comfortable"
        className={styles.brandSection}
      />

      {/* Video Section - Brand Guidelines */}
      <section className={styles.videoSection}>
        <div className={styles.videoContainer}>
          <video
            aria-label="New Things Co Brand Guidelines video walkthrough"
            autoPlay
            loop
            muted
            playsInline
            poster="/images/portfolio/new_things_co/gallery/ntc_guidelines_poster.png"
          >
            <source
              src="/images/portfolio/new_things_co/gallery/ntc_guidelines_short.webm"
              type="video/webm"
            />
            <source
              src="/images/portfolio/new_things_co/gallery/ntc_guidelines_short.mp4"
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>
          <p className={styles.videoCaption}>
            Brand guidelines delivered in Figma with comprehensive documentation
          </p>
        </div>
      </section>

      {/* Stationery and Print */}
      <StoryBlock
        subtitle="Print Collateral"
        title="Business Cards & Stationery"
        content={[
          <Text key="p1" size="s">
            The stationery system uses recycled paper stock to align with the
            company&apos;s environmental values. Business cards feature a bold,
            minimal design with the logo on one side and contact details on
            the other.
          </Text>,
        ]}
        images={[
          {
            src: "/images/portfolio/new_things_co/gallery/NewThingsCo_Business-Card_recycled2.webp",
            alt: "New Things Co business cards on recycled paper stock",
            width: 1200,
            height: 800,
            caption: "Business cards on recycled paper",
          },
          {
            src: "/images/portfolio/new_things_co/gallery/NTC_Letterhead-and-envelope.webp",
            alt: "New Things Co letterhead and envelope design",
            width: 1200,
            height: 800,
            caption: "Letterhead and envelope",
          },
        ]}
        imageLayout="grid"
        backgroundColor="light"
        maxWidth="lg"
        spacing="comfortable"
        className={styles.printSection}
      />

      {/* Digital Presence */}
      <StoryBlock
        subtitle="Digital Presence"
        title="Website & Social Media"
        content={[
          <Text key="p1" size="s">
            The website design reflects the brand&apos;s personality: bold,
            direct, and human. Social media templates ensure consistent
            presentation across platforms for recruitment, events, and company
            updates.
          </Text>,
        ]}
        images={{
          src: "/images/portfolio/new_things_co/gallery/site@2x.webp",
          alt: "New Things Co website homepage design",
          width: 1200,
          height: 800,
          caption: "Website homepage with bold typography",
        }}
        imageLayout="single"
        backgroundColor="transparent"
        maxWidth="lg"
        spacing="comfortable"
        className={styles.storySection}
      />

      {/* Applications Section */}
      <section className={styles.applicationsSection}>
        <div className={styles.applicationsHeader}>
          <Title level={3}>Applications</Title>
        </div>
        <div className={styles.applicationsGrid}>
          <figure className={styles.appItem}>
            <Image
              src="/images/portfolio/new_things_co/gallery/presentation_template@2x.webp"
              alt="New Things Co presentation template title slide"
              width={1200}
              height={675}
              className={styles.appImage}
            />
            <figcaption className={styles.appCaption}>
              Presentation title slide
            </figcaption>
          </figure>
          <figure className={styles.appItem}>
            <Image
              src="/images/portfolio/new_things_co/gallery/presentation_template2@2x.webp"
              alt="New Things Co presentation people slide"
              width={1200}
              height={675}
              className={styles.appImage}
            />
            <figcaption className={styles.appCaption}>
              Team introduction slide
            </figcaption>
          </figure>
          <figure className={styles.appItem}>
            <Image
              src="/images/portfolio/new_things_co/gallery/NTC-Flag.webp"
              alt="New Things Co office flag"
              width={800}
              height={600}
              className={styles.appImage}
            />
            <figcaption className={styles.appCaption}>
              Office flag for HQ entrance
            </figcaption>
          </figure>
        </div>
      </section>

      {/* Gallery - Extended Assets */}
      <section className={styles.gallerySection}>
        <div className={styles.galleryHeader}>
          <Title level={3}>Culture & Merch</Title>
          <Text size="s">
            Internal culture assets including apparel, event materials, and office
            decorations helped build team identity and employer brand.
          </Text>
        </div>
        <div className={styles.galleryContent}>
          <Gallery
            gutter={24}
            minColumnWidth={280}
            images={[
              {
                src: "/images/portfolio/new_things_co/gallery/ntc_t_shirts.webp",
                alt: "New Things Co branded t-shirts and gym shirts",
              },
              {
                src: "/images/portfolio/new_things_co/gallery/ntc_sweatshirt.webp",
                alt: "New Things Co branded sweatshirt",
              },
              {
                src: "/images/portfolio/new_things_co/gallery/kapteeni.webp",
                alt: "CEO wearing New Things Co Croatia trip t-shirt",
              },
              {
                src: "/images/portfolio/new_things_co/gallery/IMG_8817.webp",
                alt: "HQ interior with custom illustrations by Jukka Peltosaari",
              },
              {
                src: "/images/portfolio/new_things_co/gallery/housewarming_eventbrite.webp",
                alt: "Housewarming party Eventbrite invitation",
              },
              {
                src: "/images/portfolio/new_things_co/gallery/rekry.png",
                alt: "Recruitment advertisement for social media",
              },
              {
                src: "/images/portfolio/new_things_co/gallery/stranger_things_co.webp",
                alt: "Stranger Things Co parody logo for Halloween",
              },
              {
                src: "/images/portfolio/new_things_co/gallery/NEW_FRNDS_logo.png",
                alt: "NEW FRNDS logo for alumni network",
              },
            ]}
          />
        </div>
      </section>

      {/* Outcome */}
      <StoryBlock
        subtitle="Outcome"
        title="Establishing the Brand"
        content={[
          <Text key="p1" size="s">
            The branding work helped establish New Things Co as a fresh player in
            the Finnish IT market. The cohesive identity made recruitment easier
            and helped communicate their developer-first culture to potential
            clients and employees.
          </Text>,
          <Text key="p2" size="s">
            The company grew from the founding team to over 100 employees, with
            the brand system scaling across all touchpoints from digital presence
            to office environment and company events.
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
          <Title level={3}>Key Results</Title>
          <div className={styles.resultsGrid}>
            <div className={styles.resultItem}>
              <span className={styles.resultValue}>16</span>
              <span className={styles.resultLabel}>Month Project</span>
              <span className={styles.resultDetail}>
                Complete rebrand from strategy to launch
              </span>
            </div>
            <div className={styles.resultItem}>
              <span className={styles.resultValue}>100+</span>
              <span className={styles.resultLabel}>Team Members</span>
              <span className={styles.resultDetail}>
                Company growth enabled by strong employer brand
              </span>
            </div>
            <div className={styles.resultItem}>
              <span className={styles.resultValue}>React</span>
              <span className={styles.resultLabel}>Design System</span>
              <span className={styles.resultDetail}>
                Figma-based guidelines with React TS components
              </span>
            </div>
            <div className={styles.resultItem}>
              <span className={styles.resultValue}>2017</span>
              <span className={styles.resultLabel}>Brand Launch</span>
              <span className={styles.resultDetail}>
                Successful market entry in the Finnish IT sector
              </span>
            </div>
          </div>
        </div>
      </section>
    </ProjectDetailLayout>
  );
}
