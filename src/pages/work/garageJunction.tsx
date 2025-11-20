import React from "react";
import styles from "./garageJunction.module.css";
import FlexBox from "@dt/FlexBox";
import Title from "@dt/Title";
import Badge from "@dt/Badge";
import Gallery from "@dt/Gallery";
import Grid from "@dt/Grid";
import WorkNav from "@dt/WorkNav";
import PageLayout from "../../patterns/PageLayout/PageLayout";

const GarageJunction = () => (
  <main className={styles.caseStudy}>
    <WorkNav />
    <PageLayout maxWidth="lg" spacing="comfortable" as="section">
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
          <PageLayout maxWidth="md" spacing="comfortable" as="section">
            <div className={styles.heroSummary}>
              <p>
                Garage Junction was a collaborative event series and brand
                concept launched at Merikerho, Helsinki, in 2018. The project
                brought music lovers, artists, and creative professionals for a
                club night and cultural happening, celebrating underground music
                and visual arts.
              </p>
              <br />
              <p>
                The vision was to create an inclusive platform that captured the
                raw energy and diversity of Helsinki’s nightlife with a UK
                twist. The brand identity needed to reflect this spirit—bold,
                memorable, and flexible for both digital and print promotion.
              </p>
              <br />
              <p>
                The work included developing the Garage Junction name, logo, and
                visual identity, as well as designing event materials, social
                media assets, and a modular design system for future use. The
                result was a brand that resonated with the target audience and
                helped establish Garage Junction as a recognized name in the
                city’s club culture.
              </p>
            </div>
          </PageLayout>
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
              Garage Junction needed a distinctive identity and digital presence
              to launch its event at Merikerho. DT worked closely with the
              organizers to define the brand’s strategy, visual language, and
              promotional materials, ensuring a consistent experience across all
              touchpoints.
            </p>
          </div>
          <div>
            <ul className={styles.projectMeta}>
              <li>
                <strong>Client:</strong> Garage Junction / Merikerho
              </li>
              <li>
                <strong>Year:</strong> 2018
              </li>
              <li>
                <strong>Services:</strong> Branding, Visual Identity, Event
                Promotion, Social Media Assets
              </li>
            </ul>
          </div>
        </div>
      </section>
    </PageLayout>

    {/* Process Section */}
    <PageLayout maxWidth="md" spacing="comfortable" as="section">
      <section className={styles.section}>
        <Title size="M" level={3} terminals="sans">
          Process
        </Title>
        <div className={styles.processSteps}>
          <div className={styles.processStep}>
            <Title level={4}>01. Research & Discovery</Title>
            <p>
              Explored Helsinki’s club scene and audience expectations.
              Conducted workshops with the organizing team to define the event’s
              core values and vision.
            </p>
          </div>
          <div className={styles.processStep}>
            <Title level={4}>02. Brand Strategy</Title>
            <p>
              Developed the Garage Junction name, positioning, and messaging to
              capture the event’s underground and collaborative ethos.
            </p>
          </div>
          <div className={styles.processStep}>
            <Title level={4}>03. Visual Identity</Title>
            <p>
              Designed the logo, color palette, and graphic elements. Created
              digital and print materials for event promotion and social media.
            </p>
          </div>
          <div className={styles.processStep}>
            <Title level={4}>04. Launch & Support</Title>
            <p>
              Delivered final assets and provided ongoing support for event
              rollouts and future branding needs.
            </p>
          </div>
        </div>
      </section>
    </PageLayout>

    {/* Results Section */}
    <PageLayout maxWidth="md" spacing="comfortable" as="section">
      <section className={styles.section}>
        <Title size="M" level={3} terminals="sans">
          Results
        </Title>
        <p>
          Garage Junction quickly gained recognition as a fresh and authentic
          addition to Helsinki’s nightlife. The brand identity helped attract a
          loyal following and fostered a collaborative community around music
          and art.
        </p>
        <br />
        <ul className={styles.resultsList}>
          <li>Distinctive brand identity and event visuals</li>
          <li>Successful launch at Merikerho with strong attendance</li>
          <li>Engaged community of artists, DJs, and attendees</li>
          <li>Flexible design system for future events and promotions</li>
        </ul>
      </section>
    </PageLayout>
  </main>
);

export default GarageJunction;
