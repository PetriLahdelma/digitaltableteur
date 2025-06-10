import React from "react";
import Author from "../../components/Author/Author";
import styles from "../Article.module.css";
import VaultBoy from "../../assets/images/pete-vault-boy.jpg";

const DigitalCraftsmanship = () => (
  <article className={styles.article}>
    <header>
      <h1>
        Digital Craftsmanship — Thoughts on Maintaining Quality in a Hurry-Up
        Culture
      </h1>
      <Author name="Digitaltableteur" imageUrl={VaultBoy} size="32px" />
    </header>
    <h2>
      {"<tldr>"}In a hurry-up culture, choosing to care is radical.{"</tldr>"}
    </h2>
    <p>
      The tools are faster, the deadlines tighter, and the expectations steeper.
      Somewhere between shipping faster and scaling bigger, something subtle
      gets lost. Not visibly. But you can feel it — in the way a product
      handles, in how a brand sounds, in the absence of something quietly
      intentional.
    </p>
    <blockquote>That something is craft.</blockquote>
    <h2>Speed Isn’t the Enemy — Thoughtlessness Is</h2>
    <p>
      I’ve worked long enough in digital to know that slowness doesn’t equal
      quality. But there’s a difference between moving fast with intent and just
      pushing to ship. We’ve built pipelines that automate, generate, even
      decide for us. But no automation substitutes the quiet friction of asking:
      Does this feel right? Does this deserve to exist this way?
    </p>
    <p>That pause is not inefficiency. It’s where meaning starts.</p>
    <h2>Craft Is in the Edges</h2>
    <p>
      Good design isn’t only in the headline or the layout — it lives in the
      in-between. The microcopy that never sounds off. The loading animation
      that softens a delay. The way a transition suggests something human was
      here, thinking about how it would feel — how others would feel using it.
    </p>
    <p>
      Craftsmanship is about honoring the parts that don’t shout but shape the
      whole. It’s not about polish. It’s about presence.
    </p>
    <h3>Quality in the Age of Generators</h3>
    <p>
      AI is writing copy, generating layouts, filling in alt texts and icons —
      and oftentimes doing it quite decently. But the danger isn’t in letting
    </p>
  </article>
);

export default DigitalCraftsmanship;
