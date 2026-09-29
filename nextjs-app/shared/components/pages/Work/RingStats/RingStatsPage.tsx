"use client";

import React from "react";
import { Text, Title } from "@digitaltableteur/react";
import { Mermaid } from "../../../Mermaid";
import StoryBlock from "../../../../patterns/StoryBlock";
import GridBlock from "../../../../patterns/GridBlock";
import { ProjectDetailLayout } from "../../../../patterns/ProjectDetailLayout";
import { ProjectHero } from "../../../../patterns/ProjectHero";
import { RelatedProjects } from "../../../../patterns/RelatedProjects";
import { ProjectNav } from "../../../ProjectNav";
import { getProjectBySlug } from "../../../../data/projects";
import { SiFigma, SiSwift } from "react-icons/si";
import { ClaudeIcon } from "../../../AskAI/ai-icons";

import styles from "./ringStats.module.css";

export function RingStatsPage({ nav }: { nav?: React.ReactNode }) {
  const project = getProjectBySlug("ring-stats");

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
          image={{
            src: "/images/portfolio/ring-stats/hero-v4.webp",
            alt: "Ring Stats popover with Readiness, Sleep and Activity score rings, Heart rate, Stress, Resilience and ring battery",
            width: 1360,
            height: 522,
          }}
          category={project.category.replace("-", " ")}
          tags={project.tags}
          variant="contained"
          showScrollIndicator={true}
        />
      }
      relatedProjects={<RelatedProjects currentSlug={project.slug} />}
      className={styles.page}
    >
      {/* Project Meta - 2-column layout like KnobSmith/VertaaUX */}
      <section className={styles.metaSection}>
        <div className={styles.metaGrid}>
          <div className={styles.metaLeft}>
            <div className={styles.metaBlock}>
              <Title as="h2" unstyled className={styles.metaLabel}>
                Services
              </Title>
              <p className={styles.metaText}>
                Product Design, Interaction Design, Brand Identity,
                Accessibility, macOS Development
              </p>
            </div>
            <div className={styles.metaBlock}>
              <Title as="h2" unstyled className={styles.metaLabel}>
                Duration
              </Title>
              <p className={styles.metaText}>Sep 2026</p>
            </div>
            <div className={styles.metaBlock}>
              <Title as="h2" unstyled className={styles.metaLabel}>
                Tools used
              </Title>
              <div className={styles.metaTools}>
                <SiFigma size={24} title="Figma" />
                <SiSwift size={24} title="Swift / SwiftUI" />
                <ClaudeIcon width={24} height={24} aria-label="Claude AI" />
              </div>
            </div>
          </div>
          <div className={styles.metaRight}>
            <Title as="h2" unstyled className={styles.metaLabel}>
              Overview
            </Title>
            <p className={styles.metaOverview}>
              <strong>Ring Stats</strong> is an independent, open-source macOS
              menu-bar app for Oura Ring owners. One click shows today&apos;s
              Readiness, Sleep and Activity scores, heart rate, stress and ring
              battery. One more click and it is gone.
            </p>
            <p className={styles.metaOverview}>
              <strong>The design challenge:</strong> answer &ldquo;how am I
              doing today?&rdquo; in five seconds without becoming another
              dashboard, and never show a number as current when it is not.
            </p>
          </div>
        </div>
      </section>

      <StoryBlock
        headingLevel={2}
        subtitle="Context"
        title="A Five-Second Question"
        content={[
          <Text key="p1" size="s">
            The ring collects the data and the phone app explains it. What was
            missing was the in-between moment: sitting at a Mac, wondering
            whether today is a push day or a rest day, without picking up a
            phone and falling into a feed of charts.
          </Text>,
          <Text key="p2" size="s">
            A solo project end to end: product definition, interaction and
            visual design, identity, SwiftUI and AppKit development, security
            review and release engineering. The scope was set by one rule from
            the start: smaller than a dashboard. No history, no coaching, no
            navigation and no health database on disk.
          </Text>,
        ]}
        imageLayout="none"
        backgroundColor="transparent"
        maxWidth="md"
        spacing="comfortable"
        className={styles.storySection}
      />

      <StoryBlock
        headingLevel={2}
        subtitle="The Product"
        title="One Strip, One Blue"
        content={[
          <Text key="p1" size="s">
            The popover is a single horizontal strip of metric tiles, a slim
            battery row and a compact options menu. No cards, tabs or headings
            compete with the numbers. Readiness, Sleep and Activity appear as
            score rings; Heart rate and Stress are not scores, so they get an
            icon and a value instead of a fabricated progress ring.
          </Text>,
          <Text key="p2" size="s">
            Every normal score shares one signal blue. Giving each metric its
            own color would have turned a calm status strip into a generic
            fitness dashboard, so color is saved for the moments that need
            attention.
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
            src: "/images/portfolio/ring-stats/theme-ring-stats-v4.webp",
            alt: "Ring Stats theme: warm canvas, signal-blue score rings, Resilience enabled and battery at 76%",
            width: 1360,
            height: 522,
            caption:
              "The default theme: warm canvas, dark ink and one signal blue for every score.",
          },
          {
            type: "image",
            src: "/images/portfolio/ring-stats/theme-landscape-v4.webp",
            alt: "Landscape theme: the same stats in white over a dusky Nordic hillside photograph, with Resilience enabled",
            width: 1360,
            height: 522,
            caption:
              "Landscape, same moment: icons over an original Nordic photograph. Same labels, same states, same order.",
          },
        ]}
      />

      <GridBlock
        columns={1}
        gap="medium"
        backgroundColor="transparent"
        maxWidth="sm"
        spacing="comfortable"
        className={styles.imageGrid}
        cells={[
          {
            type: "image",
            src: "/images/portfolio/ring-stats/context-menu-v2.webp",
            alt: "Ring Stats menu with icons: Appearance, Connection, About & Credits, Diagnostics, Refresh Now, Reauthorize Permissions and Quit Ring Stats",
            width: 720,
            height: 670,
            caption:
              "One native menu for everything that is not a stat: settings, refresh, reauthorize and quit.",
          },
        ]}
      />

      <StoryBlock
        headingLevel={2}
        subtitle="Design System"
        title="The Quiet Signal Strip"
        content={[
          <Text key="p1" size="s">
            A small system with strict rules. Every tile has the same four zones
            in the same order: an 84-point visual, a value on a shared baseline,
            a title and one line of detail. Themes and metrics change the
            content of those zones, never the layout, so a Resilience level and
            a heart-rate number still line up.
          </Text>,
          <Text key="p2" size="s">
            Seven color tokens, three type roles and a four-step spacing scale
            cover the whole app. Themes change presentation only: a test fails
            the build if the two themes ever show different lines or labels for
            the same state.
          </Text>,
          <Text key="p3" size="s">
            In Figma, every view carries paired behavior and accessibility
            notes, so the spec says how each control works and how it is
            announced, not only how it looks.
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
        maxWidth="lg"
        spacing="comfortable"
        className={styles.imageGrid}
        cells={[
          {
            type: "image",
            src: "/images/portfolio/ring-stats/spec-annotated-v2.webp",
            alt: "Figma Application Views board with popover states, the About window, connection step 3 of 3 and the context menu, surrounded by blue Behavior and pink Accessibility notes linked to specific controls",
            width: 4720,
            height: 3380,
            caption:
              "The annotated spec: behavior in blue, accessibility in pink, each pinned to the control it describes.",
          },
        ]}
      />

      <StoryBlock
        headingLevel={2}
        subtitle="Decisions"
        title="Three Calls That Shaped It"
        content={[
          <Text key="p1" size="s">
            <strong>A status strip over a dashboard.</strong> Trends, history
            and recommendations already live in the phone app, where they are
            done well. Repeating them on the Mac would have made a slower copy
            of something better. The strip answers one question and gets out of
            the way.
          </Text>,
          <Text key="p2" size="s">
            <strong>Your own credentials over a shared secret.</strong> Each
            person registers their own developer application and enters its keys
            once. It adds a setup step, but no shared secret ships inside the
            app and no server sits between the ring and the Mac.
          </Text>,
          <Text key="p3" size="s">
            <strong>Hidden means not fetched.</strong> Turning a metric off in
            Appearance also removes it from the request and from the permissions
            asked for. Customization is a privacy control, not just a layout
            preference.
          </Text>,
          <Mermaid
            key="data-flow"
            chart={`%%{init: {"flowchart": {"subGraphTitleMargin": {"top": 12, "bottom": 12}}}}%%
flowchart LR
    ring("Ring")
    phone("Phone app\\nsyncs the ring")
    api("Oura API V2\\nenabled stats only")
    subgraph mac["Mac, App Sandbox"]
      app("Ring Stats\\nvalues in memory only")
      kc("Keychain\\ncredentials + tokens")
    end
    ring --> phone
    phone --> api
    api --> app
    app --- kc
    style mac stroke-dasharray:6 4`}
            themeColors={{
              color: "#375377",
              nodeBg: "#ffffff",
            }}
            className={styles.architectureDiagram}
          />,
        ]}
        imageLayout="none"
        backgroundColor="transparent"
        maxWidth="md"
        spacing="comfortable"
        className={styles.storySection}
      />

      <StoryBlock
        headingLevel={2}
        subtitle="Honest Freshness"
        title="Old Numbers Say They Are Old"
        content={[
          <Text key="p1" size="s">
            A wellness number shown as current when it is hours old is worse
            than no number at all. So a stat that fails to refresh keeps its
            last known value, dims and reads &ldquo;Not updated&rdquo; in text,
            not just in color. The status line says when data last arrived,
            confirms a successful refresh for three seconds and then fades away
            so the strip stays quiet.
          </Text>,
          <Text key="p2" size="s">
            Missing permissions get their own state and a direct fix instead of
            an endless partial refresh. Every one of these states is rendered by
            the test suite in both themes and at every supported width, so none
            of them is designed once and forgotten.
          </Text>,
        ]}
        imageLayout="none"
        backgroundColor="transparent"
        maxWidth="md"
        spacing="comfortable"
        className={styles.storySection}
      />

      <GridBlock
        columns={2}
        gap="medium"
        backgroundColor="transparent"
        maxWidth="lg"
        spacing="comfortable"
        className={styles.imageGrid}
        cells={[
          {
            type: "image",
            src: "/images/portfolio/ring-stats/state-partial-failure-v3.webp",
            alt: "Partial refresh: Sleep dimmed and marked Not updated, battery marked Not updated, status reads Some stats not updated",
            width: 840,
            height: 522,
            caption:
              "A partial refresh: Sleep and battery keep their last values and say so.",
          },
          {
            type: "image",
            src: "/images/portfolio/ring-stats/state-refreshing-v2.webp",
            alt: "Narrow popover while refreshing, with a small spinner in the status line",
            width: 840,
            height: 522,
            caption: "Refreshing, without hiding what is already known.",
          },
          {
            type: "image",
            src: "/images/portfolio/ring-stats/state-failed-v2.webp",
            alt: "Failed refresh: status reads Update failed one hour ago, with a timeout explanation above the battery row",
            width: 840,
            height: 588,
            caption: "A failed refresh names the cause and the age.",
          },
          {
            type: "image",
            src: "/images/portfolio/ring-stats/state-permission-required-v2.webp",
            alt: "Missing permission: an Enable Stress Access button below the metric strip",
            width: 840,
            height: 610,
            caption: "A missing permission comes with its own fix.",
          },
        ]}
      />

      <StoryBlock
        headingLevel={2}
        subtitle="Onboarding"
        title="Three Steps to Connected Securely"
        content={[
          <Text key="p1" size="s">
            Bring-your-own credentials is the least friendly part of the
            product, so it got the most design attention. Setup is three steps
            with a step indicator: create the application and learn why it is
            needed, add the callback address with a one-click copy, then enter
            the keys with a plain note that they stay in this Mac&apos;s
            Keychain.
          </Text>,
          <Text key="p2" size="s">
            The flow ends on a confirmation rather than a dialog dismissal:
            &ldquo;Connected securely&rdquo;, one sentence on where data lives
            and a single button that opens the stats.
          </Text>,
        ]}
        imageLayout="none"
        backgroundColor="transparent"
        maxWidth="md"
        spacing="comfortable"
        className={styles.storySection}
      />

      <GridBlock
        columns={2}
        gap="medium"
        backgroundColor="transparent"
        maxWidth="lg"
        spacing="comfortable"
        className={styles.imageGrid}
        cells={[
          {
            type: "image",
            src: "/images/portfolio/ring-stats/connection-create-application-v2.webp",
            alt: "Connection step 1 of 3: create an application in the developer portal",
            width: 920,
            height: 880,
            caption: "Step 1: why a developer application is needed.",
          },
          {
            type: "image",
            src: "/images/portfolio/ring-stats/connection-register-callback-v2.webp",
            alt: "Connection step 2 of 3: add the loopback callback URL, with a Copy button",
            width: 920,
            height: 880,
            caption: "Step 2: one address, one copy button.",
          },
          {
            type: "image",
            src: "/images/portfolio/ring-stats/connection-enter-credentials-v2.webp",
            alt: "Connection step 3 of 3: Client ID and Client Secret fields with a Keychain storage note",
            width: 920,
            height: 880,
            caption: "Step 3: keys go straight to the Keychain.",
          },
          {
            type: "image",
            src: "/images/portfolio/ring-stats/connection-connected-v2.webp",
            alt: "Connected securely confirmation with a shield icon and a Show My Stats button",
            width: 920,
            height: 880,
            caption: "The finish line says where the data lives.",
          },
        ]}
      />

      <StoryBlock
        headingLevel={2}
        subtitle="Accessibility"
        title="Evidence, not Intent"
        content={[
          <Text key="p1" size="s">
            Accessibility is tracked as a matrix where an item only counts as
            verified when a test or a dated manual check proves it. Small text
            meets 4.5:1 in both themes, including over the brightest pixel of
            the landscape photograph. Two failing tokens were caught this way
            and fixed before release.
          </Text>,
          <Text key="p2" size="s">
            macOS does not apply Dynamic Type to SwiftUI on the Mac, so Ring
            Stats has its own text size setting that scales type and tile
            geometry together. The stats row is fully keyboard operable: Tab to
            reach it, arrow keys to move and Option-arrow to reorder, with each
            move announced to VoiceOver.
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
        maxWidth="sm"
        spacing="comfortable"
        className={styles.imageGrid}
        cells={[
          {
            type: "image",
            src: "/images/portfolio/ring-stats/text-size-extra-large-v2.webp",
            alt: "Narrow popover at Extra Large text size, with larger rings and labels and no clipped text",
            width: 840,
            height: 612,
            caption:
              "Extra Large at the narrowest width: bigger type, bigger tiles, nothing clipped.",
          },
        ]}
      />

      <StoryBlock
        headingLevel={2}
        subtitle="Brand Identity"
        title="Respectful of the Ring It Reads"
        content={[
          <Text key="p1" size="s">
            Ring Stats is an independent project, not affiliated with or
            endorsed by Oura, and the identity makes that clear at a glance: a
            warm-neutral palette, native system type and icons, and an original
            mark. No borrowed logo, product silhouette, proprietary fonts or
            copied app chrome.
          </Text>,
          <Text key="p2" size="s">
            The mark is a ring seen at an angle, with a gap where the band turns
            away. The same mark works as the small icon in the menu bar and as
            the app icon.
          </Text>,
        ]}
        imageLayout="none"
        backgroundColor="transparent"
        maxWidth="md"
        spacing="comfortable"
        className={styles.storySection}
      />

      <GridBlock
        columns={3}
        gap="medium"
        backgroundColor="transparent"
        maxWidth="lg"
        spacing="comfortable"
        className={`${styles.imageGrid} ${styles.logoGrid}`}
        cells={[
          {
            type: "image",
            src: "/images/portfolio/ring-stats/logo-mark.webp",
            alt: "The Ring Stats mark on its own: a split ring seen at an angle",
            width: 1024,
            height: 1024,
            caption: "The mark.",
          },
          {
            type: "image",
            src: "/images/portfolio/ring-stats/logo-icon-black.webp",
            alt: "Ring Stats app icon: a white split ring on a black rounded square",
            width: 1024,
            height: 1024,
            caption: "The app icon.",
          },
          {
            type: "image",
            src: "/images/portfolio/ring-stats/logo-icon-holographic.webp",
            alt: "Ring Stats app icon variant: a dark split ring on a pastel holographic gradient",
            width: 1024,
            height: 1024,
            caption: "A holographic edition.",
          },
        ]}
      />

      <StoryBlock
        headingLevel={2}
        subtitle="Delivery"
        title="Signed, Notarized, Sandboxed"
        content={[
          <Text key="p1" size="s">
            Ring Stats ships as a Developer ID-signed, Apple-notarized universal
            disk image with a published checksum. It runs in the App Sandbox
            with four entitlements, has no third-party runtime dependencies and
            no analytics. Releases carry a software bill of materials and a
            signed provenance attestation.
          </Text>,
          <Text key="p2" size="s">
            146 automated tests cover the app, including a state gallery that
            renders every popover state in both themes and at three widths.
            Version 1.2 added Shortcuts actions for any stat or the battery, so
            the numbers also work in automations. Next: a moderated usability
            study with five to eight ring owners, manual VoiceOver and keyboard
            verification, and battery-first features such as an optional
            low-battery notification.
          </Text>,
        ]}
        imageLayout="none"
        backgroundColor="transparent"
        maxWidth="md"
        spacing="comfortable"
        className={styles.storySection}
      />
    </ProjectDetailLayout>
  );
}
