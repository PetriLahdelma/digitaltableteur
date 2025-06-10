import React from "react";
import styles from "./Article.module.css";

const DigitalCraftsmanship = () => (
  <article className={styles.article}>
    <header>
      <h1>
        Digital Craftsmanship — Thoughts on Maintaining Quality in a Hurry-Up
        Culture
      </h1>
      <p className={styles.author}>By Digitaltableteur</p>
    </header>
    <p>
      The tools are faster, the deadlines tighter, and the expectations steeper.
      Somewhere between shipping faster and scaling bigger, something subtle
      gets lost. Not visibly. But you can feel it — in the way a product
      handles, in how a brand sounds, in the absence of something quietly
      intentional.
    </p>
    <blockquote>That something is craft.</blockquote>
    <h3>Speed Isn’t the Enemy — Thoughtlessness Is</h3>
    <p>
      I’ve worked long enough in digital to know that slowness doesn’t equal
      quality. But there’s a difference between moving fast with intent and just
      pushing to ship. We’ve built pipelines that automate, generate, even
      decide for us. But no automation substitutes the quiet friction of asking:
      Does this feel right? Does this deserve to exist this way?
    </p>
    <p>That pause is not inefficiency. It’s where meaning starts.</p>
    <h3>Craft Is in the Edges</h3>
    <p>
      Good design isn’t only in the headline or the layout — it lives in the
      in-between. The microcopy that never sounds off. The loading animation
      that softens a delay. The way a transition suggests something human was
      here, thinking about how it would feel.
    </p>
    <p>
      Digital craftsmanship is about honoring the parts that don’t shout but
      shape the whole. It’s not about polish. It’s about presence.
    </p>
    <h3>Quality in the Age of Generators</h3>
    <p>
      AI is writing copy, generating layouts, filling in alt texts and icons —
      and sometimes doing it decently. But the danger isn’t in letting machines
      help. It’s in letting them decide what “good enough” looks like. When we
      stop noticing the difference, we stop caring.
    </p>
    <p>
      Craft today means keeping a human fingerprint on the product. Not because
      we should resist the tools, but because we’re still the ones accountable
      for the emotional resonance.
    </p>
    <h3>Leave Traces of Care</h3>
    <p>
      In every project, there’s a point where we could cut a corner and no one
      would notice. But someone always does — even if they can’t name it.
      Quality has a texture. It lingers. Not just in design, but in the culture
      it fosters: attention to detail becomes contagious. The team starts to
      raise their own bar.
    </p>
    <p>
      Digital craftsmanship isn’t about perfection. It’s about giving a damn.
    </p>
    <h3>In Praise of Slowness, Even When We’re Fast</h3>
    <p>
      We won’t go back to slower cycles. That’s not the point. But we can bake
      slowness into the process: quick iterations, slow reflection. Fast drafts,
      considered revisions. Space for questions no prompt can answer. In the
      end, craft is just a pattern of choices made deliberately, not reactively.
    </p>
    <strong>In a hurry-up culture, choosing to care is radical.</strong>
  </article>
);

export default DigitalCraftsmanship;
