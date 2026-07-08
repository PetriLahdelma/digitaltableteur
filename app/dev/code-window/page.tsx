import {
  CodeBlockWindow,
  Container,
  Text,
  Title,
} from "@digitaltableteur/react";
import { codeBlockFixtures } from "@dt/CodeBlockWindow/codeBlockFixtures";
import { renderCodeBlockFixtureNode } from "@dt/CodeBlockWindow/CodeBlockFixtureRenderer";
import styles from "./page.module.css";

const fixture = {
  tsx: renderCodeBlockFixtureNode(codeBlockFixtures.tsx.pre),
  bash: renderCodeBlockFixtureNode(codeBlockFixtures.bash.pre),
  json: renderCodeBlockFixtureNode(codeBlockFixtures.json.pre),
  longLine: renderCodeBlockFixtureNode(codeBlockFixtures.longLine.pre),
};

export default function CodeWindowDemoPage() {
  return (
    <Container size="lg" className={styles.page}>
      <header className={styles.header}>
        <Title level={1} size="l">
          Code Window Demo
        </Title>
        <Text as="p" size="m">
          This page showcases the macOS-style code block window with Shiki-ready
          markup, copy controls, and line numbers.
        </Text>
      </header>

      <section className={styles.section}>
        <Title level={2} size="m">
          TypeScript + Title
        </Title>
        <CodeBlockWindow
          title="components/Greeting.tsx"
          language="tsx"
          showLineNumbers
        >
          {fixture.tsx}
        </CodeBlockWindow>
      </section>

      <section className={styles.section}>
        <Title level={2} size="m">
          Bash / Curl
        </Title>
        <CodeBlockWindow language="bash">{fixture.bash}</CodeBlockWindow>
      </section>

      <section className={styles.section}>
        <Title level={2} size="m">
          JSON Payload
        </Title>
        <CodeBlockWindow title="payload.json" language="json">
          {fixture.json}
        </CodeBlockWindow>
      </section>

      <section className={styles.section}>
        <Title level={2} size="m">
          Long Line (Scroll)
        </Title>
        <CodeBlockWindow title="long-line.ts" language="ts">
          {fixture.longLine}
        </CodeBlockWindow>
      </section>

      <section className={`${styles.section} ${styles.darkPreview} themeDark`}>
        <Title level={2} size="m">
          Dark Mode Preview
        </Title>
        <CodeBlockWindow
          title="theme-dark.tsx"
          language="tsx"
          showLineNumbers
        >
          {fixture.tsx}
        </CodeBlockWindow>
      </section>
    </Container>
  );
}
