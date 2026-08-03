"use client";

import React from "react";
import Image from "next/image";
import { Text, Title } from "@digitaltableteur/react";
import { Mermaid } from "../../../Mermaid";
import StoryBlock from "../../../../patterns/StoryBlock";
import GridBlock from "../../../../patterns/GridBlock";
import { ProjectDetailLayout } from "../../../../patterns/ProjectDetailLayout";
import { ProjectHero } from "../../../../patterns/ProjectHero";
import { RelatedProjects } from "../../../../patterns/RelatedProjects";
import { ProjectNav } from "../../../ProjectNav";
import { getProjectBySlug } from "../../../../data/projects";
import { SiFigma, SiOpenai, SiSwift } from "react-icons/si";
import { ClaudeIcon } from "../../../AskAI/ai-icons";

import styles from "./homeRemote.module.css";

export function HomeRemotePage({ nav }: { nav?: React.ReactNode }) {
  const project = getProjectBySlug("home-remote");

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
            src: "/images/portfolio/home-remote/hero-v2.webp",
            alt: "Home Remote clay app icon next to the hand-modelled Home Remote wordmark",
            width: 1596,
            height: 731,
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
              <Title as="h3" unstyled className={styles.metaLabel}>
                Services
              </Title>
              <p className={styles.metaText}>
                Product Design, Interaction Design, Brand Identity, macOS
                Development
              </p>
            </div>
            <div className={styles.metaBlock}>
              <Title as="h3" unstyled className={styles.metaLabel}>
                Duration
              </Title>
              <p className={styles.metaText}>Aug 2026</p>
            </div>
            <div className={styles.metaBlock}>
              <Title as="h3" unstyled className={styles.metaLabel}>
                Tools used
              </Title>
              <div className={styles.metaTools}>
                <SiFigma size={24} title="Figma" />
                <SiSwift size={24} title="Swift / SwiftUI" />
                <ClaudeIcon width={24} height={24} aria-label="Claude AI" />
                <SiOpenai size={24} title="ImageGen — AI-assisted visuals" />
              </div>
            </div>
          </div>
          <div className={styles.metaRight}>
            <Title as="h3" unstyled className={styles.metaLabel}>
              Overview
            </Title>
            <p className={styles.metaOverview}>
              <strong>Home Remote</strong> is a native macOS menu-bar remote
              for TVs, monitors and other audio/video equipment. A local
              daemon manages independently paired connections for each
              supported device. The macOS app, CLI and MCP server use the
              same restricted local API, while device-control traffic remains
              on the trusted network.
            </p>
            <p className={styles.metaOverview}>
              <strong>The design challenge:</strong> make a remote control feel
              trustworthy and tactile at couch distance. Every control is
              modelled in a warm clay material where raised means pressable
              and recessed means state.
            </p>
          </div>
        </div>
      </section>

      <StoryBlock
        subtitle="Context"
        title="One Person, Every Role"
        content={[
          <Text key="p1" size="s">
            A weekend solo project end to end: product design, brand, SwiftUI
            development and release engineering by one person. The
            constraints were self-imposed and strict: local-first privacy
            with no cloud account, vendor protocol quirks handled without
            vendor apps and a visual system that survives both a Dock window
            and a menu-bar popover.
          </Text>,
          <Text key="p2" size="s">
            The user is whoever is across the room from the screen. The jobs
            are short and impatient: pause or resume, nudge or mute volume,
            launch a streaming app, switch inputs, wake or power off and
            confirm what is actually playing.
          </Text>,
        ]}
        imageLayout="none"
        backgroundColor="transparent"
        maxWidth="md"
        spacing="comfortable"
        className={styles.storySection}
      />

      <StoryBlock
        subtitle="The Problem"
        title="Many Screens, Many Protocols, One Terminal"
        content={[
          <Text key="p1" size="s">
            Existing desktop controls were fragmented across vendor apps,
            command-line tools and inconsistent pairing flows. Speed and
            legibility matter more than exhaustive diagnostics when you are
            sitting across the room from the screen.
          </Text>,
          <Text key="p2" size="s">
            The remote also had to be precise about state: show whether the
            screen is actually active rather than whether a standby service
            happens to answer and never imply success after an error.
          </Text>,
          <Mermaid
            key="architecture"
            chart={`%%{init: {"flowchart": {"subGraphTitleMargin": {"top": 12, "bottom": 12}}}}%%
flowchart LR
    subgraph mac["Mac · trusted LAN"]
      daemon("Local daemon\\nowns pairings + Keychain")
      app("macOS app\\nmenu bar + window")
      cli("hometv CLI")
      mcp("MCP server")
    end
    lg("TVs")
    sam("Monitors + AV displays")
    app --> daemon
    cli --> daemon
    mcp --> daemon
    daemon --> lg
    daemon --> sam
    style mac stroke-dasharray:6 4`}
            themeColors={{
              color: "#8c6bff",
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
        subtitle="The Product"
        title="One Popover, Three Focused Tabs"
        content={[
          <Text key="p1" size="s">
            The interface fits into a compact 330-point menu-bar popover
            organized around three tasks: control, device maintenance and
            preferences. Remote puts availability first, then the control
            hierarchy: the five-way wheel, playback, volume and verified
            streaming destinations, all one click deep. Devices handles
            selection and pairing as an inline maintenance state instead of a
            separate settings maze. Settings keeps appearance, key clicks and
            motion preferences on plain rows.
          </Text>,
          <Text key="p2" size="s">
            Capability honesty drives the layout: panels omit any state or
            action the selected device cannot prove. A desktop monitor
            declares itself a monitor, reports no tuner and refuses to
            pretend to change channels.
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
        maxWidth="md"
        spacing="comfortable"
        className={styles.tabsGrid}
        cells={[
          {
            type: "image",
            src: "/images/portfolio/home-remote/app-remote-tab.webp",
            alt: "Home Remote Remote tab with clay five-way wheel, playback and volume rockers",
            width: 1044,
            height: 1870,
          },
          {
            type: "image",
            src: "/images/portfolio/home-remote/app-devices-tab.webp",
            alt: "Home Remote Devices tab showing the selected device with verified capability chips",
            width: 1044,
            height: 1870,
          },
          {
            type: "image",
            src: "/images/portfolio/home-remote/app-settings-tab.webp",
            alt: "Home Remote Settings tab with theme, key clicks and reduced-motion rows",
            width: 1044,
            height: 1870,
          },
        ]}
      />
      <Text size="xs" className={styles.gridCaption}>
        The three tabs: Remote, Devices, Settings. Availability first,
        pairing as inline maintenance, preferences on plain rows.
      </Text>

      <StoryBlock
        subtitle="Material System"
        title="Clay: Raised Means Pressable"
        content={[
          <Text key="p1" size="s">
            The interface is built from a bespoke warm-clay material with named
            tokens, each carrying a light and a dark value. The relief language
            does the explaining: embossed surfaces are pressable, debossed
            surfaces are state and a single light source sits at the top-left
            of every surface. Blocks sit on one 18-point rhythm.
          </Text>,
          <Text key="p2" size="s">
            Availability still reads as green, amber, or red, but never by
            color alone. Motion is a defined system for press, release, hover
            and state, and the panel ORs the system Reduce Motion setting with
            its own preference.
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
        className={`${styles.imageGrid} ${styles.claySpecimenGrid}`}
        cells={[
          {
            type: "image",
            src: "/images/portfolio/home-remote/color-specimen-v2.webp",
            alt: "Color specimen with four clay swatches: violet, cream, charcoal and live green",
            width: 680,
            height: 280,
            caption:
              "Four example colors from the palette: violet for focus, cream for keys, charcoal for type and live green for online status.",
          },
          {
            type: "image",
            src: "/images/portfolio/home-remote/relief-specimen-v3.webp",
            alt: "Relief specimen showing embossed, pressed, inert and recessed clay surfaces",
            width: 680,
            height: 264,
            caption: "The relief vocabulary: embossed, pressed, inert and recess.",
          },
          {
            type: "image",
            src: "/images/portfolio/home-remote/clay-key-states-v3.webp",
            alt: "Clay key, hub and dent components in idle, hover, pressed, focused and disabled states",
            width: 648,
            height: 642,
            caption:
              "Every key across idle, hover, pressed, focused and disabled.",
          },
        ]}
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
            src: "/images/portfolio/home-remote/sheet-wheel.webp",
            alt: "Five-way navigation wheel component sheet",
            width: 692,
            height: 692,
            caption:
              "The five-way wheel: one dominant control, sized for hitting without looking. Every other key defers to it.",
          },
          {
            type: "image",
            src: "/images/portfolio/home-remote/sheet-toasts.webp",
            alt: "Status toasts in available, warning and error tints",
            width: 710,
            height: 612,
            caption:
              "Status is tinted and worded, never color alone; the same rule covers the LEDs and every toast.",
          },
        ]}
      />

      <StoryBlock
        subtitle="Decisions"
        title="Three Calls That Shaped It"
        content={[
          <Text key="p1" size="s">
            <strong>Thin client over direct connections.</strong> The app
            never touches credentials or sockets; it invokes the CLI against
            the daemon&apos;s restricted API. The rejected alternative, an app
            that owns its own pairings, would have duplicated trust in two
            places and made every surface a security boundary.
          </Text>,
          <Text key="p2" size="s">
            <strong>Capability-honest panels over a universal layout.</strong>{" "}
            A control that cannot be proven for the selected device is not
            rendered. The rejected alternative was the familiar universal
            remote: one static layout where half the buttons are dead
            depending on what you point it at.
          </Text>,
          <Text key="p3" size="s">
            <strong>Clay relief over native flat controls.</strong> Standard
            system controls read poorly from across a room. The relief
            language makes pressable versus state legible at couch distance,
            at the cost of maintaining a bespoke material system.
          </Text>,
        ]}
        imageLayout="none"
        backgroundColor="transparent"
        maxWidth="md"
        spacing="comfortable"
        className={styles.storySection}
      />

      <StoryBlock
        subtitle="State Before Action"
        title="Observed State, Not Assumed State"
        content={[
          <Text key="p1" size="s">
            The status LED next to each device name reports observed state:
            green when the screen is provably active, amber while something is
            in flight, red when trust or reachability fails. Pair This TV
            appears prominently only on an authorization failure; deliberate
            re-pairing stays tucked in the header menu where it cannot be hit
            by accident.
          </Text>,
          <Text key="p2" size="s">
            The thin client never touches credentials. The app invokes the CLI
            with a captured device ID and structured arguments; pairing keys
            live in the macOS Keychain, readable only by the daemon.
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
        className={styles.imageGrid}
        cells={[
          {
            type: "image",
            src: "/images/portfolio/home-remote/sheet-status-leds.webp",
            alt: "Status LED beads in green, amber, red and grey",
            width: 536,
            height: 326,
            caption: "Observed state, at a glance.",
          },
          {
            type: "image",
            src: "/images/portfolio/home-remote/sheet-pair-cta-v2.webp",
            alt: "Pair This TV call to action in primary and quiet variants",
            width: 996,
            height: 520,
            caption: "One-click pairing.",
          },
          {
            type: "image",
            src: "/images/portfolio/home-remote/sheet-settings-rows.webp",
            alt: "Settings rows with toggle, slider and segmented control variants",
            width: 868,
            height: 648,
            caption: "One row grammar for every setting.",
          },
        ]}
      />

      <StoryBlock
        subtitle="Brand Identity"
        title="A Remote You Would Leave on the Couch"
        content={[
          <Text key="p1" size="s">
            The identity was explored with AI image generation and refined by
            hand: a little clay television and its remote, developed through
            retrospective construction studies, form iterations from angular
            to soft and material studies that picked the violet accent now
            running through the app, the icon and the installer as one
            palette.
          </Text>,
          <Text key="p2" size="s">
            The wordmark got the same treatment: clay letters generated in the
            same material language as the interface, so the brand and the
            buttons feel like they were fired in the same kiln.
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
        gap="large"
        backgroundColor="transparent"
        maxWidth="lg"
        spacing="comfortable"
        className={styles.imageGrid}
        cells={[
          {
            type: "image",
            src: "/images/portfolio/home-remote/icon-clay-v2.webp",
            alt: "Final Home Remote clay app icon render",
            width: 731,
            height: 731,
            caption: "Icon: the whole product in one object.",
          },
          {
            type: "image",
            src: "/images/portfolio/home-remote/wordmark-clay.webp",
            alt: "Hand-modelled clay Home Remote wordmark",
            width: 1536,
            height: 1024,
            caption: "The clay wordmark in the interface palette.",
          },
        ]}
      />

      <StoryBlock
        subtitle="Illustration"
        title="Couch Companions"
        content={[
          <Text key="p1" size="s">
            A small illustration series carries the clay world into empty
            states and the settings pane: someone sinking into an armchair,
            remote in hand. The X-ray variant is the loading state and it
            earns its place functionally: it gives the pairing wait a face,
            makes progress feel shorter than a bare spinner would and keeps
            the brand present in the app&apos;s least glamorous moment.
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
        className={styles.imageGrid}
        cells={[
          {
            type: "image",
            src: "/images/portfolio/home-remote/illustrations-light.webp",
            alt: "Two clay illustrations: a man in a hoodie and a woman with a sleeping cat, each in an armchair pointing a remote",
            width: 957,
            height: 1925,
            caption: "The app clay illustrations.",
          },
          {
            type: "image",
            src: "/images/portfolio/home-remote/illustrations-dark.webp",
            alt: "The same two armchair scenes as X-ray styled skeleton illustrations in translucent blue",
            width: 957,
            height: 1925,
            caption: "The app clay illustrations for dark mode.",
          },
          {
            type: "image",
            src: "/images/portfolio/home-remote/remote-render-tall.webp",
            alt: "Full Home Remote window with the couch illustration below the controls",
            width: 1044,
            height: 2390,
            caption: "In place, under the controls.",
          },
        ]}
      />

      <StoryBlock
        subtitle="Delivery"
        title="Signed, Notarized and DMG'd"
        content={[
          <Text key="p1" size="s">
            Home Remote 0.2.0, a release-candidate build, is a Developer
            ID-signed, notarized, stapled disk image with a live update feed.
            The installer carries the same palette as the icon and the app:
            one violet, three surfaces, no separate marketing skin.
          </Text>,
          <Text key="p2" size="s">
            Acceptance is hardware-in-the-loop: a release matrix run in front
            of both configured displays, covering pairing cycles, cold boots,
            eight-hour standby checks, a ten-cycle endurance row and
            network-loss behaviour, retained as sanitized evidence. A
            transport acknowledgement is never recorded as proof that a panel
            changed.
          </Text>,
          <Text key="p3" size="s">
            Verified so far: two device classes, a television and a desktop
            monitor, controlled daily. Voice control and the generic remote
            gateway remain experimental. Next: broaden the verified device
            matrix and move pairing for more vendors from the terminal into
            the app.
          </Text>,
        ]}
        imageLayout="none"
        backgroundColor="transparent"
        maxWidth="md"
        spacing="comfortable"
        className={styles.storySection}
      />

      <div className={styles.installerSection}>
        <div className={styles.installerWrapper}>
          <Image
            src="/images/portfolio/home-remote/dmg-installer-v2.webp"
            alt="Home Remote disk image window with clay wordmark and drag-to-Applications arrow"
            width={1504}
            height={1120}
            className={styles.installerImage}
          />
        </div>
        <Text size="xs" className={styles.installerCaption}>
          The disk image: installer, icon and app share one palette.
        </Text>
      </div>
    </ProjectDetailLayout>
  );
}
