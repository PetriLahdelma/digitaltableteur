import React from "react";
import styles from "../Article.module.css";
import Author from "../../components/Author/Author";
import VaultBoy from "../../assets/images/pete-vault-boy.jpg";
import Card from "../../components/Card/Card";
import { SocialShare } from "../../components/SocialShare/SocialShare";

const PetriLahdelmaBio = () => (
  <article className={styles.article}>
    <header>
      <h1>Petri Lahdelma: A Biography</h1>
      <Author name="Petri Lahdelma" imageUrl={VaultBoy} size="32px" />
    </header>
    <p>
      Petri Lahdelma is a Finnish designer, systems thinker, and advocate for
      professional ethics in design. Raised in Varissuo, a suburb of Turku, his
      passion for visual culture came from a painter father and a supportive
      mother. That early spark carried him to the UK for a BA in Graphic Design
      at the University of Cumbria, and later to Aalto University in Helsinki
      for a master&#39;s degree.
    </p>
    <p>
      Among the mentors who shaped his craft were Rhiannon Robinson, who
      sharpened his critical eye, and Tapio Vapaasalo, who instilled a love for
      craftsmanship and form. After a junior stint at Werklig, Petri spent two
      decades moving through agencies, startups, and entrepreneurial ventures,
      always refusing to stand still.
    </p>
    <p>
      Today he leads a design system team in a global enterprise of more than
      300,000 colleagues, balancing enterprise UX with scalable systems
      thinking. His portfolio ranges from national infrastructure identities
      like the Liikennevirasto corporate identity to agile startup brands such
      as New Things Company, and he laid the strategic groundwork for the
      Helsinki Design System.
    </p>
    <p>
      Throughout his career Petri has founded and led design guilds and special
      interest programs, shaping team culture as much as the work itself. He
      belongs to AIGA, IxDA, and ISTD. While he rarely speaks publicly—a regret
      of his own—his influence lives in the systems, standards, and ethics he
      brings to every project.
    </p>
    <p>
      He believes clarity matters more than decoration, that form follows
      function, and that users seldom say what they really need. Guided by
      curiosity and care rather than fleeting trends, colleagues know him as a
      thoughtful, kind collaborator who insists on doing things the right way.
    </p>
    <h2>Share</h2>
    <SocialShare
      url={window.location.href}
      title="Petri Lahdelma: A Biography"
    />
    <div className={styles.similar}>
      <h2>Similar reads</h2>
      <div className={styles["similar-list"]}>
        <Card
          title="Digital Craftsmanship"
          link="/blog/digital-craftsmanship"
          className={`${styles["similar-card"]} ${styles.purple}`}
        />
        <Card
          title="Designing in 2025"
          link="/blog/designing-in-2025"
          className={`${styles["similar-card"]} ${styles.teal}`}
        />
      </div>
    </div>
  </article>
);

export default PetriLahdelmaBio;
