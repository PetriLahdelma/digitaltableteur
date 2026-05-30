import type { Meta, StoryObj } from "@storybook/react-vite";
import { DonnyActionProvider, useDonnyActions } from "./DonnyActionProvider";
import Button from "@dt/Button";

function DemoPanel() {
  const { showPageTarget, clearPageTarget, capturePageContext } =
    useDonnyActions();

  return (
    <div style={{ display: "grid", gap: "1rem", maxWidth: 420 }}>
      <section data-donny-target="home.contactCta">
        <p>Sample target for Donny highlight demos.</p>
      </section>
      <Button
        variant="primary"
        onClick={() =>
          showPageTarget({
            targetId: "home.contactCta",
            mode: "highlight",
            highlightMode: "spotlight",
          })
        }
      >
        Highlight sample target
      </Button>
      <Button variant="secondary" onClick={() => clearPageTarget()}>
        Clear highlight
      </Button>
      <Button
        variant="secondary"
        onClick={() => {
          // eslint-disable-next-line no-console
          console.log(capturePageContext());
        }}
      >
        Log page context
      </Button>
    </div>
  );
}

const meta: Meta<typeof DonnyActionProvider> = {
  title: "Providers/DonnyActionProvider",
  component: DonnyActionProvider,
  tags: ["wip", "!autodocs"],
  parameters: {
    layout: "centered",
    a11y: { test: "todo" },
  },
};

export default meta;

type Story = StoryObj<typeof DonnyActionProvider>;

export const Default: Story = {
  render: () => (
    <DonnyActionProvider>
      <DemoPanel />
    </DonnyActionProvider>
  ),
};
