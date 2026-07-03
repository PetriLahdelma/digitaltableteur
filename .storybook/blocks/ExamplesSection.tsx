import React from "react";
import { Canvas, Markdown } from "@storybook/addon-docs/blocks";
import Text from "@dt/Text";
import type { PreparedDocsStory } from "./docsStories";
import { managerHref } from "./managerHref";
import { Section } from "./Section";
import styles from "./ExamplesSection.module.css";

function ExampleBlock({ story }: { story: PreparedDocsStory }) {
  const description = story.parameters?.docs?.description?.story as
    | string
    | undefined;
  return (
    <article className={styles.example}>
      <div className={styles.exampleHeader}>
        <Text as="h3" size="m" className={styles.exampleName}>
          {story.name}
        </Text>
        <a
          className={styles.canvasLink}
          href={managerHref(`/story/${story.id}`)}
          target="_top"
        >
          Open in canvas
        </a>
      </div>
      {description ? (
        <div className={styles.exampleDescription}>
          <Markdown>{description}</Markdown>
        </div>
      ) : null}
      <Canvas of={story.moduleExport} />
    </article>
  );
}

/**
 * Every story tagged `example`, rendered as a live canvas with code toggle
 * and a link back to the canvas view.
 */
export function ExamplesSection({
  stories,
}: {
  stories: PreparedDocsStory[];
}) {
  if (stories.length === 0) return null;
  return (
    <Section block="examples" heading="Examples">
      <div className={styles.list}>
        {stories.map((story) => (
          <ExampleBlock key={story.id} story={story} />
        ))}
      </div>
    </Section>
  );
}
