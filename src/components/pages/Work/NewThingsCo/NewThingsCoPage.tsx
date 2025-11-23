"use client";

import React from "react";

import Badge from "@dt/Badge";
import FlexBox from "@dt/FlexBox";
import Gallery from "@dt/Gallery";
import Grid from "@dt/Grid";
import PageLayout from "../../../../patterns/PageLayout/PageLayout";
import Title from "@dt/Title";
import WorkNav from "@dt/WorkNav";
import styles from "./newThingsCo.module.css";

export function NewThingsCoPage({ nav }: { nav?: React.ReactNode }) {
  return (
    <main className={styles.caseStudy}>
      {nav ?? <WorkNav />}
      <PageLayout maxWidth="lg" spacing="comfortable" as="section">
        <section className={styles.caseHeroSection}>
          <div className={styles.heroText}>
            <PageLayout maxWidth="lg" spacing="comfortable" as="section">
              <Title level={1}>New Things Co</Title>
              <FlexBox className={styles.caseBadges} gap={8}>
                <Badge size="s" design="secondary">
                  Branding
                </Badge>
                <Badge size="s" design="secondary">
                  Design System
                </Badge>
                <Badge size="s" design="secondary">
                  Web Design
                </Badge>
              </FlexBox>
            </PageLayout>
            <Grid columns={3} gap="2rem" style={{ marginBottom: "2rem" }}>
              <img
                src="/images/portfolio/new_things_co/gallery/logo@2x.webp"
                alt="New Things Co logo"
                style={{
                  width: "100%",
                  height: "auto",
                  gridColumn: "1 / span 3",
                }}
              />
              <img
                src="/images/portfolio/new_things_co/gallery/concept.webp"
                alt="New Things Co logo concept in use"
                style={{
                  width: "100%",
                  height: "auto",
                  gridColumn: "1 / span 3",
                }}
              />
              <div
                style={{
                  gridColumn: "1 / span 3",
                  marginBottom: "-0.5rem",
                }}
              >
                <video
                  aria-label="New Things Co animated HQ infoscreens"
                  autoPlay
                  loop
                  muted
                  playsInline
                  poster="/images/portfolio/new_things_co/gallery/animated_hq.png"
                  style={{
                    width: "100%",
                    height: "auto",
                    borderRadius: 0,
                  }}
                  onEnded={(e) => {
                    const vid = e.target as HTMLVideoElement;
                    vid.currentTime = 0;
                    vid.play().catch(() => {});
                  }}
                >
                  <source
                    src="/images/portfolio/new_things_co/gallery/animated_hq.webm"
                    type="video/webm"
                  />
                  <source
                    src="/images/portfolio/new_things_co/gallery/animated_hq.mp4"
                    type="video/mp4"
                  />
                  Your browser does not support the video tag.
                </video>
              </div>
              <img
                src="/images/portfolio/new_things_co/gallery/colors@2x.webp"
                alt="New Things Co identity colors"
                style={{
                  width: "100%",
                  height: "auto",
                  gridColumn: "1 / span 3",
                }}
              />
              <img
                src="/images/portfolio/new_things_co/gallery/typography@2x.webp"
                alt="New Things Co typography"
                style={{
                  width: "100%",
                  height: "auto",
                  gridColumn: "1 / span 3",
                }}
              />
              <img
                src="/images/portfolio/new_things_co/gallery/NewThingsCo_Business-Card_recycled2.webp"
                alt="New Things Co business card"
                style={{
                  width: "100%",
                  height: "auto",
                  gridColumn: "1 / span 3",
                }}
              />
              <img
                src="/images/portfolio/new_things_co/gallery/Bizcard_top_recycled.webp"
                alt="New Things Co business card front"
                style={{
                  width: "100%",
                  height: "auto",
                  gridColumn: "2 / span 1",
                }}
              />
              <img
                src="/images/portfolio/new_things_co/gallery/Bizcard_top_recycled_back.webp"
                alt="New Things Co business card back"
                style={{
                  width: "100%",
                  height: "auto",
                  gridColumn: "3 / span 1",
                }}
              />
              <img
                src="/images/portfolio/new_things_co/gallery/NTC_Letterhead-and-envelope.webp"
                alt="New Things Co letterhead and envelope"
                style={{
                  width: "100%",
                  height: "auto",
                  gridColumn: "2 / span 2",
                }}
              />
              <img
                src="/images/portfolio/new_things_co/gallery/site@2x.webp"
                alt="New Things Co website"
                style={{
                  width: "100%",
                  height: "auto",
                  gridColumn: "1 / span 3",
                }}
              />
              <img
                src="/images/portfolio/new_things_co/gallery/presentation_template@2x.webp"
                alt="New Things Co presentation template Title Slide"
                style={{
                  width: "100%",
                  height: "auto",
                  gridColumn: "1 / span 1",
                }}
              />
              <img
                src="/images/portfolio/new_things_co/gallery/presentation_template2@2x.webp"
                alt="New Things Co peresentation template People Slide"
                style={{
                  width: "100%",
                  height: "auto",
                  gridColumn: "2 / span 1",
                }}
              />
              <img
                src="/images/portfolio/new_things_co/gallery/presentation_template3@2x.webp"
                alt="New Things Co presentation template Timeline Slide"
                style={{
                  width: "100%",
                  height: "auto",
                  gridColumn: "3 / span 1",
                }}
              />
              <img
                src="/images/portfolio/new_things_co/gallery/ntc_t_shirts.webp"
                alt="New Things Co t-shirts and gym shirt"
                style={{
                  width: "100%",
                  height: "auto",
                  gridColumn: "1 / span 2",
                }}
              />
              <img
                src="/images/portfolio/new_things_co/gallery/ntc_sweatshirt.webp"
                alt="New Things Co Sweatshirt"
                style={{
                  width: "100%",
                  height: "auto",
                  gridColumn: "3 / span 1",
                }}
              />
            </Grid>
            <PageLayout maxWidth="md" spacing="comfortable" as="section">
              <div className={styles.heroSummary}>
                <p>
                  DT was first approached by New Things Co in September 2017, by
                  Sami, Jukkis and Kimmo. Back then the company was still called
                  Lab of New.
                </p>
                <br />
                <p>
                  They sought to establish a cohesive brand identity that
                  resonated with their innovative approach to software
                  development consulting. Their existing identity and online
                  presence lacked a unified visual language, making it
                  challenging to communicate their values and expertise
                  effectively.
                </p>
                <br />
                <p>
                  The task was the complete rebranding of the company name and
                  aesthetic. Starting from the strategic pillars, purpose, core
                  values following following visual identity, down to the most
                  minute details, applications and all the various other bits
                  and bobs for eg. marketing, events, recruitment and cultural
                  purposes.
                </p>
                <br />
                <p>
                  Both print and online assets were conceptualized, designed and
                  delivered during a 16 month period. DT also prepared Figma
                  based Brand Identity Guidelines and a Design System in React
                  TS. Most of the ground work was put in the strategic
                  positioning and differentiation from the competition.
                </p>
              </div>
            </PageLayout>
          </div>
          <div className={styles.heroVideo}>
            <video
              aria-label="New Things Co Identity Guidelines Video"
              autoPlay
              loop
              muted
              playsInline
              poster="/images/portfolio/new_things_co/gallery/ntc_guidelines_poster.png"
              style={{
                width: "100%",
                height: "auto",
                borderRadius: 0,
              }}
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
          </div>
        </section>
      </PageLayout>

      <PageLayout maxWidth="md" spacing="comfortable" as="section">
        <section className={styles.section}>
          <Title size="M" level={3} terminals="sans">
            Project Overview
          </Title>
          <div className={styles.twoCol}>
            <div>
              <p>
                New Things Co needed a new identity and digital presence to
                reflect their growth and vision. We collaborated closely to
                define their brand strategy, visual language, and digital
                experience.
              </p>
            </div>
            <div>
              <ul className={styles.projectMeta}>
                <li>
                  <strong>Client:</strong> New Things Co
                </li>
                <li>
                  <strong>Year:</strong> 2017
                </li>
                <li>
                  <strong>Services:</strong> Branding, Design System, Web Design
                </li>
              </ul>
            </div>
          </div>
        </section>
      </PageLayout>

      <PageLayout maxWidth="md" spacing="comfortable" as="section">
        <section className={styles.section}>
          <Title size="M" level={3} terminals="sans">
            Process
          </Title>
          <div className={styles.processSteps}>
            <div className={styles.processStep}>
              <Title level={4}>01. Discovery</Title>
              <p>
                Workshops and interviews to understand the brand, users, and
                goals.
              </p>
            </div>
            <div className={styles.processStep}>
              <Title level={4}>02. Strategy</Title>
              <p>Brand positioning, messaging, and visual direction.</p>
            </div>
            <div className={styles.processStep}>
              <Title level={4}>03. Design</Title>
              <p>Identity, design system, and website design.</p>
            </div>
            <div className={styles.processStep}>
              <Title level={4}>04. Delivery</Title>
              <p>Final assets, documentation, and launch support.</p>
            </div>
          </div>
        </section>
      </PageLayout>

      <PageLayout maxWidth="xl" spacing="default" as="section">
        <section className={styles.section}>
          <Gallery
            gutter={32}
            minColumnWidth={300}
            images={[
              {
                src: "/images/portfolio/new_things_co/gallery/housewarming_eventbrite.webp",
                fallback:
                  "/images/portfolio/new_things_co/gallery/housewarming_eventbrite.png",
                alt: "Housewarming Eventbrite invitation",
              },
              {
                src: "/images/portfolio/new_things_co/gallery/stranger_things_co.webp",
                fallback:
                  "/images/portfolio/new_things_co/gallery/stranger_things_co.jpg",
                alt: "Stranger Things Co parody logo",
              },
              {
                src: "/images/portfolio/new_things_co/gallery/lab-2.webp",
                fallback: "/images/portfolio/new_things_co/gallery/lab-2.png",
                alt: "LEGO Robots Lab badge design 1",
              },
              {
                src: "/images/portfolio/new_things_co/gallery/Envelope-back_figma.webp",
                fallback:
                  "/images/portfolio/new_things_co/gallery/Envelope-back_figma.png",
                alt: "New Things Co Envelope Back",
              },
              {
                src: "/images/portfolio/new_things_co/gallery/NTC-Flag.webp",
                fallback:
                  "/images/portfolio/new_things_co/gallery/NTC-Flag.png",
                alt: "NTC HQ Flag",
              },
              {
                src: "/images/portfolio/new_things_co/gallery/rekry.png",
                alt: "Recruitment advertisement on social media",
              },
              {
                src: "/images/portfolio/new_things_co/gallery/stickers_grid.png",
                alt: "New Things Co Sticker Designs",
              },
              {
                src: "/images/portfolio/new_things_co/gallery/NEW_FRNDS_logo.png",
                alt: "NEW FRNDS Logo for New Things Co alumni network",
              },
              {
                src: "/images/portfolio/new_things_co/gallery/kapteeni.webp",
                alt: "CEO wearing the New Things Co Croatia trip t-shirt",
              },
              {
                src: "/images/portfolio/new_things_co/gallery/IMG_8817.webp",
                alt: "HQ interior with New Things Co related illustrations by Jukka Peltosaari",
              },
              {
                src: "/images/portfolio/new_things_co/gallery/200 Devs 2.webp",
                alt: "Recruitment Advertisement for social media",
              },
              {
                src: "/images/portfolio/new_things_co/gallery/futures_cone_2.webp",
                alt: "Futures cone diagram for a workshop",
              },
            ]}
          />
        </section>
      </PageLayout>

      <PageLayout maxWidth="md" spacing="comfortable" as="section">
        <section className={styles.section}>
          <Title size="M" level={3} terminals="sans">
            Results
          </Title>
          <p>
            The branding efforts paid off and New Things Co was on its way to
            being established as the small but fierce new player in the Finnish
            ITC-market early 2018.
          </p>
          <br />
          <ul className={styles.resultsList}>
            <li>New brand identity and guidelines</li>
            <li>Comprehensive design system</li>
            <li>Modern, responsive online presence</li>
            <li>Improved brand recognition and engagement</li>
          </ul>
        </section>
      </PageLayout>
    </main>
  );
}
