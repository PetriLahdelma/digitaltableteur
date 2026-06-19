import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import AlertBanner from "./AlertBanner";
import styles from "./AlertBanner.module.css";

describe("AlertBanner", () => {
  it("renders with default info tone", () => {
    render(<AlertBanner title="Info message" />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Info message")).toBeInTheDocument();
  });

  it("renders with title and description", () => {
    render(
      <AlertBanner title="Alert Title" description="Alert description text" />,
    );
    expect(screen.getByText("Alert Title")).toBeInTheDocument();
    expect(screen.getByText("Alert description text")).toBeInTheDocument();
  });

  it("renders success tone", () => {
    const { container } = render(
      <AlertBanner tone="success" title="Success" />,
    );
    expect(container.querySelector(`.${styles.success}`)).toBeInTheDocument();
  });

  it("renders warning tone", () => {
    const { container } = render(
      <AlertBanner tone="warning" title="Warning" />,
    );
    expect(container.querySelector(`.${styles.warning}`)).toBeInTheDocument();
  });

  it("renders error tone", () => {
    const { container } = render(<AlertBanner tone="error" title="Error" />);
    expect(container.querySelector(`.${styles.error}`)).toBeInTheDocument();
  });

  it("renders dismiss button when dismissible", () => {
    render(<AlertBanner title="Message" dismissible />);
    expect(
      screen.getByRole("button", { name: /dismiss alert/i }),
    ).toBeInTheDocument();
  });

  it("does not render dismiss button when not dismissible", () => {
    render(<AlertBanner title="Message" />);
    expect(
      screen.queryByRole("button", { name: /dismiss alert/i }),
    ).not.toBeInTheDocument();
  });

  it("calls onDismiss when dismiss button clicked", async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(<AlertBanner title="Message" dismissible onDismiss={onDismiss} />);

    await user.click(screen.getByRole("button", { name: /dismiss alert/i }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("applies default aria-live polite", () => {
    render(<AlertBanner title="Message" />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-live", "polite");
  });

  it("applies custom aria-live assertive", () => {
    render(<AlertBanner title="Message" aria-live="assertive" />);
    expect(screen.getByRole("status")).toHaveAttribute(
      "aria-live",
      "assertive",
    );
  });

  it("error tone announces assertively via role=alert", () => {
    render(<AlertBanner tone="error" title="Something failed" />);
    const banner = screen.getByRole("alert");
    expect(banner).toHaveAttribute("aria-live", "assertive");
  });

  it("non-error tone stays a polite status region", () => {
    render(<AlertBanner tone="success" title="Saved" />);
    const banner = screen.getByRole("status");
    expect(banner).toHaveAttribute("aria-live", "polite");
  });

  it("renders description as React node", () => {
    render(
      <AlertBanner
        title="Title"
        description={
          <span>
            Complex <strong>description</strong>
          </span>
        }
      />,
    );
    expect(screen.getByText("Complex")).toBeInTheDocument();
    expect(screen.getByText("description")).toBeInTheDocument();
  });

  it("renders without title", () => {
    render(<AlertBanner description="Only description" />);
    expect(screen.getByText("Only description")).toBeInTheDocument();
  });

  it("renders without description", () => {
    render(<AlertBanner title="Only title" />);
    expect(screen.getByText("Only title")).toBeInTheDocument();
  });
});
