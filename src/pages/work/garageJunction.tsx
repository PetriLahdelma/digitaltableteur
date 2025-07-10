import React from "react";
import styles from "./garageJunction.module.css";
import FlexBox from "@dt/FlexBox";
import Title from "@dt/Title";
import Badge from "@dt/Badge";
import Gallery from "@dt/Gallery";
import Grid from "@dt/Grid";
import WorkNav from "@dt/WorkNav";

const GarageJunction = () => (
  <main className={styles.caseStudy}>
    <WorkNav />
    <section className={styles.caseHeroSection}>
      <div className={styles.heroText}>
        <Title level={1}>Garage Junction</Title>
        <FlexBox className={styles.caseBadges} gap={8}>
          <Badge size="s" design="secondary">
            Branding
          </Badge>
          <Badge size="s" design="secondary">
            Event organization
          </Badge>
          <Badge size="s" design="secondary">
            Sound Design
          </Badge>
        </FlexBox>
        <Grid columns={4} gap="2rem" style={{ marginBottom: "2rem" }}>
          <div
            style={{
              gridColumn: "1 / span 4",
              marginBottom: "-0.5rem",
            }}
          >
            <video
              aria-label="Garage Junction insert audio-visual"
              controls
              loop={false}
              playsInline
              poster="/images/portfolio/garage_junction/gallery/gj_horiz@2x.webp"
              style={{
                width: "100%",
                height: "auto",
                borderRadius: 0,
              }}
              onEnded={(e) => {
                // Force loop in case browser fails to honor loop attribute
                const vid = e.target as HTMLVideoElement;
                vid.currentTime = 0;
                vid.play().catch(() => {});
              }}
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
          </div>
          <img
            src="/images/portfolio/garage_junction/gallery/social_square@2x.webp"
            alt="New Things Co logo"
            style={{
              width: "100%",
              height: "auto",
              gridColumn: "1 / span 1",
            }}
          />
          <img
            src="/images/portfolio/garage_junction/gallery/social_square2@2x.webp"
            alt="New Things Co logo"
            style={{
              width: "100%",
              height: "auto",
              gridColumn: "2 / span 1",
            }}
          />
          <img
            src="/images/portfolio/garage_junction/gallery/social_square3@2x.webp"
            alt="New Things Co logo"
            style={{
              width: "100%",
              height: "auto",
              gridColumn: "3 / span 1",
            }}
          />
          <img
            src="/images/portfolio/garage_junction/gallery/check_pattern@2x.webp"
            alt="New Things Co logo"
            style={{
              width: "100%",
              height: "auto",
              gridColumn: "4 / span 1",
            }}
          />
          <img
            src="/images/portfolio/garage_junction/gallery/colors@2x.webp"
            alt="Garage Junction identity colors"
            style={{
              width: "100%",
              height: "auto",
              gridColumn: "1 / span 4",
            }}
          />
          <img
            src="/images/portfolio/garage_junction/gallery/application@2x.webp"
            alt="Garage Junction identity application"
            style={{
              width: "100%",
              height: "auto",
              gridColumn: "1 / span 4",
            }}
          />
        </Grid>
        <div className={styles.heroSummary}>
          <p>
            DT was first approached by New Things Co in September 2017, by Sami,
            Jukkis and Kimmo. Back then the company was still called Lab of New.
          </p>
          <br />
          <p>
            They sought to establish a cohesive brand identity that resonated
            with their innovative approach to software development consulting.
            Their existing identity and online presence lacked a unified visual
            language, making it challenging to communicate their values and
            expertise effectively.
          </p>
          <br />
          <p>
            The task was the complete rebranding of the company name and
            aesthetic. Starting from the strategic pillars, purpose, core values
            following following visual identity, down to the most minute
            details, applications and all the various other bits and bobs for
            eg. marketing, events, recruitment and cultural purposes.
          </p>
          <br />
          <p>
            Both print and online assets were conceptualized, designed and
            delivered during a 16 month period. DT also prepared Figma based
            Brand Identity Guidelines and a Design System in React TS. Most of
            the ground work was put in the strategic positioning and
            differentiation from the competition.
          </p>
        </div>
      </div>
    </section>
    <section className={styles.section}>
      <Title size="M" level={3} terminals="sans">
        Project Overview
      </Title>
      <div className={styles.twoCol}>
        <div>
          <p>
            New Things Co needed a new identity and digital presence to reflect
            their growth and vision. We collaborated closely to define their
            brand strategy, visual language, and digital experience.
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

    {/* Process Section */}
    <section className={styles.section}>
      <Title size="M" level={3} terminals="sans">
        Process
      </Title>
      <div className={styles.processSteps}>
        <div className={styles.processStep}>
          <Title level={4}>01. Discovery</Title>
          <p>
            Workshops and interviews to understand the brand, users, and goals.
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

    {/* Results Section */}
    <section className={styles.section}>
      <Title size="M" level={3} terminals="sans">
        Results
      </Title>
      <p>
        The branding efforts paid off and New Things Co was on its way to being
        established as the small but fierce new player in the Finnish ITC-market
        early 2018.
      </p>
      <br />
      <ul className={styles.resultsList}>
        <li>New brand identity and guidelines</li>
        <li>Comprehensive design system</li>
        <li>Modern, responsive online presence</li>
        <li>Improved brand recognition and engagement</li>
      </ul>
    </section>
  </main>
);

export default GarageJunction;
