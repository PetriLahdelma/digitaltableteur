import React from "react";
import styles from "../Article.module.css";
import image from "../../assets/images/abduction.webp";
import Author from "../../components/Author/Author";
import VaultBoy from "../../assets/images/pete-vault-boy.jpg";

const Designing2025 = () => (
  <article className={styles.article}>
    <header>
      <h1>
        Designing in 2025:
        <br />
        Navigating the AI-Assisted Creative Landscape
      </h1>
      <Author name="Digitaltableteur" imageUrl={VaultBoy} size="32px" />
    </header>
    <p>
      After more than two decades in the design field, I’ve had the pleasure and
      privilege of witnessing the practice evolve—from sketchbooks and static
      wireframes to collaborative, cloud-based systems that update in real-time.
      And now, in 2025, we’re at the cusp of what may be the most profound shift
      yet: the rise of AI as a deeply embedded partner in the design process.
    </p>
    <p>
      Artificial Intelligence is no longer a novelty. It’s embedded in the very
      tools we use—from generative ideation and layout prediction to code
      generation and automated testing. But despite this acceleration, one truth
      endures: design is still a deeply human act.
    </p>
    <blockquote>
      At its best, design is how we care for people at scale.
    </blockquote>
    <p>
      Our challenge now is not about keeping up with the speed of machines—it’s
      about preserving the purpose of design in an age of abundance.
    </p>

    <h2>Beyond Automation: Reclaiming the Core of Creative Work</h2>
    <p>
      We no longer face a blinking cursor on a blank canvas. AI can instantly
      generate layouts, suggest type pairings, or convert sketches into code.
      It’s impressive. But speed can’t replace soul.
    </p>
    <p>
      AI, in my experience, isn’t here to replace creativity—it’s here to
      amplify it.
    </p>
    <p>
      This means shifting our mindset. Not toward competing with machines, but
      toward outthinking them. Toward asking sharper questions. Challenging
      assumptions. Understanding people, behaviors, and contexts more deeply.
    </p>
  </article>
);

export default Designing2025;
