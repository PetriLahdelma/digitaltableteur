import React from "react";
import styles from "./Article.module.css";
import Author from "../components/Author/Author";

const ThoughtsOnFutureBranding = () => {
  return (
    <article className={styles.article}>
      <header className={styles.header}>
        <h1>Thoughts on Future Branding</h1>
        <Author
          name="Petri Lahdelma"
          imageUrl="/images/authors/petri-lahdelma.jpg"
          size="32px"
        />
      </header>
      <section className={styles.content}>
        <p>
          Traditionally, an identity or brand has been a tool to help companies
          distinguish one (a product, an ideal, a set of values, or what the
          company does) from the other with numerous defining sub-genres and
          classifications, such as entry-level, iconic, luxury, etc. Usually
          consisting of a logo (logomark/logotype) and other graphic means
          designed to increase brand recognition. Brands have now adopted
          subtler tactics in retrospect to the early days. Brands tell stories
          on popular platforms—and in a subtle way that is nearly
          indistinguishable (advertorials) from the media readers already
          consume. By molding the message to the platform, brands can draw loyal
          customers and occasionally even make their content go viral. Tone of
          voice plays a big role in how brands are adopted by the masses. This
          encapsulates the general zeitgeist of branding today.
        </p>
        <p>
          In recent times, branding has evolved into various different workflows
          and approaches, such as modular, responsive, and interactive, or
          generative brand applications and corresponding identities and vast
          variations of design systems to support and maintain the brand image.
          The craft itself has also somewhat evolved from promoting simple
          logomarks, and this has made the industry even more intricate.
        </p>
        <p>
          With the advancements in machine learning, bigger capacity for deeper
          neural networks (thanks to cloud solutions and Google’s efforts to
          speed up the computing with GPUs) and especially in the field of
          algorithm-driven design, there’s no limit to the amount of powerful
          tools we have access to. With the right tools and intellectual
          resources, we can apply the ideas garnered from the data and adapt to
          tomorrow&#39;s necessities, creating impactful design and successful
          content delivery, way “outside the box,” and soon beyond the
          capability of the human mind.
        </p>
        <p>
          The technologies of tomorrow are bound to change how we design
          corporate identification systems and brand presence in the future.
          There’s no avoiding it, and the sci-fi geek in me can’t wait for news
          on yet another tech or gadget that will completely revolutionize the
          way we experience, exist, and interact.
        </p>
        <p>
          Thinking outside the box has always been the mantra of the creative
          industry. The truth is that more times than we’d like to admit, we’re
          being stuffed into that very box by our clients’ budget, our lack of
          vision, our fear of failure, or even sheer laziness. I’ve experienced
          many if not all possible pitfalls in my personal career as a designer,
          and in that sense, I am no better than my fellow designers. But where
          are the brands and identities that strive to do something more with
          the vast possibilities at our disposal today?
        </p>
        <p>
          By focusing on the individual experience instead of the user itself,
          we can easily draw out the factors that dictate how experiences are
          perceived. That said, we still like to pick and choose where we follow
          the more traditional HCD (Human-Centric Design) model, much like our
          own smörgåsbord for design. We validate design choices in a hive-mind
          manner, which is made possible by the lack of hierarchy and principles
          of self-governance within New Things Co.
        </p>
        <p>
          So what technologies could one consider as a designer in a branding
          (or related) project? Intelligent, algorithm-driven, reactive, or
          whatever the choice of tech, beneath the surface still lies an
          intelligent creative that understands both the given constraints and
          possibilities or has the capacity for evaluating machine-based output.
          But through matured systems of smart, tech-driven assets, these new
          brands will soon serve mankind a genuine, empathetic, positive, and
          lasting experience.
        </p>
        <p>
          One could suggest an umbrella term “Exponentially-Driven Design” to
          collect all these technological advancements and bundle them to serve
          as an aid for design efforts. ED for short, meaning the
          computer-assisted, exponential advancements in the creative process.
          However we might call it, as creatives, we need to remember to step
          back and observe our habits and find smarter, new ways of working. In
          a word, adapt to changes in a rapidly changing digital landscape.
        </p>
      </section>
    </article>
  );
};

export default ThoughtsOnFutureBranding;
