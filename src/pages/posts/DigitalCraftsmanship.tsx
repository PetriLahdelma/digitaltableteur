import React from "react";
import Avatar from "../../components/Avatar/Avatar";
import Author from "../../components/Author/Author";
import styles from "../Article.module.css";
import VaultBoy from "../../assets/images/pete-vault-boy.jpg";
import { css } from "storybook/internal/theming";
import Pizza from "../../assets/images/pizza.jpg";
import Card from "../../components/Card/Card";
import { SocialShare } from "../../components/SocialShare/SocialShare";

const DigitalCraftsmanship = () => (
  <article className={styles.article}>
    <header>
      <h1>
        Digital Craftsmanship — Thoughts on Maintaining Quality in a Hurry-Up
        Culture
      </h1>
      <Author name="Digitaltableteur" imageUrl={VaultBoy} size="32px" />
    </header>
    <img src={Pizza} width="100%" alt="Pizza" className={styles.image} />
    <p>
      Our very first lecture in design school was led by a passionate advocate
      for craftsmanship, Professor Tapio Vapaasalo. He began his lecture with
      showing a two distinctly different youtube videos. The first one featured
      a parrot that could mimic whatever the owner said, while the second one
      featured a craftsman who had spent years perfecting his skill. The
      difference was clear: the parrot could repeat words, but the craftsman
      created something meaningful.
    </p>
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
      machines help. It’s in letting them decide what “good enough” looks like.
      When we stop noticing the difference, we stop caring.
    </p>
    <p>
      Craft today, more than ever, means keeping a human fingerprint on the
      product. Not because we should resist progress or the tools that deliver
      it, but because we’re still the ones accountable for the emotional
      resonance.
    </p>
    <h2>Leave Traces of Care</h2>
    <p>
      In every project, there’s a point where we could cut a corner and no one
      would notice. But someone always does — even if they can’t name it.
      Quality has a texture. It lingers. Not just in design, but in the culture
      it fosters: attention to detail becomes contagious. The team starts to
      raise their own bar.
    </p>
    <blockquote>
      Digital craftsmanship isn’t about perfection. It’s about giving a damn.
    </blockquote>
    <h2>In Praise of Slowness, Even When We’re Fast</h2>
    <p>
      We won’t go back to slower cycles. That’s not the point. But we can bake
      slowness into the process: quick iterations, slow reflection. Fast drafts,
      considered revisions. Space for questions no prompt can answer. In the
      end, craft is just a pattern of choices made deliberately, not reactively.
    </p>
    <strong>In a hurry-up culture, choosing to care is radical.☻</strong>
    <h2>Share</h2>
    <SocialShare
      url={window.location.href}
      title="Maintaining Quality in a Hurry-Up Culture"
    />
    <div className={styles.similar}>
      <h2>Similar reads</h2>
      <div className={styles["similar-list"]}>
        <Card
          title="Workflow Tips"
          link="/blog/workflow-tips"
          className={`${styles["similar-card"]} ${styles.teal}`}
        ></Card>
        <Card
          title="Designing in 2025"
          link="/blog/designing-in-2025"
          className={`${styles["similar-card"]} ${styles.purple}`}
        ></Card>
      </div>
    </div>
  </article>
);

export default DigitalCraftsmanship;
