import { fireEvent, render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it, vi } from "vitest";
import { VirtualList } from "./VirtualList";

expect.extend(toHaveNoViolations);

const items = Array.from({ length: 100 }, (_, index) => ({
  id: String(index),
  label: `Item ${index}`,
}));

const renderList = (
  props: Partial<
    React.ComponentProps<typeof VirtualList<(typeof items)[number]>>
  > = {},
) =>
  render(
    <VirtualList
      aria-label="Results"
      getItemKey={(item) => item.id}
      height={100}
      itemHeight={20}
      items={items}
      overscan={1}
      renderItem={(item) => item.label}
      {...props}
    />,
  );

describe("VirtualList", () => {
  it("renders only the visible range plus overscan", () => {
    renderList();
    expect(screen.getAllByRole("listitem")).toHaveLength(6);
    expect(screen.getByText("Item 0")).toBeInTheDocument();
    expect(screen.queryByText("Item 20")).toBeNull();
  });

  it("updates the window and reports its range after scrolling", () => {
    const onRangeChange = vi.fn();
    renderList({ onRangeChange });
    fireEvent.scroll(screen.getByRole("list"), {
      target: { scrollTop: 200 },
    });
    expect(screen.getByText("Item 9")).toBeInTheDocument();
    expect(screen.queryByText("Item 0")).toBeNull();
    expect(onRangeChange).toHaveBeenLastCalledWith({
      startIndex: 9,
      endIndex: 15,
    });
  });

  it("exposes total and position metadata for rendered items", () => {
    renderList();
    const first = screen.getAllByRole("listitem")[0];
    expect(first).toHaveAttribute("aria-posinset", "1");
    expect(first).toHaveAttribute("aria-setsize", "100");
  });

  it("has no automated accessibility violations", async () => {
    const { container } = renderList();
    expect(await axe(container)).toHaveNoViolations();
  });
});
