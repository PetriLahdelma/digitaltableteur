import React from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import styles from "../Article.module.css";
import Author from "@dt/Author";
import VaultBoy from "../../assets/images/pete-vault-boy.jpg";
import Card from "@dt/Card";
import { SocialShare } from "@dt/SocialShare";
import { useTranslation } from "react-i18next";
import Text from "@dt/Text";
import BlogNav from "@dt/BlogNav/BlogNav";
import "../../i18n";

const InSearchOfImpact = () => {
  const { t } = useTranslation();

  const shareUrl =
    typeof window !== "undefined"
      ? window.location.href
      : "https://digitaltableteur.com/blog/in-search-of-impact";

  return (
    <>
      <HelmetProvider>
        <Helmet>
          <title>{t("postInSearchOfImpactMetaTitle")}</title>
          <meta
            name="description"
            content={t("postInSearchOfImpactMetaDescription")}
          />
          <meta
            property="og:title"
            content={t("postInSearchOfImpactMetaTitle") as string}
          />
          <meta
            property="og:description"
            content={t("postInSearchOfImpactMetaDescription") as string}
          />
          <meta property="og:image" content="/logo512.png" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta
            name="twitter:title"
            content={t("postInSearchOfImpactMetaTitle") as string}
          />
          <meta
            name="twitter:description"
            content={t("postInSearchOfImpactMetaDescription") as string}
          />
          <meta name="twitter:image" content="/logo512.png" />
        </Helmet>
      </HelmetProvider>
      <article className={styles.article}>
        <BlogNav />
        <header>
          <h1>In search of impact as a solo entrepreneur</h1>
          <div className={styles.metaRow}>
            <Text className={styles.releaseDate}>February 11, 2025</Text>
            <Author name="Petri Lahdelma" imageUrl={VaultBoy} size="32px" />
          </div>
        </header>
        <p>
          Digitaltableteur is intentionally small—a one-person studio that
          blends strategy, design, and engineering without handing anything off.
          The “one-man army” model isn’t a constraint. It is the way the studio
          keeps every brief close to the craft, every sprint accountable, and
          every launch personal.
        </p>
        <p>
          When there is no internal bureaucracy, decisions aren’t diluted. The
          same person who listens to the client writes the narrative, designs
          the system, tunes the motion, and ships the code. That directness
          creates momentum the moment a project starts.
        </p>
        <blockquote>
          Being small means every detail is on purpose—and every outcome has a
          name attached to it.
        </blockquote>

        <h2>Why Stay Solo When the Work Is Big?</h2>
        <p>
          Most organizations swell with specialists. Digitaltableteur takes the
          opposite approach: keep the core tiny, then assemble collaborators
          only when the mission absolutely demands it. That preserves clarity of
          vision while still tapping world-class talent for illustration,
          research, or implementation scale.
        </p>
        <p>The benefits show up immediately:</p>
        <ul>
          <li>
            <strong>Single accountability:</strong> One owner for discovery,
            design systems, and deployment means no context gaps.
          </li>
          <li>
            <strong>Systemized craft:</strong> Tokens, typography, and code all
            live in the same stack, so nothing gets “polished later.”
          </li>
          <li>
            <strong>Client proximity:</strong> Conversations happen with the
            person doing the work, not layers of account management.
          </li>
        </ul>

        <h2>The Operating Rhythm</h2>
        <p>
          Every engagement follows a tight cadence that keeps intent at the
          center:
        </p>
        <ul>
          <li>
            <strong>First discovery:</strong> Define the shift we want in user
            behavior or business outcomes before drawing a single frame.
          </li>
          <li>
            <strong>Concept sprints:</strong> Explore typography, motion, and
            interaction in rapid cycles to establish the tone.
          </li>
          <li>
            <strong>Integrated build:</strong> Storybook, production, and
            content operate from the same design system, removing translation
            debt.
          </li>
          <li>
            <strong>Observation loops:</strong> Post-launch analytics feed
            straight into new experiments—no quarterly waiting room.
          </li>
        </ul>

        <h2>Who It Serves Best</h2>
        <p>
          The model shines when a company needs something flagship—a marketing
          hero, product prototype, or design system that feels authored instead
          of assembled. Leaders who want rapid decisions, strong opinions, and a
          single point of contact tend to thrive in this partnership.
        </p>
        <br />
        <p>
          It’s also ideal when experimentation matters. Kinetic typography,
          editorial layouts, intent-driven flows, or AI-native features can be
          explored without scary timelines because every experiment is owned end
          to end.
        </p>

        <h2>Collaboration Without Bureaucracy</h2>
        <p>
          “Solo” doesn’t mean isolation. Digitaltableteur pulls in trusted
          collaborators—writers, illustrators, ML specialists—whenever the work
          calls for it. The difference is orchestration. There is still one
          person ensuring the grid, palette, and budgets stay cohesive across
          every contribution.
        </p>

        <h2>A Studio Built on Care, Not Headcount</h2>
        <p>
          Growth here doesn’t mean adding layers. It means amplifying the impact
          of a focused practice through reusable systems, intent-driven tooling,
          and shared research notes. The promise stays the same: enterprise
          thinking, boutique-level craft, and the accountability that only comes
          from putting your name on every release.
        </p>
        <br />
        <p>
          The future of Digitaltableteur isn’t about becoming bigger. It’s about
          staying sharp, staying curious, and delivering work that feels like it
          could only have come from one studio—because it did.
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
          url={shareUrl}
          title="In search of impact as a solo entrepreneur
"
        />
        <div className={styles.similar}>
          <h2>Similar Reads</h2>
          <div className={styles["similarList"]}>
            <Card
              title="Designing in 2025"
              link="/blog/designing-2025"
              className={`${styles["similarCard"]}`}
            />
            <Card
              title="Workflow Tips"
              link="/blog/workflow-tips"
              className={`${styles["similarCard"]}`}
            />
          </div>
        </div>
      </article>
    </>
  );
};

export default InSearchOfImpact;
