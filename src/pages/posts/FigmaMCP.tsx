import React from "react";
import styles from "../Article.module.css";
import Author from "../../components/Author/Author";
import VaultBoy from "../../assets/images/pete-vault-boy.jpg";
import scriptLogo from "../../assets/images/script-logo.webp";

const FigmaMCP = () => (
  <article className={styles.article}>
    <header>
      <h1>Rethinking Design-to-Product Workflows with Figma MCP</h1>
      <Author name="Digitaltableteur" imageUrl={VaultBoy} size="32px" />
    </header>
    <img src={scriptLogo} alt="Illustration" />
    <p>
      Recently we experimented with Figma’s official MCP server alongside our
      own design system. The combination of structured components and
      machine-readable context opened up an entirely new way of moving from
      design to code.
    </p>
    <h2>The Problem with the Current Workflow</h2>
    <p>
      Even with well-documented systems the handoff from designer to developer
      often involves translating visual intent and double-checking tokens.
      Details can slip and iteration slows down.
    </p>
    <h2>What MCP Changes</h2>
    <p>
      MCP exposes design file data directly to code assistants. Instead of
      referencing screenshots or static specs, the assistant consumes real
      components, variants, and tokens right from Figma.
    </p>
    <p>
      In our trials we dropped a component URL into the editor and watched as it
      generated a nearly complete web component. Minor styling fixes aside, it
      was surprisingly production ready.
    </p>
    <h2>Design Systems as the Enabler</h2>
    <p>
      A consistent design system gives the MCP data meaning. Clear token names
      and predictable component structure help AI tools map design choices to
      code without guesswork.
    </p>
    <h2>Generative UI with Natural Language</h2>
    <p>
      We took it a step further by connecting the output to a local tool that
      generates layouts from text prompts. Typing “Build a login form” or
      “Create a three column feature grid” produces a quick preview that
      respects our components and styling conventions.
    </p>
    <h2>This Isn’t About Replacing Roles</h2>
    <p>
      Engineers still refine the output and designers still own the experience.
      But by automating the boilerplate we have more time to focus on the edge
      cases and overall product vision.
    </p>
    <h2>Where We’re Headed</h2>
    <p>
      Our goal is to make this workflow approachable for more teams. With stable
      tools and repeatable patterns, the gap between idea and implementation
      keeps shrinking.
    </p>
    <p>
      It’s an exciting time to rethink how we collaborate—and MCP is a big part
      of that conversation.☻
    </p>
    <div className={styles.similar}>
      <h2>Similar reads</h2>
      <div className={styles["similar-list"]}>
        <a
          href="/blog/designing-in-2025"
          className={`${styles["similar-card"]} ${styles.teal}`}
        >
          Designing in 2025
        </a>
        <a
          href="/blog/digital-craftsmanship"
          className={`${styles["similar-card"]} ${styles.purple}`}
        >
          Digital Craftsmanship
        </a>
      </div>
    </div>
  </article>
);

export default FigmaMCP;
