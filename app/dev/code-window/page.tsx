import CodeBlockWindow from "@dt/CodeBlockWindow";
import { Container } from "@dt/Container";
import Text from "@dt/Text";
import Title from "@dt/Title";
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
        <Title level={1} size="L" terminals="serif">
          Code Window Demo
        </Title>
        <Text as="p" size="M">
          This page showcases the macOS-style code block window with Shiki-ready
          markup, copy controls, and line numbers.
        </Text>
      </header>

      <section className={styles.section}>
        <Title level={2} size="M" terminals="serif">
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
        <Title level={2} size="M" terminals="serif">
          Bash / Curl
        </Title>
        <CodeBlockWindow language="bash">{fixture.bash}</CodeBlockWindow>
      </section>

      <section className={styles.section}>
        <Title level={2} size="M" terminals="serif">
          JSON Payload
        </Title>
        <CodeBlockWindow title="payload.json" language="json">
          {fixture.json}
        </CodeBlockWindow>
      </section>

      <section className={styles.section}>
        <Title level={2} size="M" terminals="serif">
          Long Line (Scroll)
        </Title>
        <CodeBlockWindow title="long-line.ts" language="ts">
          {fixture.longLine}
        </CodeBlockWindow>
      </section>

      <section className={`${styles.section} ${styles.darkPreview} themeDark`}>
        <Title level={2} size="M" terminals="serif">
          Dark Mode Preview
        </Title>
        <CodeBlockWindow title="theme-dark.tsx" language="tsx" showLineNumbers>
          {fixture.tsx}
        </CodeBlockWindow>
      </section>
    </Container>
  );
}
