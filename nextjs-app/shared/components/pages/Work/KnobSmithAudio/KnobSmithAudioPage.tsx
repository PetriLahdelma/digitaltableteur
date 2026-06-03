"use client";

import React from "react";
import Title from "@dt/Title";
import Text from "@dt/Text";
import { Mermaid } from "../../../Mermaid";
import StoryBlock from "../../../../patterns/StoryBlock";
import GridBlock from "../../../../patterns/GridBlock";
import { LogoReveal } from "../../../LogoReveal";
import { LogoConstruction } from "../../../LogoConstruction";
import { ProjectDetailLayout } from "../../../../patterns/ProjectDetailLayout";
import { ProjectHero } from "../../../../patterns/ProjectHero";
import { RelatedProjects } from "../../../../patterns/RelatedProjects";
import { ProjectNav } from "../../../ProjectNav";
import { getProjectBySlug } from "../../../../data/projects";
import { SiFigma, SiAdobeillustrator } from "react-icons/si";
import { ClaudeIcon } from "../../../AskAI/ai-icons";

import styles from "./knobSmithAudio.module.css";

export function KnobSmithAudioPage({ nav }: { nav?: React.ReactNode }) {
  const project = getProjectBySlug("knobsmith-audio");

  if (!project) {
    return <div>Project not found</div>;
  }

  return (
    <ProjectDetailLayout
      nav={nav ?? <ProjectNav currentSlug={project.slug} />}
      hero={
        <ProjectHero
          title={project.title}
          description={project.description}
          video={{
            src: "/images/portfolio/knobsmith-audio/LCD-screen_1.webm",
            alt: "KnobSmith Audio plugin LCD screen animation",
            playbackRate: 3,
          }}
          category={project.category.replace("-", " ")}
          tags={project.tags}
          date="Dec 2025 – Present"
          liveUrl={project.liveUrl}
          variant="contained"
          showScrollIndicator={true}
        />
      }
      relatedProjects={
        <RelatedProjects currentSlug={project.slug} />
      }
      className={styles.page}
    >
      {/* Project Meta - Custom 2-column layout like VertaaUX */}
      <section className={styles.metaSection}>
        <div className={styles.metaGrid}>
          <div className={styles.metaLeft}>
            <div className={styles.metaBlock}>
              <Title as="h3" unstyled className={styles.metaLabel}>Services</Title>
              <p className={styles.metaText}>
                Product Design, Interaction Design, Visual Design, Brand Identity
              </p>
            </div>
            <div className={styles.metaBlock}>
              <Title as="h3" unstyled className={styles.metaLabel}>Duration</Title>
              <p className={styles.metaText}>Dec 2025 – Present</p>
            </div>
            <div className={styles.metaBlock}>
              <Title as="h3" unstyled className={styles.metaLabel}>Tools used</Title>
              <div className={styles.metaTools}>
                <SiFigma size={24} title="Figma" />
                <ClaudeIcon width={24} height={24} aria-label="Claude AI" />
                <SiAdobeillustrator size={24} title="Illustrator" />
              </div>
            </div>
          </div>
          <div className={styles.metaRight}>
            <Title as="h3" unstyled className={styles.metaLabel}>Overview</Title>
            <p className={styles.metaOverview}>
              <strong>KnobSmith Audio</strong> is a personal venture developing
              professional audio plugins for music producers and sound designers.
              The focus is on creating tools that feel intuitive and inspiring
              while honoring the tactile cues of analog hardware.
            </p>
            <p className={styles.metaOverview}>
              <strong>The design challenge:</strong> Modernize skeuomorphic
              controls without losing the familiarity musicians expect. Every
              control needs to be discoverable, precise, and fast to adjust
              under creative pressure.
            </p>
          </div>
        </div>
      </section>

      <StoryBlock
        subtitle="The Problem"
        title="Audio Plugin UX Is Stuck"
        content={[
          <Text key="p1" size="S">
            Many audio plugins still emulate vintage hardware with pixel-perfect
            recreations of knobs and meters. While visually appealing, these
            interfaces often sacrifice usability for aesthetics.
          </Text>,
          <Text key="p2" size="S">
            KnobSmith focuses on removing friction from everyday workflows by
            rethinking control affordances, feedback loops, and parameter
            discoverability.
          </Text>,
          <Mermaid
            key="mindmap"
            chart={`mindmap
  root((Audio Plugin UX))
    Skeuomorphism Trap
      Tiny knobs
      Low contrast
      Hidden parameters
      No keyboard nav
    Visual Over Function
      Decoration > clarity
      Retina unfriendly
      Illegible labels
    Workflow Friction
      Slow parameter access
      No presets overview
      Poor undo/redo
    Accessibility Gaps
      No screen reader
      Color-only feedback
      Mouse-only control`}
            themeColors={{
              color: "#ED4B9B",
              nodeBg: "#ffffff",
            }}
            className={styles.problemMindmap}
          />,
        ]}
        imageLayout="none"
        backgroundColor="transparent"
        maxWidth="md"
        spacing="comfortable"
        className={styles.storySection}
      />

      <div className={styles.meterSection}>
        <div className={styles.videoContainer}>
          <div className={styles.knobsVideoContainer}>
            <video
              aria-label="KnobSmith Audio knob interaction animation"
              autoPlay
              loop
              muted
              playsInline
              className={styles.knobsVideo}
            >
              <source
                src="/images/portfolio/knobsmith-audio/knobs-animated_1.webm"
                type="video/webm"
              />
              Your browser does not support the video tag.
            </video>
          </div>
          <Text size="XS" className={styles.videoCaption}>
            Exploration of layout, controls, and real-time feedback.
          </Text>
        </div>

        <StoryBlock
          subtitle="Interaction Design"
          title="Precision Controls, Modern Feedback"
          content={[
            <Text key="p1" size="S">
              Interaction patterns prioritize clarity: larger touch targets,
              explicit value readouts, and smooth animated feedback for every
              parameter change.
            </Text>,
            <Text key="p2" size="S">
              Visual exploration balanced high-fidelity knob rendering with
              modern typography and grid-based layouts so the interface stays
              legible in the studio and on the go.
            </Text>,
          ]}
          imageLayout="none"
          backgroundColor="transparent"
          maxWidth="md"
          spacing="comfortable"
          className={styles.storySection}
        />
      </div>

      <StoryBlock
        subtitle="Visual Feedback"
        title="Metering That Speaks"
        content={[
          <Text key="p1" size="S">
            Great metering is more than eye candy. It&apos;s a real-time
            conversation between the plugin and the producer. The VU meter
            design balances analog warmth with pixel-perfect accuracy, providing
            instant feedback on dynamics without overwhelming the interface.
          </Text>,
          <Text key="p2" size="S">
            Needle physics were tuned to feel natural: responsive enough for
            transients, yet smooth enough to read sustained levels at a glance.
            The glow and shadow work together to make the meter readable in any
            lighting condition, from dim studios to bright laptop screens.
          </Text>,
        ]}
        imageLayout="none"
        backgroundColor="transparent"
        maxWidth="md"
        spacing="comfortable"
        className={styles.storySectionBeforeVuMeter}
      />

      <div className={styles.vuMeterSection}>
        <div className={styles.videoContainer}>
          <div className={styles.meterVideoWrapper}>
            <video
              aria-label="KnobSmith Audio VU meter animation"
              autoPlay
              loop
              muted
              playsInline
              className={styles.meterVideo}
            >
              <source
                src="/images/portfolio/knobsmith-audio/vu-meter.webm"
                type="video/webm"
              />
              Your browser does not support the video tag.
            </video>
          </div>
          <Text size="XS" className={styles.videoCaption}>
            VU meter with analog-style needle physics and dark theming.
          </Text>
        </div>
      </div>

      <StoryBlock
        subtitle="Brand Presence"
        title="Online Identity"
        content={[
          <Text key="p1" size="S">
            A cohesive digital presence extends the plugin&apos;s personality
            across web and mobile. The website balances dark studio aesthetics
            with clear product information, while the mobile experience keeps
            producers connected on the go.
          </Text>,
          <Text key="p2" size="S">
            Typography, color, and interface patterns remain consistent from
            desktop to pocket, reinforcing brand recognition whether users are
            browsing demos or managing licenses.
          </Text>,
        ]}
        imageLayout="none"
        backgroundColor="transparent"
        maxWidth="md"
        spacing="comfortable"
        className={styles.storySection}
      />

      <GridBlock
        columns={1}
        gap="large"
        backgroundColor="transparent"
        maxWidth="lg"
        spacing="comfortable"
        className={styles.webPresenceGrid}
        cells={[
          {
            type: "image",
            src: "/images/portfolio/knobsmith-audio/macbook-mockup.png",
            alt: "KnobSmith Audio website on MacBook",
            width: 1920,
            height: 1080,
            caption:
              "The desktop experience embraces a dark studio aesthetic, reducing eye strain during extended sessions while showcasing the brand's signature pink accents.",
          },
          {
            type: "image",
            src: "/images/portfolio/knobsmith-audio/iphone-mockup-pink.png",
            alt: "KnobSmith Audio mobile experience on iPhone",
            width: 1080,
            height: 1920,
            caption:
              "Mobile-first responsive design ensures producers can browse plugins and manage their accounts on the go, with touch-optimized navigation.",
          },
        ]}
      />

      <div className={styles.ogImageSection}>
        <div className={styles.ogImageWrapper}>
          <img
            src="/images/portfolio/knobsmith-audio/hero.png"
            alt="KnobSmith Audio social media preview card"
            className={styles.ogImage}
          />
        </div>
        <Text size="XS" className={styles.ogImageCaption}>
          The Open Graph image ensures consistent brand presence when links are
          shared across social platforms.
        </Text>
      </div>

      <StoryBlock
        subtitle="Brand Identity"
        title="The Mark"
        content={[
          <Text key="p1" size="S">
            The KnobSmith Audio identity centers on a minimal, iconic mark that
            evokes the tactile rotation of a hardware knob. Paired with a clean
            wordmark, it scales from plugin splash screens to social avatars.
          </Text>,
          <Text key="p2" size="S">
            The animated reveal sequence adds a premium touch to loading states
            and first impressions. Mechanical yet refined, like the tools
            themselves.
          </Text>,
        ]}
        imageLayout="none"
        backgroundColor="transparent"
        maxWidth="md"
        spacing="comfortable"
        className={styles.storySection}
      />

      <div className={styles.logoWordmarkSection}>
        <div className={styles.logoWordmarkWrapper}>
          <img
            src="/images/portfolio/knobsmith-audio/logo_wordmark.png"
            alt="KnobSmith Audio full logo with wordmark"
            className={styles.logoWordmarkImage}
          />
        </div>
        <Text size="XS" className={styles.logoWordmarkCaption}>
          The complete KnobSmith Audio lockup: logo paired with wordmark.
        </Text>
      </div>

      <div className={styles.logoRevealSection}>
        <LogoReveal
          logoSrc="/images/portfolio/knobsmith-audio/logo_only.png"
          logoAlt="KnobSmith Audio logo icon"
          wordmarkSrc="/images/portfolio/knobsmith-audio/wordmark_only.png"
          wordmarkAlt="KnobSmith Audio wordmark"
          ariaLabel="KnobSmith Audio"
          logoWidth={140}
          logoHeight={140}
          wordmarkWidth={400}
          wordmarkHeight={84}
          enableHover={true}
        />
        <Text size="XS" className={styles.logoRevealCaption}>
          Some animated logo reveals: icon emerges first, wordmark follows.
        </Text>
      </div>

      <StoryBlock
        subtitle="Logo Construction"
        title="Building the Mark"
        content={[
          <Text key="p1" size="S">
            The KnobSmith Audio logomark is constructed from three concentric
            ellipses that form the foundation of the knob silhouette. These
            geometric guides establish the proportions before the final mark
            emerges with its distinctive rotary control detail.
          </Text>,
        ]}
        imageLayout="none"
        backgroundColor="transparent"
        maxWidth="md"
        spacing="comfortable"
        className={styles.storySection}
      />

      <div className={styles.logoConstructionSection}>
        <LogoConstruction
          stageDuration={2}
          loop={true}
          loopPause={3}
          ariaLabel="KnobSmith Audio logo construction animation showing how the mark is built from geometric shapes"
        />
      </div>

      <StoryBlock
        subtitle="Brand Identity"
        title="Logo Variations"
        content={[
          <Text key="p1" size="S">
            The identity adapts to different contexts with two primary color
            treatments. The white-on-dark variant dominates the plugin UI and
            studio environments, where low-contrast visuals reduce eye strain
            during long sessions.
          </Text>,
          <Text key="p2" size="S">
            The pink-on-white inversion brings energy to marketing materials,
            social media, and lighter web contexts, ensuring the brand stands
            out whether it&apos;s embedded in a DAW or scrolling through a feed.
          </Text>,
        ]}
        imageLayout="none"
        backgroundColor="transparent"
        maxWidth="md"
        spacing="comfortable"
        className={styles.storySection}
      />

      <GridBlock
        columns={1}
        gap="medium"
        backgroundColor="transparent"
        maxWidth="md"
        spacing="comfortable"
        className={styles.imageGrid}
        cells={[
          {
            type: "image",
            src: "/images/portfolio/knobsmith-audio/color_variations.png",
            alt: "KnobSmith Audio logo color variations: white on dark and pink on white",
            width: 1920,
            height: 1080,
            caption:
              "Color variations: white on dark for plugin UI, pink on white for marketing.",
          },
        ]}
      />

      <StoryBlock
        subtitle="Brand Identity"
        title="Color Palette"
        content={[
          <Text key="p1" size="S">
            The KnobSmith Audio color palette is intentionally minimal, focusing
            on three core colors that create maximum impact with restraint. Each
            color serves a specific functional purpose across the brand system.
          </Text>,
        ]}
        imageLayout="none"
        backgroundColor="transparent"
        maxWidth="md"
        spacing="comfortable"
        className={styles.storySection}
      />

      <div className={styles.colorPaletteSection}>
        <div className={styles.colorSwatches}>
          <div className={styles.colorSwatch}>
            <div
              className={styles.swatchColor}
              style={{ backgroundColor: "#ED4B9B" }}
            />
            <div className={styles.swatchInfo}>
              <span className={styles.swatchName}>Signature Pink</span>
              <span className={styles.swatchHex}>#ED4B9B</span>
              <Text size="XS" className={styles.swatchDescription}>
                The brand&apos;s primary accent. Use for interactive elements,
                CTAs, key highlights, and anywhere the brand needs to assert
                itself. Energetic and unmistakable.
              </Text>
            </div>
          </div>

          <div className={styles.colorSwatch}>
            <div
              className={styles.swatchColor}
              style={{ backgroundColor: "#2B2F33" }}
            />
            <div className={styles.swatchInfo}>
              <span className={styles.swatchName}>Studio Dark</span>
              <span className={styles.swatchHex}>#2B2F33</span>
              <Text size="XS" className={styles.swatchDescription}>
                The foundation color for plugin interfaces and dark UI. Use for
                backgrounds, body text on light surfaces, and anywhere stability
                and focus are paramount.
              </Text>
            </div>
          </div>

          <div className={styles.colorSwatch}>
            <div
              className={styles.swatchColor}
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E0E0E0",
              }}
            />
            <div className={styles.swatchInfo}>
              <span className={styles.swatchName}>Pure White</span>
              <span className={styles.swatchHex}>#FFFFFF</span>
              <Text size="XS" className={styles.swatchDescription}>
                The breathing room. Use for light backgrounds, text on dark
                surfaces, and negative space. Creates contrast and clarity
                without competing for attention.
              </Text>
            </div>
          </div>
        </div>
      </div>

      <StoryBlock
        subtitle="Typography"
        title="JetBrains Mono"
        content={[
          <Text key="p1" size="S">
            The brand typography uses JetBrains Mono, a developer-focused
            monospace typeface that bridges the gap between technical precision
            and creative expression. Its clean geometry and excellent legibility
            at all sizes make it ideal for both UI labels and marketing
            headlines.
          </Text>,
          <Text key="p2" size="S">
            Paired with the signature pink (#ED4B9B), the type system creates a
            distinctive voice that feels both technical and approachable.
          </Text>,
        ]}
        imageLayout="none"
        backgroundColor="transparent"
        maxWidth="md"
        spacing="comfortable"
        className={styles.storySection}
      />

      <div className={styles.typographySection}>
        <div className={styles.typographyShowcase}>
          <div className={styles.typeRow}>
            <span className={styles.typeLabel}>Display / 96px / Bold</span>
            <span className={`${styles.typeSample} ${styles.typeDisplay}`}>
              KnobSmith
            </span>
          </div>

          <div className={styles.typeRow}>
            <span className={styles.typeLabel}>Headline / 56px / Semibold</span>
            <span className={`${styles.typeSample} ${styles.typeHeadline}`}>
              Audio Tools
            </span>
          </div>

          <div className={styles.typeRow}>
            <span className={styles.typeLabel}>Title / 32px / Medium</span>
            <span className={`${styles.typeSample} ${styles.typeTitle}`}>
              Precision Controls
            </span>
          </div>

          <div className={styles.typeRow}>
            <span className={styles.typeLabel}>Body / 20px / Regular</span>
            <span className={`${styles.typeSample} ${styles.typeBody}`}>
              Designed for producers who demand both form and function.
            </span>
          </div>

          <div className={styles.typeRow}>
            <span className={styles.typeLabel}>Caption / 14px / Regular</span>
            <span className={`${styles.typeSample} ${styles.typeCaption}`}>
              KNOBSMITH AUDIO © 2024
            </span>
          </div>
        </div>
      </div>

      <StoryBlock
        subtitle="Typography"
        title="Geist Mono"
        content={[
          <Text key="p1" size="S">
            Geist Mono offers a contemporary alternative with its clean,
            geometric forms and excellent screen rendering. Developed by Vercel,
            it brings a modern sensibility that complements the technical
            aesthetic of audio software.
          </Text>,
          <Text key="p2" size="S">
            Its slightly wider letterforms and balanced proportions make it
            particularly readable for longer text blocks while maintaining the
            precision expected from a monospace typeface.
          </Text>,
        ]}
        imageLayout="none"
        backgroundColor="transparent"
        maxWidth="md"
        spacing="comfortable"
        className={styles.storySection}
      />

      <div className={styles.typographySection}>
        <div className={styles.typographyShowcase}>
          <div className={styles.typeRow}>
            <span className={styles.typeLabel}>Display / 96px / Bold</span>
            <span className={`${styles.typeSampleGeist} ${styles.typeDisplay}`}>
              KnobSmith
            </span>
          </div>

          <div className={styles.typeRow}>
            <span className={styles.typeLabel}>Headline / 56px / Semibold</span>
            <span
              className={`${styles.typeSampleGeist} ${styles.typeHeadline}`}
            >
              Audio Tools
            </span>
          </div>

          <div className={styles.typeRow}>
            <span className={styles.typeLabel}>Title / 32px / Medium</span>
            <span className={`${styles.typeSampleGeist} ${styles.typeTitle}`}>
              Precision Controls
            </span>
          </div>

          <div className={styles.typeRow}>
            <span className={styles.typeLabel}>Body / 20px / Regular</span>
            <span className={`${styles.typeSampleGeist} ${styles.typeBody}`}>
              Designed for producers who demand both form and function.
            </span>
          </div>

          <div className={styles.typeRow}>
            <span className={styles.typeLabel}>Caption / 14px / Regular</span>
            <span className={`${styles.typeSampleGeist} ${styles.typeCaption}`}>
              KNOBSMITH AUDIO © 2024
            </span>
          </div>
        </div>
      </div>
    </ProjectDetailLayout>
  );
}
