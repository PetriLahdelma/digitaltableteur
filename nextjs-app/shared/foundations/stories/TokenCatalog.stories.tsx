import type { Meta, StoryObj } from "@storybook/react-vite";
import { DocSection, FoundationPage, TokenCatalogSearch } from "../doc";

const meta = {
  title: "Foundations/Token catalog",
  parameters: { layout: "fullscreen" },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  render: () => (
    <FoundationPage
      title="Token catalog"
      lead="Searchable index of every production custom property. Regenerate with npm run build:tokens after editing variables.css."
    >
      <DocSection title="All tokens">
        <TokenCatalogSearch />
      </DocSection>
    </FoundationPage>
  ),
};
