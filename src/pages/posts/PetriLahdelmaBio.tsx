import React from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import styles from "../Article.module.css";
import Author from "@dt/Author";
import VaultBoy from "../../assets/images/pete-vault-boy.jpg";
import Card from "@dt/Card";
import { SocialShare } from "@dt/SocialShare";
import { useTranslation } from "react-i18next";

const PetriLahdelmaBio = () => {
  const { t } = useTranslation();
  return (
    <>
      <HelmetProvider>
        <Helmet>
          <title>{t("postPetriLahdelmaBioMetaTitle")}</title>
          <meta
            name="description"
            content={t("postPetriLahdelmaBioMetaDescription")}
          />
          <meta
            property="og:title"
            content={t("postPetriLahdelmaBioMetaTitle") as string}
          />
          <meta
            property="og:description"
            content={t("postPetriLahdelmaBioMetaDescription") as string}
          />
          <meta property="og:image" content="/logo512.png" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta
            name="twitter:title"
            content={t("postPetriLahdelmaBioMetaTitle") as string}
          />
          <meta
            name="twitter:description"
            content={t("postPetriLahdelmaBioMetaDescription") as string}
          />
          <meta name="twitter:image" content="/logo512.png" />
        </Helmet>
      </HelmetProvider>
      <article className={styles.article}>
        <header>
          <h1>Petri Lahdelma: A Biography</h1>
          <Author name="Petri Lahdelma" imageUrl={VaultBoy} size="32px" />
        </header>
        <p>
          Petri Lahdelma is a Finnish designer, systems thinker, and advocate
          for professional ethics in design. Raised in Varissuo, a suburb of
          Turku, his passion for visual culture came from a painter father and a
          supportive mother. That early spark carried him to the UK for a BA in
          Graphic Design at the University of Cumbria, and later to Aalto
          University in Helsinki for a master&#39;s degree.
        </p>
        <br />
        <p>
          Among the mentors who shaped his craft were Rhiannon Robinson, who
          sharpened his critical eye, and Tapio Vapaasalo, who instilled a love
          for craftsmanship and form. After a junior stint at Werklig, Petri
          spent two decades moving through agencies, startups, and
          entrepreneurial ventures, always refusing to stand still.
        </p>
        <br />
        <p>
          Today he leads a design system team in a global enterprise of more
          than 300,000 colleagues, balancing enterprise UX with scalable systems
          thinking. His portfolio ranges from national infrastructure identities
          like the Liikennevirasto corporate identity to agile startup brands
          such as New Things Company, and he laid the strategic groundwork for
          the Helsinki Design System.
        </p>
        <br />
        <p>
          Throughout his career Petri has founded and led design guilds and
          special interest programs, shaping team culture as much as the work
          itself. He belongs to AIGA, IxDA, and ISTD. While he rarely speaks
          publicly—a regret of his own—his influence lives in the systems,
          standards, and ethics he brings to every project.
        </p>
        <br />
        <p>
          He believes clarity matters more than decoration, that form follows
          function, and that users seldom say what they really need. Guided by
          curiosity and care rather than fleeting trends, colleagues know him as
          a thoughtful, kind collaborator who insists on doing things the right
          way.
        </p>
        <hr
          style={{
            border: "none",
            borderTop: "3px solid var(--color-primary)",
            margin: "3rem 0 1.5rem",
          }}
        />
        <h2>{t("shareHeading")}</h2>
        <SocialShare
          url={window.location.href}
          title="Petri Lahdelma: A Biography"
        />
        <div className={styles.similar}>
          <h2>Similar Reads</h2>
          <div className={styles["similarList"]}>
            <Card
              title="Digital Craftsmanship"
              link="/blog/digital-craftsmanship"
              className={`${styles["similarCard"]} ${styles.purple}`}
            />
            <Card
              title="Designing in 2025"
              link="/blog/designing-in-2025"
              className={`${styles["similarCard"]} ${styles.teal}`}
            />
          </div>
        </div>
      </article>
    </>
  );
};

export default PetriLahdelmaBio;
