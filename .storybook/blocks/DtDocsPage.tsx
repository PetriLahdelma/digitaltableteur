import React, { useContext } from "react";
import {
  Controls,
  Description,
  DocsContext,
  DocsStory,
  Primary,
  Stories,
  Subtitle,
  Title as SbTitle,
} from "@storybook/addon-docs/blocks";
import elementDefinitions from "../../packages/web-components/web-components.config.mjs";
import {
  componentNameFromDocsContext,
  getContractByName,
  storyIdFromTitle,
  titleByComponentName,
} from "../lib/contracts";
import type { PreparedDocsStory } from "./docsStories";
import { managerHref } from "./managerHref";
import AlertBanner from "@dt/AlertBanner";
import { A11ySection } from "./A11ySection";
import { AnatomySection } from "./AnatomySection";
import { BestPractices } from "./BestPractices";
import { DocHeader } from "./DocHeader";
import { ExamplesSection } from "./ExamplesSection";
import { ImportBlock } from "./ImportBlock";
import { PropsSection } from "./PropsSection";
import { RelatedSection } from "./RelatedSection";
import { ShowcaseStage } from "./ShowcaseStage";
import { ThemingSection } from "./ThemingSection";
import { UsageSection } from "./UsageSection";
import { Section } from "./Section";
import { WebComponentApiSection } from "./WebComponentApiSection";
import Text from "@dt/Text";
import styles from "./DtDocsPage.module.css";

const LIFECYCLE_STATUSES = ["alpha", "beta", "stable", "deprecated"] as const;

/** Required-story names that must not repeat inside the Examples list. */
const NON_EXAMPLE_NAMES = new Set([
  "Default",
  "Playground",
  "Example",
  "ForcedColors",
  "Forced Colors",
]);

function WebComponentUsage({
  description,
  tagName,
  slots,
  events,
}: {
  description: string;
  tagName: string;
  slots: Array<{ name: string; description: string }>;
  events: Array<{ name: string }>;
}) {
  const slotNames = slots.map((slot) => slot.name || "default").join(", ");
  const eventNames = events.map((event) => event.name).join(", ");
  return (
    <Section block="usage" heading="Usage">
      <Text as="p" lineHeight="relaxed">
        {description} Import the package once, then use {`<${tagName}>`} in
        ordinary HTML or any framework.
      </Text>
      {slotNames ? (
        <Text as="p" lineHeight="relaxed">
          Slots: {slotNames}.
        </Text>
      ) : null}
      {eventNames ? (
        <Text as="p" lineHeight="relaxed">
          Custom events: {eventNames}.
        </Text>
      ) : null}
    </Section>
  );
}

function hrefForComponent(name: string): string | null {
  const title = titleByComponentName[name];
  if (!title) return null;
  return managerHref(`/docs/${storyIdFromTitle(title)}--docs`);
}

/**
 * The DT autodocs template (Astryx-style docs frame). Contract-backed
 * components get the 11-block page; everything else falls back to the
 * classic Storybook autodocs composition so patterns/site stories keep
 * working docs without contracts.
 */
export function DtDocsPage() {
  const context = useContext(DocsContext);
  const stories = context.componentStories() as unknown as PreparedDocsStory[];

  const preparedMeta = context.resolveOf("meta", ["meta"]) as unknown as {
    preparedMeta?: {
      component?: unknown;
      title?: string;
      parameters?: { implementation?: string };
    };
  };
  const name = componentNameFromDocsContext({
    component: preparedMeta.preparedMeta?.component,
    title: preparedMeta.preparedMeta?.title ?? "",
  } as Parameters<typeof componentNameFromDocsContext>[0]);
  const contract = name ? getContractByName(name) : null;
  const implementation =
    preparedMeta.preparedMeta?.parameters?.implementation === "web-component"
      ? "web-component"
      : "react";
  const implementationStatus = LIFECYCLE_STATUSES.find((status) =>
    stories.some((story) => story.tags?.includes(status)),
  );
  const primary =
    stories.find((story) => story.name === "Default") ?? stories[0] ?? null;
  const playground =
    stories.find((story) => story.name === "Playground") ?? null;
  const examples = stories.filter(
    (story) =>
      story.tags?.includes("example") && !NON_EXAMPLE_NAMES.has(story.name),
  );

  if (!contract) {
    return (
      <>
        <SbTitle />
        <Subtitle />
        <Description />
        <Primary />
        <Controls />
        <Stories />
      </>
    );
  }

  if (implementation === "web-component") {
    const element = elementDefinitions.find(
      (definition) => definition.sourceComponent === contract.name,
    );
    return (
      <div className={styles.page}>
        <DocHeader
          contract={contract}
          implementation="web-component"
          implementationStatus={implementationStatus ?? "alpha"}
        />
        {primary ? (
          <ShowcaseStage>
            <DocsStory
              of={primary.moduleExport}
              expanded={false}
              withToolbar={false}
              __primary
            />
          </ShowcaseStage>
        ) : null}
        {element ? (
          <>
            <ImportBlock
              contract={contract}
              implementation="web-component"
              tagName={element.tagName}
            />
            <WebComponentUsage
              description={element.description}
              tagName={element.tagName}
              slots={element.slots}
              events={element.events}
            />
          </>
        ) : null}
        <ExamplesSection stories={examples} />
        {element ? <WebComponentApiSection props={element.props} /> : null}
        <PropsSection playground={playground} heading="Playground" />
        <RelatedSection
          contract={contract}
          hrefForComponent={hrefForComponent}
        />
      </div>
    );
  }

  // Showcase the canonical Default story (spec 3.2 A item 2); fall back to
  // the first story for components whose Default is an alias re-export.
  return (
    <div className={styles.page}>
      <DocHeader contract={contract} implementation="react" />
      {contract.status === "deprecated" ? (
        <AlertBanner
          tone="warning"
          title="Deprecated"
          description={
            contract.deprecatedReason ??
            "This component is deprecated; do not use it in new work."
          }
        />
      ) : null}
      {primary ? (
        <ShowcaseStage>
          <DocsStory
            of={primary.moduleExport}
            expanded={false}
            withToolbar={false}
            __primary
          />
        </ShowcaseStage>
      ) : null}
      <ImportBlock contract={contract} />
      <UsageSection contract={contract} />
      <BestPractices contract={contract} />
      <AnatomySection contract={contract} />
      <ExamplesSection stories={examples} />
      <PropsSection playground={playground} />
      <ThemingSection contract={contract} />
      <A11ySection contract={contract} />
      <RelatedSection contract={contract} hrefForComponent={hrefForComponent} />
    </div>
  );
}
