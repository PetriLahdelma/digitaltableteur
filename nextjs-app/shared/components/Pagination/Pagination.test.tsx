import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { Pagination } from "./Pagination";

expect.extend(toHaveNoViolations);

describe("Pagination", () => {
  it("renders nothing with a single page", () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={1} onPageChange={vi.fn()} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("marks the current page with aria-current", () => {
    render(
      <Pagination currentPage={2} totalPages={5} onPageChange={vi.fn()} />,
    );
    expect(screen.getByRole("button", { name: /page 2/i })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(
      screen.getByRole("button", { name: /page 3/i }),
    ).not.toHaveAttribute("aria-current");
  });

  it("calls onPageChange with the clicked page number", async () => {
    const onPageChange = vi.fn();
    render(
      <Pagination currentPage={2} totalPages={5} onPageChange={onPageChange} />,
    );
    await userEvent.click(screen.getByRole("button", { name: /page 4/i }));
    expect(onPageChange).toHaveBeenCalledWith(4);
  });

  it("navigates with previous/next and disables them at the edges", async () => {
    const onPageChange = vi.fn();
    const { rerender } = render(
      <Pagination currentPage={1} totalPages={5} onPageChange={onPageChange} />,
    );
    expect(screen.getByRole("button", { name: /previous/i })).toBeDisabled();

    await userEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(onPageChange).toHaveBeenCalledWith(2);

    rerender(
      <Pagination currentPage={5} totalPages={5} onPageChange={onPageChange} />,
    );
    expect(screen.getByRole("button", { name: /next/i })).toBeDisabled();
  });

  it("windows long ranges with ellipsis on both sides", () => {
    render(
      <Pagination currentPage={25} totalPages={50} onPageChange={vi.fn()} />,
    );
    expect(screen.getAllByText("…")).toHaveLength(2);
    expect(screen.getByRole("button", { name: /page 1$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /page 50/i })).toBeInTheDocument();
  });

  it("widens the window with siblingCount", () => {
    render(
      <Pagination
        currentPage={10}
        totalPages={20}
        siblingCount={2}
        onPageChange={vi.fn()}
      />,
    );
    for (const page of [8, 9, 10, 11, 12]) {
      expect(
        screen.getByRole("button", { name: new RegExp(`page ${page}$`, "i") }),
      ).toBeInTheDocument();
    }
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <Pagination currentPage={3} totalPages={12} onPageChange={vi.fn()} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
