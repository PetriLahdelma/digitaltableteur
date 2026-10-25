import {
  Code,
  CodeBlock,
  Container,
  Snippet,
  Text,
  Title,
} from "@digitaltableteur/react";
import { codeBlockFixtures } from "../../../nextjs-app/shared/components/CodeBlockWindow/codeBlockFixtures";
import { renderCodeBlockFixtureNode } from "../../../nextjs-app/shared/components/CodeBlockWindow/CodeBlockFixtureRenderer";
import styles from "./page.module.css";

const fixture = {
  tsx: renderCodeBlockFixtureNode(codeBlockFixtures.tsx.pre),
  json: renderCodeBlockFixtureNode(codeBlockFixtures.json.pre),
  longLine: renderCodeBlockFixtureNode(codeBlockFixtures.longLine.pre),
};

const configDiff = `module.exports = {
-  experimental: {
-    appDir: true,
-  },
+  reactStrictMode: true,
 }`;

const installSteps = `npm i -D stylelint stylelint-plugin-rhythmguard
npx stylelint "src/**/*.css"`;

export default function CodeWindowDemoPage() {
  return (
    <Container size="lg" className={styles.page}>
      <header className={styles.header}>
        <Title level={1} size="l">
          Code components
        </Title>
        <Text as="p" size="m">
          CodeBlock, Snippet and Code with Shiki markup from the MDX pipeline
          and strings highlighted at runtime: headers, line numbers, callout
          and diff rows, copy and the terminal theme.
        </Text>
      </header>

      <section className={styles.section}>
        <Title level={2} size="m">
          Shiki tree with filename and line numbers
        </Title>
        <CodeBlock filename="components/Greeting.tsx" lineNumbers>
          {fixture.tsx}
        </CodeBlock>
      </section>

      <section className={styles.section}>
        <Title level={2} size="m">
          Diff
        </Title>
        <CodeBlock
          code={configDiff}
          language="diff"
          filename="next.config.js"
          lineNumbers
          caption="Copy leaves the removed lines out."
        />
      </section>

      <section className={styles.section}>
        <Title level={2} size="m">
          JSON payload
        </Title>
        <CodeBlock filename="payload.json">{fixture.json}</CodeBlock>
      </section>

      <section className={styles.section}>
        <Title level={2} size="m">
          Long line: scroll and wrap
        </Title>
        <CodeBlock filename="long-line.ts">{fixture.longLine}</CodeBlock>
        <CodeBlock filename="long-line.ts" wrap>
          {fixture.longLine}
        </CodeBlock>
      </section>

      <section className={styles.section}>
        <Title level={2} size="m">
          Terminal and Snippet
        </Title>
        <CodeBlock code={installSteps} language="bash" theme="terminal" />
        <Snippet command="npm install @digitaltableteur/react" />
        <Snippet command="npx @digitaltableteur/cli init" theme="inverted" />
        <Text as="p" size="s">
          Inline: run <Code>init</Code>, then <Code>doctor</Code>.
        </Text>
      </section>
    </Container>
  );
}
