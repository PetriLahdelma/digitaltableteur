import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  DocSection,
  FoundationPage,
  getCatalogGroups,
  TokenTable,
} from "../doc";
import styles from "../doc/FoundationDoc.module.css";

const meta = {
  title: "Foundations/Focus",
  parameters: { layout: "fullscreen" },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  render: () => {
    const tokens = getCatalogGroups("focus").flatMap((g) => g.tokens);
    return (
      <FoundationPage
        title="Focus"
        lead="Visible focus rings meet WCAG 2.2 focus appearance guidance. Width and offset increase in high-contrast themes."
      >
        <DocSection title="Focus ring tokens">
          <TokenTable tokens={tokens} />
          <p style={{ marginBlock: "var(--space-layout-16)" }}>
            Interactive example (tab to focus):
          </p>
          <button type="button" className={styles.focusDemo}>
            Focusable control
          </button>
        </DocSection>
      </FoundationPage>
    );
  },
};
