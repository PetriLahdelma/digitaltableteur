import { useEffect, useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor } from "storybook/test";
import {
  NativeElement,
  Stack,
  assertNative,
  nativeStoryParameters,
} from "../NativeStory";
import { DtPaginationElement } from "../../../../../packages/web-components/src/native/pagination";

if (!customElements.get("dt-pagination")) {
  customElements.define("dt-pagination", DtPaginationElement);
}

type Args = {
  currentPage: number;
  totalPages: number;
  siblingCount: number;
  ariaLabel?: string;
};

function ControlledPagination(args: Args) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(args.currentPage);

  useEffect(() => {
    setPage(args.currentPage);
  }, [args.currentPage]);

  useEffect(() => {
    const element = wrapperRef.current?.querySelector(
      "dt-pagination",
    ) as DtPaginationElement | null;
    if (!element) return;
    const onChange = (event: Event) => {
      const detail = (event as CustomEvent<{ page: number }>).detail;
      setPage(detail.page);
    };
    element.addEventListener("page-change", onChange);
    return () => element.removeEventListener("page-change", onChange);
  }, []);

  return (
    <div ref={wrapperRef}>
      <NativeElement
        tagName="dt-pagination"
        attributes={{
          "current-page": page,
          "total-pages": args.totalPages,
          "sibling-count": args.siblingCount,
          "aria-label": args.ariaLabel,
        }}
      />
    </div>
  );
}

const meta = {
  title: "Web Components/Navigation/Pagination",
  component: ControlledPagination,
  tags: ["autodocs", "beta", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    docs: {
      description: {
        component:
          "Native `dt-pagination` custom element with localized nav labels, controlled or uncontrolled current-page behavior, ellipsis windowing, disabled edge controls, and SPA-friendly `navigate` / `page-change` events.",
      },
    },
  },
  args: {
    currentPage: 2,
    totalPages: 8,
    siblingCount: 1,
  },
  argTypes: {
    siblingCount: { control: { type: "number", min: 0, max: 4, step: 1 } },
    totalPages: { control: { type: "number", min: 1, max: 99, step: 1 } },
    currentPage: { control: { type: "number", min: 1, max: 99, step: 1 } },
  },
} satisfies Meta<typeof ControlledPagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { play: assertNative("dt-pagination") };
export const Playground: Story = {};

export const Example: Story = {
  tags: ["example"],
  render: () => <ControlledPagination currentPage={3} totalPages={12} siblingCount={1} />,
};

export const ForcedColors: Story = {
  tags: ["example"],
  globals: { forcedColors: "active" },
};

export const ManyPages: Story = {
  tags: ["example"],
  render: () => <ControlledPagination currentPage={25} totalPages={50} siblingCount={1} />,
};

export const SiblingCount: Story = {
  tags: ["example"],
  render: () => (
    <Stack>
      {/* Distinct labels keep the three nav landmarks distinguishable
          (axe landmark-unique). */}
      <ControlledPagination
        currentPage={10}
        totalPages={20}
        siblingCount={0}
        ariaLabel="Pagination, no siblings"
      />
      <ControlledPagination
        currentPage={10}
        totalPages={20}
        siblingCount={1}
        ariaLabel="Pagination, one sibling"
      />
      <ControlledPagination
        currentPage={10}
        totalPages={20}
        siblingCount={2}
        ariaLabel="Pagination, two siblings"
      />
    </Stack>
  ),
};

export const Interactive: Story = {
  tags: ["example"],
  render: () => <ControlledPagination currentPage={1} totalPages={9} siblingCount={1} />,
  play: async ({ canvasElement }) => {
    const element = canvasElement.querySelector("dt-pagination") as DtPaginationElement;
    const pageTwo = element.shadowRoot?.querySelector<HTMLButtonElement>(
      "button[aria-label=\"Page 2\"]",
    );
    if (!pageTwo) throw new Error("Could not find page 2 button.");
    await userEvent.click(pageTwo);
    await waitFor(() => {
      // Re-query: the page-change round-trip re-renders the shadow list, so
      // the pre-click node reference can go stale.
      const current = element.shadowRoot?.querySelector(
        "button[aria-label=\"Page 2\"]",
      );
      expect(current).toHaveAttribute("aria-current", "page");
    });
  },
};
