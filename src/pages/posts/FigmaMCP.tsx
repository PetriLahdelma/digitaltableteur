import React from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import styles from "../Article.module.css";
import Author from "@dt/Author";
import VaultBoy from "../../assets/images/pete-vault-boy.jpg";
import DTmindmap from "../../assets/images/dt-mindmap.webp";
import { SocialShare } from "@dt/SocialShare";
import Card from "@dt/Card";
import BlogNav from "@dt/BlogNav/BlogNav";
import "../../i18n"; // Ensure i18n is initialized
import MCP from "../../assets/images/MCP.webp";
import Grid from "@dt/Grid";
import {
  TbCircleNumber1,
  TbCircleNumber2,
  TbCircleNumber3,
  TbCircleNumber4,
} from "react-icons/tb";
import { useTranslation } from "react-i18next";

const FigmaMCP = () => {
  const { t, i18n } = useTranslation();
  const [currentUrl, setCurrentUrl] = React.useState("");
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.href);
    }
  }, []);
  if (!i18n.isInitialized) return null;

  return (
    <>
      <HelmetProvider>
        <Helmet>
          <title>{t("postFigmaMCPMetaTitle")}</title>
          <meta name="description" content={t("postFigmaMCPMetaDescription")} />
          <meta
            property="og:title"
            content={t("postFigmaMCPMetaTitle") as string}
          />
          <meta
            property="og:description"
            content={t("postFigmaMCPMetaDescription") as string}
          />
          <meta property="og:image" content="/logo512.png" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta
            name="twitter:title"
            content={t("postFigmaMCPMetaTitle") as string}
          />
          <meta
            name="twitter:description"
            content={t("postFigmaMCPMetaDescription") as string}
          />
          <meta name="twitter:image" content="/logo512.png" />
        </Helmet>
      </HelmetProvider>
      <article className={styles.article}>
        <BlogNav />
        <header>
          <h1>Rethinking Design-to-Product Workflows with Figma MCP</h1>
          <Author name="Petri Lahdelma" imageUrl={VaultBoy} size="32px" />
        </header>
        <img
          src={(MCP as any).src || MCP}
          alt="MCP features a colorful abstract design with geometric shapes and patterns."
          style={{ marginBlockEnd: "3rem" }}
        />
        <p>
          Recently, I experimented with Figma’s official MCP (Model Context
          Protocol) server in tandem with the dt design system, and the results
          were eye-opening. By enriching the components with machine-readable
          metadata directly within Figma, I unlocked a new layer of semantic
          clarity — not just for designers, but for tooling and automation as
          well. This integration allowed me to embed context such as intent,
          behavior, and variant logic directly into each component.
        </p>
        <br />
        <p>
          When combined with a well-structured design system, this metadata
          forms a bridge between design and development that’s both expressive
          and efficient. It fundamentally shifts how we think about handoff:
          instead of static specs, we’re enabling a pipeline where components
          carry the instructions needed to generate real code or configure
          runtime behavior. This shift opens the door to smarter tooling,
          automatic documentation, and even generative UI workflows — all
          grounded in the source of truth that lives inside the design system.
        </p>
        <h2>The Problem with the Current Workflow</h2>
        <p>
          Even with well-documented systems, the handoff from designer to
          developer often involves a layer of translation—interpreting visual
          intent, cross-referencing token usage, and validating component
          variants. It’s a process that still relies heavily on human
          interpretation and manual alignment. Small details, like the exact
          padding on a card or the semantic use of a color token, can easily
          slip through the cracks, leading to inconsistencies in implementation.
          These discrepancies not only require back-and-forth to resolve but can
          also erode trust in the system itself. As a result, iteration slows
          down, and teams spend more time fixing gaps than pushing the
          experience forward.
        </p>
        <h2>What MCP Changes</h2>
        <p>
          MCP exposes design file data directly to code assistants. Instead of
          referencing screenshots or static specs, the assistant consumes real
          components, variants, and tokens right from Figma.
        </p>
        <div>
          <img
            src={(DTmindmap as any).src || DTmindmap}
            alt="“DTmindmap” visually organizes concepts, showcasing relationships and ideas effectively."
            style={{ width: "100%", height: "auto" }}
          />
        </div>
        <div>
          <p>
            This means the AI can generate code that’s not just visually
            accurate, but also semantically aligned with the design system’s
            intent. It understands how components relate to each other, what
            variants are available, and how tokens should be applied.
          </p>
        </div>
        <br />
        <Grid columns={4} gap="2rem">
          <div>
            <TbCircleNumber1 size={32} />
            <h3>Figma MCP</h3>
            <p>Define structured, variant-rich component data</p>
          </div>

          <div>
            <TbCircleNumber2 size={32} />
            <h3>Figma API</h3>
            <p>Export that structure as JSON</p>
          </div>

          <div>
            <TbCircleNumber3 size={32} />
            <h3>ChatGPT</h3>
            <p>Transform exported JSON into reusable React/TS components</p>
          </div>

          <div>
            <TbCircleNumber4 size={32} />
            <h3>GitHub Copilot</h3>
            <p>Assist with logic, styling, and integration in your IDE</p>
          </div>
        </Grid>
        <br />
        <p>
          In the trials I dropped a component URL into the editor and watched as
          it generated a nearly complete web component. Minor styling fixes
          aside, it was surprisingly production ready.
        </p>
        <h2>Design Systems as the Enabler</h2>
        <p>
          A consistent design system gives the MCP data meaning. Clear token
          names and predictable component structure help AI tools map design
          choices to code without guesswork.
        </p>
        <h2>Generative UI with Natural Language</h2>
        <p>
          I took it a step further by connecting the output to a local tool that
          generates layouts from text prompts. Typing “Build a login form” or
          “Create a three column feature grid” produces a quick preview that
          respects my components and styling conventions.
        </p>
        <h2>This Isn’t About Replacing Roles</h2>
        <p>
          Engineering still plays a critical role in refining the output,
          ensuring performance, scalability, and maintainability, while design
          continues to shape and own the overall user experience. But what’s
          changing is the nature of that collaboration. By automating the
          repetitive and predictable parts of the workflow — the boilerplate
          code, standard layout scaffolding, and component wiring — we’re
          reclaiming valuable time and cognitive energy. This gives teams space
          to focus on what actually matters: the edge cases that define polish,
          the accessibility nuances that ensure inclusivity, and the product
          vision that ties everything together into something coherent and
          meaningful. Rather than getting bogged down in tactical execution,
          both designers and developers can engage more deeply in strategic
          problem-solving, exploring interactions, flows, and ideas that elevate
          the product beyond the expected.
        </p>
        <h2>Where We’re Headed</h2>
        <p>
          At least my personal goal is to make this workflow approachable for
          bigger teams. With stable tools and repeatable patterns, the gap
          between idea and implementation keeps shrinking. It’s an exciting time
          to rethink how we collaborate—and MCP&#39;s are a big part of that
          conversation.☻
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
          url={currentUrl}
          title="Rethinking Design-to-Product Workflows with Figma MCP"
        />
        <div className={styles.similar}>
          <h2>Similar Reads</h2>
          <div className={styles["similarList"]}>
            <Card
              title="Designing in 2025"
              link="/blog/designing-in-2025"
              className={`${styles["similarCard"]} ${styles.teal}`}
            ></Card>
            <Card
              title="Digital Craftsmanship"
              link="/blog/digital-craftsmanship"
              className={`${styles["similarCard"]} ${styles.purple}`}
            ></Card>
          </div>
        </div>
      </article>
    </>
  );
};

export default FigmaMCP;
