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
import {
  componentNameFromDocsContext,
  getContractByName,
  storyIdFromTitle,
  titleByComponentName,
} from "../lib/contracts";
import type { PreparedDocsStory } from "./docsStories";
import { managerHref } from "./managerHref";
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
import styles from "./DtDocsPage.module.css";

/** Required-story names that must not repeat inside the Examples list. */
const NON_EXAMPLE_NAMES = new Set(["Default", "Playground", "ForcedColors"]);

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
    preparedMeta?: { component?: unknown; title?: string };
  };
  const name = componentNameFromDocsContext({
    component: preparedMeta.preparedMeta?.component,
    title: preparedMeta.preparedMeta?.title ?? "",
  } as Parameters<typeof componentNameFromDocsContext>[0]);
  const contract = name ? getContractByName(name) : null;

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

  // Showcase the canonical Default story (spec 3.2 A item 2); fall back to
  // the first story for components whose Default is an alias re-export.
  const primary =
    stories.find((story) => story.name === "Default") ?? stories[0] ?? null;
  const playground =
    stories.find((story) => story.name === "Playground") ?? null;
  const examples = stories.filter(
    (story) =>
      story.tags?.includes("example") && !NON_EXAMPLE_NAMES.has(story.name),
  );

  return (
    <div className={styles.page}>
      <DocHeader contract={contract} />
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
