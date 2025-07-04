import React from "react";
import styles from "./CaseStudyTemplate.module.css";
import FlexBox from "../components/FlexBox/FlexBox";
import Title from "../components/Title/Title";

// Placeholder image component
interface PlaceholderImgProps {
  aspect?: string;
  color?: string;
  style?: React.CSSProperties;
}

const PlaceholderImg: React.FC<PlaceholderImgProps> = ({
  aspect = "16/9",
  color = "var(--color-primary)",
  style = {},
}) => (
  <div
    style={{
      background: color,
      width: "100%",
      aspectRatio: aspect,
      borderRadius: "16px",
      margin: "1.5rem 0",
      ...style,
    }}
  />
);

const CaseStudyTemplate = () => (
  <main className={styles.caseStudy}>
    {/* Hero Section */}
    <section className={styles.heroSection}>
      <div className={styles.heroText}>
        <Title level={1}>Brand.ai</Title>
        <Title level={2}>Branding, Design System, Website</Title>
        <p className={styles.heroSummary}>
          Brand.ai is a platform for managing and sharing design systems. We
          worked with their team to create a new brand identity, design system,
          and marketing website.
        </p>
      </div>
      <div className={styles.heroImage}>
        {/* <PlaceholderImg aspect="16/7" color="#b3c6ff" /> */}
      </div>
    </section>

    {/* Project Overview */}
    <section className={styles.section}>
      <Title level={3}>Project Overview</Title>
      <div className={styles.twoCol}>
        <div>
          <p>
            Brand.ai needed a new identity and digital presence to reflect their
            growth and vision. We collaborated closely to define their brand
            strategy, visual language, and digital experience.
          </p>
        </div>
        <div>
          <ul className={styles.projectMeta}>
            <li>
              <strong>Client:</strong> Brand.ai
            </li>
            <li>
              <strong>Year:</strong> 2023
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
      <Title level={3}>Process</Title>
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

    {/* Gallery Section */}
    <section className={styles.section}>
      <Title level={3}>Gallery</Title>
      <FlexBox className={styles.gallery}>
        <PlaceholderImg aspect="16/7" color="#ffe0b2" />
        <PlaceholderImg aspect="16/7" color="#b2dfdb" />
        <PlaceholderImg aspect="16/7" color="#d1c4e9" />
      </FlexBox>
    </section>

    {/* Results Section */}
    <section className={styles.section}>
      <Title level={3}>Results</Title>
      <ul className={styles.resultsList}>
        <li>New brand identity and guidelines</li>
        <li>Comprehensive design system</li>
        <li>Modern, responsive marketing website</li>
        <li>Improved brand recognition and engagement</li>
      </ul>
    </section>
  </main>
);

export default CaseStudyTemplate;
