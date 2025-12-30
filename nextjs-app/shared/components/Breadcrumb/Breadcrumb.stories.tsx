import type { Meta, StoryObj } from "@storybook/react";
import {
  Controls,
  Description,
  Heading,
  Primary,
  Stories,
  Subtitle,
  Title,
} from "@storybook/addon-docs/blocks";
import React from "react";
import Breadcrumb from "@dt/Breadcrumb";
import CodeSnippet from "@dt/CodeSnippet";
import schema from "./schema.json";
import styles from "../shared-stories.module.css";

const meta: Meta<typeof Breadcrumb> = {
  title: "Components/Breadcrumb",
  component: Breadcrumb,
  tags: ["autodocs"],
  parameters: {
    llm: {
      schema,
    },
    docs: {
      page: () => (
        <>
          <Primary />
          <Title />
          <Subtitle />
          <Description />
          <Controls />
          <Stories />
          <details className={styles.schemaDetails}>
            <summary className={styles.schemaSummary}>
              <Heading>LLM Schema</Heading>
            </summary>
            <div className={styles.schemaContent}>
              <CodeSnippet
                code={JSON.stringify(schema, null, 2)}
                language="json"
                variant="multi"
                maxLines={20}
                showLineNumbers={true}
                allowCopy={true}
              />
            </div>
          </details>
        </>
      ),
    },
  },
};

export default meta;
type Story = StoryObj<typeof Breadcrumb>;

export const Default: Story = {
  args: {
    items: [
      { label: "Home", href: "/" },
      { label: "Blog", href: "/blog" },
      { label: "Article" },
    ],
  },
};
