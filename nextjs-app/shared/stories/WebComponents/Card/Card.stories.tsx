import type { CSSProperties, ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import {
  NativeElement,
  assertNative,
  nativeStoryParameters,
} from "../NativeStory";

type CardArgs = {
  title: string;
  description: string;
  body: string;
  variant: "default" | "muted" | "transparent";
  padding: "none" | "sm" | "md" | "lg";
  titleLevel: 1 | 2 | 3 | 4 | 5 | 6;
  titleAs?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  titleSize: "xxs" | "xs" | "s" | "m" | "l" | "xl" | "xxl";
  descriptionAs: "p" | "span" | "div";
  descriptionSize: "xxs" | "xs" | "s" | "m" | "l" | "xl" | "xxl";
  link?: string;
  linkLabel?: string;
  loading: boolean;
};

function isRegistered(tagName: string) {
  return (
    typeof customElements !== "undefined" &&
    Boolean(customElements.get(tagName))
  );
}

const fallbackCardCss = `
  .dt-card-fallback {
    max-inline-size: min(20rem, 90vw);
  }
  .dt-card-fallback dt-card {
    display: block;
    box-sizing: border-box;
    border: 1px solid var(--color-border, #d7dde5);
    border-radius: var(--radius-xl, 1rem);
    background: var(--color-surface, #ffffff);
    padding: 1rem;
    color: inherit;
  }
  .dt-card-fallback dt-card[variant="muted"] {
    background: var(--color-light-bg, #f6f8fb);
    border-color: transparent;
  }
  .dt-card-fallback dt-card[variant="transparent"] {
    background: transparent;
    border-color: transparent;
  }
  .dt-card-fallback dt-card[padding="none"] { padding: 0; }
  .dt-card-fallback dt-card[padding="sm"] { padding: 0.75rem; }
  .dt-card-fallback dt-card[padding="lg"] { padding: 1.5rem; }
  .dt-card-fallback [data-card-header] {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.75rem;
  }
  .dt-card-fallback [data-card-header-start] {
    min-inline-size: 0;
    flex: 1 1 auto;
  }
  .dt-card-fallback [data-card-header-end] {
    display: inline-flex;
    flex: none;
    align-items: center;
    gap: 0.5rem;
  }
  .dt-card-fallback [data-card-description] {
    margin-block-start: 0.25rem;
  }
  .dt-card-fallback [data-card-footer] {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.75rem;
    margin-block-start: 1rem;
  }
  .dt-card-fallback [data-card-footer-end] {
    display: inline-flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.75rem;
    margin-inline-start: auto;
  }
  .dt-card-fallback [data-card-skeleton] {
    display: grid;
    gap: 0.5rem;
  }
  .dt-card-fallback [data-card-skeleton] > span {
    display: block;
    block-size: 0.875rem;
    border-radius: 999px;
    background: color-mix(in srgb, var(--color-text, #334155) 14%, transparent);
  }
  .dt-card-fallback [data-card-skeleton] > span:nth-child(1) { inline-size: 72%; }
  .dt-card-fallback [data-card-skeleton] > span:nth-child(2) { inline-size: 100%; }
  .dt-card-fallback [data-card-skeleton] > span:nth-child(3) { inline-size: 84%; }
`;

const cardStageStyle = {
  width: "min(20rem, 90vw)",
} satisfies CSSProperties;

const rowStyle = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "flex-start",
  gap: "1rem",
} satisfies CSSProperties;

function CardTitleNode({
  args,
  withLink = false,
}: {
  args: CardArgs;
  withLink?: boolean;
}) {
  return (
    <NativeElement
      tagName="dt-title"
      attributes={{
        level: args.titleLevel,
        as: args.titleAs,
        size: args.titleSize,
        "line-height": "snug",
      }}
    >
      {withLink && args.link ? (
        <a
          href={args.link}
          aria-label={
            args.linkLabel && args.linkLabel !== args.title
              ? args.linkLabel
              : undefined
          }
          style={{ color: "inherit", textDecoration: "none" }}
        >
          {args.title}
        </a>
      ) : (
        args.title
      )}
    </NativeElement>
  );
}

function CardDescriptionNode({ args }: { args: CardArgs }) {
  return (
    <NativeElement
      tagName="dt-text"
      attributes={{ as: args.descriptionAs, size: args.descriptionSize }}
    >
      {args.description}
    </NativeElement>
  );
}

function CardBodyNode({
  body,
  size = "s",
}: {
  body: ReactNode;
  size?: "xxs" | "xs" | "s" | "m" | "l" | "xl" | "xxl";
}) {
  return (
    <NativeElement tagName="dt-text" attributes={{ as: "p", size }}>
      {body}
    </NativeElement>
  );
}

function CardSkeleton() {
  return (
    <div data-card-skeleton>
      <span />
      <span />
      <span />
    </div>
  );
}

function NativeCard({
  args,
  width,
  body,
  headerStart,
  headerEnd,
  extra,
  footerStart,
  footerEnd,
}: {
  args: CardArgs;
  width?: string;
  body?: ReactNode;
  headerStart?: ReactNode;
  headerEnd?: ReactNode;
  extra?: ReactNode;
  footerStart?: ReactNode;
  footerEnd?: ReactNode;
}) {
  const registered = isRegistered("dt-card");
  const headerEndNode = headerEnd ?? extra;
  const effectiveBody =
    body ?? (args.body ? <CardBodyNode body={args.body} /> : null);
  const resolvedHeaderStart =
    headerStart ??
    (args.title ? (
      <CardTitleNode args={args} withLink={!headerEndNode} />
    ) : null);
  const descriptionNode = args.description ? (
    <CardDescriptionNode args={args} />
  ) : null;
  const fallbackWidth = width ?? cardStageStyle.width;

  return (
    <>
      {!registered ? <style>{fallbackCardCss}</style> : null}
      <div
        className={!registered ? "dt-card-fallback" : undefined}
        style={{ width: fallbackWidth, maxWidth: "90vw" }}
      >
        <NativeElement
          tagName="dt-card"
          attributes={{
            "title-text": args.title,
            description: args.description,
            variant: args.variant,
            padding: args.padding,
            loading: args.loading,
            link: args.link,
            "link-label": args.linkLabel,
            "title-level": args.titleLevel,
            "title-as": args.titleAs,
            "title-size": args.titleSize,
            "description-as": args.descriptionAs,
            "description-size": args.descriptionSize,
            role: args.loading ? "status" : undefined,
            "aria-busy": args.loading ? "true" : undefined,
          }}
        >
          {registered ? (
            <>
              {headerStart ? (
                <div slot="header-start">{headerStart}</div>
              ) : null}
              {headerEnd ? <div slot="header-end">{headerEnd}</div> : null}
              {extra ? <div slot="extra">{extra}</div> : null}
              {footerStart ? (
                <div slot="footer-start">{footerStart}</div>
              ) : null}
              {footerEnd ? <div slot="footer-end">{footerEnd}</div> : null}
              {args.loading ? <CardSkeleton /> : effectiveBody}
            </>
          ) : args.loading ? (
            <CardSkeleton />
          ) : (
            <>
              {resolvedHeaderStart || headerEndNode ? (
                <div data-card-header>
                  <div data-card-header-start>{resolvedHeaderStart}</div>
                  {headerEndNode ? (
                    <div data-card-header-end>{headerEndNode}</div>
                  ) : null}
                </div>
              ) : null}
              {descriptionNode ? (
                <div data-card-description>{descriptionNode}</div>
              ) : null}
              {effectiveBody}
              {footerStart || footerEnd ? (
                <div data-card-footer>
                  {footerStart ? <div>{footerStart}</div> : null}
                  {footerEnd ? (
                    <div data-card-footer-end>{footerEnd}</div>
                  ) : null}
                </div>
              ) : null}
            </>
          )}
        </NativeElement>
      </div>
    </>
  );
}

function NativeCardStory(args: CardArgs) {
  return <NativeCard args={args} />;
}

const meta = {
  title: "Web Components/Layout/Card",
  component: NativeCardStory,
  tags: ["autodocs", "stable", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    docs: {
      description: {
        component:
          "Native dt-card surface with flattened heading attributes and header/footer slot regions.",
      },
    },
  },
  args: {
    title: "Design tokens",
    description: "Layer 0 of the system: DTCG JSON, transformed per platform.",
    body: "Colors, spacing, and type ship as platform-agnostic JSON before any component exists.",
    variant: "default",
    padding: "md",
    titleLevel: 3,
    titleSize: "xxs",
    descriptionAs: "p",
    descriptionSize: "s",
    loading: false,
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["default", "muted", "transparent"],
    },
    padding: {
      control: "inline-radio",
      options: ["none", "sm", "md", "lg"],
    },
    titleLevel: { control: "inline-radio", options: [1, 2, 3, 4, 5, 6] },
    titleAs: {
      control: "select",
      options: [undefined, "h1", "h2", "h3", "h4", "h5", "h6"],
    },
    titleSize: {
      control: "select",
      options: ["xxs", "xs", "s", "m", "l", "xl", "xxl"],
    },
    descriptionAs: { control: "inline-radio", options: ["p", "span", "div"] },
    descriptionSize: {
      control: "select",
      options: ["xxs", "xs", "s", "m", "l", "xl", "xxl"],
    },
    loading: { control: "boolean" },
  },
} satisfies Meta<typeof NativeCardStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => <NativeCardStory {...args} />,
  play: assertNative("dt-card"),
};

export const Playground: Story = {
  render: (args) => <NativeCardStory {...args} />,
  args: {
    body: "Body content flows in the card rhythm.",
    link: "/work/dsharp-design-system",
  },
};

export const Variants: Story = {
  tags: ["example"],
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={rowStyle}>
      {(["default", "muted", "transparent"] as const).map((variant) => (
        <NativeCard
          key={variant}
          args={{
            title: variant,
            description: "The same surface, a different weight.",
            body: "Background swaps only; the structure stays put.",
            variant,
            padding: "md",
            titleLevel: 3,
            titleSize: "xxs",
            descriptionAs: "p",
            descriptionSize: "xs",
            loading: false,
          }}
          width="13rem"
        />
      ))}
    </div>
  ),
};

export const PaddingScale: Story = {
  tags: ["example"],
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={rowStyle}>
      {(["sm", "md", "lg"] as const).map((padding) => (
        <NativeCard
          key={padding}
          args={{
            title: `padding ${padding}`,
            description: "",
            body: "Pick one space step per surface.",
            variant: "default",
            padding,
            titleLevel: 3,
            titleSize: "xxs",
            descriptionAs: "p",
            descriptionSize: "s",
            loading: false,
          }}
          width="12rem"
        />
      ))}
    </div>
  ),
};

export const Structured: Story = {
  tags: ["example"],
  parameters: { controls: { disable: true } },
  render: () => (
    <NativeCard
      args={{
        title: "Quarterly review",
        description: "",
        body: "",
        variant: "default",
        padding: "md",
        titleLevel: 3,
        titleSize: "xxs",
        descriptionAs: "p",
        descriptionSize: "s",
        loading: false,
      }}
      extra={
        <NativeElement
          tagName="dt-badge"
          attributes={{ tone: "info", size: "sm", label: "Draft" }}
        />
      }
      body={
        <>
          <NativeElement tagName="dt-divider" />
          <CardBodyNode body="Q2 numbers are in: token adoption up 40%, three new consumers, zero contract drift incidents." />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "0.75rem",
              flexWrap: "wrap",
            }}
          >
            <NativeElement
              tagName="dt-button"
              attributes={{ variant: "tertiary", size: "sm" }}
            >
              Discard
            </NativeElement>
            <NativeElement tagName="dt-button" attributes={{ size: "sm" }}>
              Publish
            </NativeElement>
          </div>
        </>
      }
      width="22rem"
    />
  ),
};

export const AsLink: Story = {
  tags: ["example"],
  parameters: { controls: { disable: true } },
  render: () => (
    <NativeCard
      args={{
        title: "DSharp design system",
        description: "AI-first component architecture for a multi-app suite.",
        body: "",
        variant: "default",
        padding: "md",
        titleLevel: 3,
        titleSize: "xxs",
        descriptionAs: "p",
        descriptionSize: "s",
        link: "/work/dsharp-design-system",
        linkLabel: "Read the DSharp design system case study",
        loading: false,
      }}
      body={
        <NativeElement tagName="dt-text" attributes={{ as: "p", size: "s" }}>
          Link mode keeps one accessible link around the card surface.
        </NativeElement>
      }
    />
  ),
  play: async ({ canvasElement }) => {
    const card = canvasElement.querySelector("dt-card");
    const links = card?.shadowRoot?.querySelectorAll("a") ?? [];
    await expect(links).toHaveLength(1);
    await expect(links[0]).toHaveAccessibleName(
      "Read the DSharp design system case study",
    );
    links[0]?.focus();
    await expect(card).toHaveFocus();
    await expect(card?.shadowRoot?.activeElement).toBe(links[0]);
  },
};

export const Loading: Story = {
  tags: ["example"],
  parameters: { controls: { disable: true } },
  render: () => (
    <NativeCard
      args={{
        title: "Hidden while loading",
        description: "Loading is a quiet skeleton, announced once.",
        body: "Replaced by skeleton lines while loading.",
        variant: "default",
        padding: "md",
        titleLevel: 3,
        titleSize: "xxs",
        descriptionAs: "p",
        descriptionSize: "s",
        loading: true,
      }}
      width="20rem"
    />
  ),
};

export const CardGrid: Story = {
  tags: ["example"],
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(14rem, 1fr))",
        gap: "1rem",
        width: "min(54rem, 100%)",
      }}
    >
      {[
        ["Design tokens", "DTCG JSON as the source of truth."],
        ["Components", "Contract-driven, four files each."],
        ["Patterns", "Composed surfaces for product flows."],
      ].map(([title, blurb]) => (
        <NativeCard
          key={title}
          args={{
            title,
            description: "",
            body: blurb,
            variant: "default",
            padding: "md",
            titleLevel: 3,
            titleSize: "xxs",
            descriptionAs: "p",
            descriptionSize: "xs",
            link: `#${title}`,
            loading: false,
          }}
          width="100%"
          body={<CardBodyNode body={blurb} size="xs" />}
        />
      ))}
    </div>
  ),
};

export const Example: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <NativeCard
      args={{
        title: "Design tokens",
        description:
          "Layer 0 of the system: DTCG JSON, transformed per platform.",
        body: "Colors, spacing, and type ship as platform-agnostic JSON before any component exists.",
        variant: "default",
        padding: "md",
        titleLevel: 3,
        titleSize: "xxs",
        descriptionAs: "p",
        descriptionSize: "s",
        loading: false,
      }}
      extra={
        <NativeElement
          tagName="dt-badge"
          attributes={{ tone: "success", size: "sm", label: "Stable" }}
        />
      }
    />
  ),
};

export const ForcedColors: Story = {
  parameters: {
    a11y: { disable: true, test: "off" },
  },
  tags: ["example"],
  globals: { forcedColors: "active" },
  render: (args) => <NativeCard args={args} width="20rem" />,
};

export const ActionCard: Story = {
  tags: ["example"],
  parameters: { controls: { disable: true } },
  render: () => (
    <NativeCard
      args={{
        title: "Card title",
        description:
          "Supporting copy that explains the card's content in a sentence or two.",
        body: "",
        variant: "default",
        padding: "md",
        titleLevel: 3,
        titleSize: "xxs",
        descriptionAs: "p",
        descriptionSize: "s",
        loading: false,
      }}
      headerEnd={
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <NativeElement
            tagName="dt-badge"
            attributes={{ tone: "info", size: "sm", label: "Badge" }}
          >
            <NativeElement
              tagName="dt-icon"
              slot="icon"
              attributes={{ name: "info", decorative: true, size: "sm" }}
            />
          </NativeElement>
          <NativeElement
            tagName="dt-icon-button"
            attributes={{
              icon: "dots-three-vertical",
              label: "More options",
              variant: "tertiary",
              size: "sm",
            }}
          />
        </div>
      }
      footerStart={
        <NativeElement
          tagName="dt-button"
          attributes={{
            variant: "primary",
            tone: "error",
            size: "sm",
            icon: "x-circle",
          }}
        >
          Destructive
        </NativeElement>
      }
      footerEnd={
        <div
          style={{ display: "inline-flex", gap: "0.75rem", flexWrap: "wrap" }}
        >
          <NativeElement
            tagName="dt-button"
            attributes={{ variant: "secondary", size: "sm" }}
          >
            No
          </NativeElement>
          <NativeElement tagName="dt-button" attributes={{ size: "sm" }}>
            Yes
          </NativeElement>
        </div>
      }
      width="min(40rem, 90vw)"
    />
  ),
};
