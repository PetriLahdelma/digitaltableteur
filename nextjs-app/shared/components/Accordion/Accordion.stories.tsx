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
import Accordion from "./Accordion";
import { within, userEvent, waitFor } from "@storybook/testing-library";
import CodeSnippet from "@dt/CodeSnippet";
import schema from "./schema.json";
import styles from "../shared-stories.module.css";

const meta: Meta<typeof Accordion> = {
  title: "Components/Accordion",
  component: Accordion,
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
type Story = StoryObj<typeof Accordion>;

export const Default: Story = {
  args: {
    items: [
      {
        id: "one",
        title: "What is Digitaltableteur?",
        content: "We are a design and engineering studio.",
      },
      {
        id: "two",
        title: "Do you work with AI?",
        content: "Yes, responsibly—with human oversight.",
      },
      {
        id: "three",
        title: "How can I contact you?",
        content: "Email mail@digitaltableteur.com.",
      },
    ],
  },
};
Default.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);

  // Click first accordion item to expand
  const firstButton = canvas.getByRole("button", {
    name: /what is digitaltableteur/i,
  });
  await userEvent.click(firstButton);

  // Wait for content to appear
  await waitFor(() => {
    const content = canvas.queryByText(/design and engineering studio/i);
    return content !== null;
  });

  // Click second accordion item
  const secondButton = canvas.getByRole("button", {
    name: /do you work with ai/i,
  });
  await userEvent.click(secondButton);

  // Wait for second content
  await waitFor(() => {
    const content = canvas.queryByText(/responsibly/i);
    return content !== null;
  });
};
