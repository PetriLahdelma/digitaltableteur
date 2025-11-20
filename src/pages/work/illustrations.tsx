import React from "react";
import styles from "./illustrations.module.css";
import Title from "@dt/Title";
import Grid from "@dt/Grid";
import WorkNav from "@dt/WorkNav";
import FlexBox from "@dt/FlexBox";
import Badge from "@dt/Badge";
import PageLayout from "../../patterns/PageLayout/PageLayout";

const illustrations = () => (
  <main className={styles.caseStudy}>
    <WorkNav />
    <PageLayout maxWidth="lg" spacing="comfortable" as="section">
      <section className={styles.caseHeroSection}>
        <div className={styles.heroText}>
          <Title level={1}>Illustrations</Title>
          <FlexBox className={styles.caseBadges} gap={8}>
            <Badge size="s" design="secondary">
              Pencil & Paper
            </Badge>
            <Badge size="s" design="secondary">
              Brush & Paint
            </Badge>
            <Badge size="s" design="secondary">
              Vector
            </Badge>
            <Badge size="s" design="secondary">
              Pixel
            </Badge>
          </FlexBox>
          <Grid columns={5} gap="2rem" style={{ marginBottom: "2rem" }}>
            <img
              src="/images/portfolio/illustrations/gallery/ice-cream.webp"
              alt="Popsicle illustration"
              style={{
                width: "100%",
                height: "auto",
                gridColumn: "1 / span 4",
              }}
            />
            <img
              src="/images/portfolio/illustrations/gallery/crisis-lifering.avif"
              alt="Editorial illustration of liferings for crisises"
              style={{
                width: "100%",
                height: "auto",
                gridColumn: "2 / span 3",
              }}
            />
            <img
              src="/images/portfolio/illustrations/gallery/react@2x.png"
              alt="React logo illustration for an event"
              style={{
                width: "100%",
                height: "auto",
                gridColumn: "1 / span 1",
              }}
            />
            <img
              src="/images/portfolio/illustrations/gallery/power-low.avif"
              alt="An editorial illustration of a low battery metaphor"
              style={{
                width: "100%",
                height: "auto",
                gridColumn: "2 / span 4",
              }}
            />
            <img
              src="/images/portfolio/illustrations/gallery/jigsaw.jpg"
              alt="An editorial illustration of juggling with dependencies"
              style={{
                width: "100%",
                height: "auto",
                gridColumn: "2 / span 3",
              }}
            />
            <img
              src="/images/portfolio/illustrations/gallery/ok_horns.jpg"
              alt="OK Hand Horns illustration"
              style={{
                width: "100%",
                height: "auto",
                gridColumn: "1 / span 2",
              }}
            />
            <img
              src="/images/portfolio/illustrations/gallery/polygon_woman.png"
              alt="Polygon Woman illustration"
              style={{
                width: "100%",
                height: "auto",
                gridColumn: "3 / span 3",
              }}
            />
            <img
              src="/images/portfolio/illustrations/gallery/salute.png"
              alt="Army salute illustration"
              style={{
                width: "100%",
                height: "auto",
                gridColumn: "2 / span 2",
              }}
            />
            <img
              src="/images/portfolio/illustrations/gallery/concept_character.png"
              alt="Vegas High Roller illustration"
              style={{
                width: "100%",
                height: "auto",
                gridColumn: "4 / span 2",
              }}
            />
            <img
              src="/images/portfolio/illustrations/gallery/garfield@2x.webp"
              alt="Garfield on Acid illustration"
              style={{
                width: "100%",
                height: "auto",
                gridColumn: "1 / span 3",
              }}
            />
            <img
              src="/images/portfolio/illustrations/gallery/shadow@2x.png"
              alt="Shadow from Donald Duck illustration"
              style={{
                width: "100%",
                height: "auto",
                gridColumn: "4 / span 2",
              }}
            />
            <img
              src="/images/portfolio/illustrations/gallery/nitor_gods_of_atk.jpg"
              alt="Shadow from Donald Duck illustration"
              style={{
                width: "100%",
                height: "auto",
                gridColumn: "1 / span 3",
              }}
            />
            <img
              src="/images/portfolio/illustrations/gallery/ottoboni_figures.jpg"
              alt="Employee icons for Ottoboni"
              style={{
                width: "100%",
                height: "auto",
                gridColumn: "4 / span 2",
              }}
            />
          </Grid>
        </div>
      </section>
    </PageLayout>
  </main>
);

export default illustrations;
