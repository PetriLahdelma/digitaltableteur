import React from "react";
import styles from "./illustrations.module.css";
import Title from "../../components/Title/Title";
import Grid from "../../components/Grid/Grid";
import WorkNav from "../../components/WorkNav/WorkNav";

const illustrations = () => (
  <main className={styles.caseStudy}>
    <WorkNav />
    <section className={styles.caseHeroSection}>
      <div className={styles.heroText}>
        <Title level={1}>Illustrations</Title>
        {/* <FlexBox className={styles.caseBadges} gap={8}>
          <Badge size="s" design="secondary">
            Branding
          </Badge>
          <Badge size="s" design="secondary">
            Design System
          </Badge>
          <Badge size="s" design="secondary">
            Web Design
          </Badge>
        </FlexBox> */}
        <Grid columns={3} gap="2rem" style={{ marginBottom: "2rem" }}>
          <img
            src="/images/portfolio/illustrations/gallery/ice-cream.webp"
            alt="Popsicle illustration"
            style={{
              width: "100%",
              height: "auto",
              gridColumn: "1 / span 3",
            }}
          />
          <img
            src="/images/portfolio/illustrations/gallery/crisis-lifering.avif"
            alt="Shadow from Donald Duck illustration"
            style={{
              width: "100%",
              height: "auto",
              gridColumn: "1 / span 2",
            }}
          />
          <img
            src="/images/portfolio/illustrations/gallery/power-low.avif"
            alt="Shadow from Donald Duck illustration"
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
              gridColumn: "2 / span 2",
            }}
          />
          <img
            src="/images/portfolio/illustrations/gallery/salute.png"
            alt="Army salute illustration"
            style={{
              width: "100%",
              height: "auto",
              gridColumn: "2 / span 1",
            }}
          />
          <img
            src="/images/portfolio/illustrations/gallery/concept_character.png"
            alt="Vegas High Roller illustration"
            style={{
              width: "100%",
              height: "auto",
              gridColumn: "3 / span 1",
            }}
          />
          <img
            src="/images/portfolio/illustrations/gallery/garfield@2x.webp"
            alt="Garfield on Acid illustration"
            style={{
              width: "100%",
              height: "auto",
              gridColumn: "1 / span 2",
            }}
          />
          <img
            src="/images/portfolio/illustrations/gallery/shadow@2x.png"
            alt="Shadow from Donald Duck illustration"
            style={{
              width: "100%",
              height: "auto",
              gridColumn: "3 / span 1",
            }}
          />
        </Grid>
      </div>
    </section>
  </main>
);

export default illustrations;
