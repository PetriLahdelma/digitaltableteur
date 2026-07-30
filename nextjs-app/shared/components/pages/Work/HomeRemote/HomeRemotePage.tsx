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
import { SiFigma, SiSwift } from "react-icons/si";
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
            src: "/images/portfolio/home-remote/hero-lockup.webp",
            alt: "Home Remote clay app icon next to the hand-modelled Home Remote wordmark",
            width: 2874,
            height: 1254,
          }}
          category={project.category.replace("-", " ")}
          tags={project.tags}
          date="Jul 2026 – Present"
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
              <p className={styles.metaText}>Jul 2026 – Present</p>
            </div>
            <div className={styles.metaBlock}>
              <Title as="h3" unstyled className={styles.metaLabel}>
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
            <Title as="h3" unstyled className={styles.metaLabel}>
              Overview
            </Title>
            <p className={styles.metaOverview}>
              <strong>Home Remote</strong> is a native macOS menu-bar remote
              for TVs, monitors, and other audio/video displays. Underneath
              sits a local-first daemon that owns independently paired
              connections per device, whatever the vendor, and controls
              whichever displays on the network complete pairing; the app, a
              CLI, and an MCP server all talk to the same
              permission-restricted API. Nothing leaves the local network.
            </p>
            <p className={styles.metaOverview}>
              <strong>The design challenge:</strong> make a remote control feel
              trustworthy and tactile at couch distance. The interface reports
              observed state rather than equating a transport acknowledgement
              with success, and every control is modelled in a warm clay
              material where raised means pressable and recessed means state.
            </p>
          </div>
        </div>
      </section>

      <StoryBlock
        subtitle="The Problem"
        title="Many Screens, Many Protocols, One Terminal"
        content={[
          <Text key="p1" size="s">
            Controlling TVs and displays from a Mac usually means a terminal.
            Every vendor speaks its own protocol, pairing is a ritual, and
            pausing a film should not require finding a shell. Speed and
            legibility matter more than exhaustive diagnostics when you are
            sitting across the room from the screen.
          </Text>,
          <Text key="p2" size="s">
            The remote had to preserve the daemon&apos;s honesty guarantees:
            show whether the screen is actually active rather than whether a
            standby network service happens to answer, distinguish command
            progress from acknowledgement from failure, and never imply success
            after an error.
          </Text>,
          <Mermaid
            key="architecture"
            chart={`flowchart LR
    subgraph mac["Mac · trusted LAN"]
      daemon["Local daemon\\nowns pairings + Keychain"]
      app["macOS app\\nmenu bar + window"]
      cli["hometv CLI"]
      mcp["MCP server"]
    end
    lg["TVs"]
    sam["Monitors + AV displays"]
    app --> daemon
    cli --> daemon
    mcp --> daemon
    daemon --> lg
    daemon --> sam`}
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
        title="One Popover, Three Honest Tabs"
        content={[
          <Text key="p1" size="s">
            The app is a single 330-point popover with three tabs. Remote puts
            availability first, then a vendor-specific control hierarchy: the
            five-way wheel, playback, volume, and verified streaming
            destinations, all one click deep. Devices handles selection and
            pairing as an inline maintenance state instead of a separate
            settings maze. Settings keeps appearance, key clicks, and motion
            preferences on plain rows.
          </Text>,
          <Text key="p2" size="s">
            Capability honesty drives the layout: panels omit any state or
            action the selected device cannot prove. A desktop monitor
            declares itself a monitor, reports no tuner, and refuses to
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
            surfaces are state, and a single light source sits at the top-left
            of every surface. Blocks sit on one 18-point rhythm.
          </Text>,
          <Text key="p2" size="s">
            Availability still reads as green, amber, or red, but never by
            color alone. Motion is a defined system for press, release, hover,
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
        className={styles.imageGrid}
        cells={[
          {
            type: "image",
            src: "/images/portfolio/home-remote/relief-specimen.webp",
            alt: "Relief specimen showing embossed, pressed, inert and recessed clay surfaces",
            width: 1288,
            height: 456,
            caption: "The relief vocabulary: embossed, pressed, inert, recess.",
          },
          {
            type: "image",
            src: "/images/portfolio/home-remote/clay-key-states.webp",
            alt: "Clay key, hub and dent components in idle, hover, pressed, focused and disabled states",
            width: 1224,
            height: 1212,
            caption:
              "Every key across idle, hover, pressed, focused, and disabled.",
          },
        ]}
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
            src: "/images/portfolio/home-remote/sheet-wheel.webp",
            alt: "Five-way navigation wheel component sheet",
            width: 692,
            height: 692,
            caption: "The five-way wheel, the layout's dominant control.",
          },
          {
            type: "image",
            src: "/images/portfolio/home-remote/sheet-rockers.webp",
            alt: "Volume, playback and channel rocker component sheets",
            width: 636,
            height: 760,
            caption: "Rockers for volume, transport, and channel.",
          },
          {
            type: "image",
            src: "/images/portfolio/home-remote/sheet-power.webp",
            alt: "Power key in destructive red and accent violet variants",
            width: 608,
            height: 432,
            caption:
              "One Power control that follows observed availability, never a guess.",
          },
          {
            type: "image",
            src: "/images/portfolio/home-remote/sheet-tabs.webp",
            alt: "Remote, Devices and Settings segmented tab states",
            width: 1028,
            height: 708,
            caption: "The three-tab segmented control.",
          },
          {
            type: "image",
            src: "/images/portfolio/home-remote/sheet-toasts.webp",
            alt: "Status toasts in available, warning and error tints",
            width: 710,
            height: 612,
            caption: "Status is tinted and worded, never color alone.",
          },
          {
            type: "image",
            src: "/images/portfolio/home-remote/sheet-volume-steps.webp",
            alt: "Volume step segmented control set to one, two and five steps",
            width: 424,
            height: 480,
            caption: "Volume step size as a recessed segmented control.",
          },
        ]}
      />

      <StoryBlock
        subtitle="State Before Action"
        title="An Interface That Refuses to Lie"
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
            src: "/images/portfolio/home-remote/sheet-pair-cta.webp",
            alt: "Pair This TV call to action in primary and quiet variants",
            width: 996,
            height: 520,
            caption: "Pairing surfaces only when authorization actually fails.",
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
            The identity is modelled, not drawn. A little clay television and
            its remote were built like physical objects, through measured
            construction, form iterations from angular to soft, and material
            studies that picked the violet accent now running through the
            app, the icon, and the installer as one palette.
          </Text>,
          <Text key="p2" size="s">
            The wordmark got the same treatment: hand-modelled clay letters
            with the softness of the interface material, so the brand and the
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
            src: "/images/portfolio/home-remote/icon-clay.webp",
            alt: "Final Home Remote clay app icon render",
            width: 1254,
            height: 1254,
            caption: "The finished icon: the whole product in one object.",
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
            remote in hand. The X-ray variant is the loading state; it shows
            the same scene the way the daemon sees the TV, structure first.
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
            src: "/images/portfolio/home-remote/making-render-2.webp",
            alt: "Clay illustration of a person in an armchair pointing a remote, cat asleep by a floor lamp",
            width: 1023,
            height: 1537,
            caption: "The settings-pane illustration.",
          },
          {
            type: "image",
            src: "/images/portfolio/home-remote/making-render-1.webp",
            alt: "X-ray styled clay illustration of a skeleton in an armchair holding a remote",
            width: 922,
            height: 897,
            caption: "The X-ray loading state.",
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
        subtitle="Shipping"
        title="Signed, Notarized, and DMG'd"
        content={[
          <Text key="p1" size="s">
            Home Remote 0.2.0 shipped as a Developer ID-signed, notarized,
            stapled disk image with a live update feed. The installer carries
            the same palette as the icon and the app: one violet, three
            surfaces, no separate marketing skin.
          </Text>,
          <Text key="p2" size="s">
            The release notes practice the same honesty as the interface. The
            remote controls whichever devices complete pairing, from
            televisions to desktop monitors, while the release checklist
            claims only what has been observed working.
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
            src="/images/portfolio/home-remote/dmg-installer.webp"
            alt="Home Remote disk image window with clay wordmark and drag-to-Applications arrow"
            width={1504}
            height={1120}
            className={styles.installerImage}
          />
        </div>
        <Text size="xs" className={styles.installerCaption}>
          The disk image: installer, icon, and app share one palette rather
          than three.
        </Text>
      </div>
    </ProjectDetailLayout>
  );
}
