import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ProofBlock from "./ProofBlock";
import styles from "./ProofBlock.module.css";

describe("ProofBlock", () => {
  const metrics = [
    { value: "95%", label: "Customer Satisfaction" },
    { value: "2.5x", label: "Performance Increase" },
    { value: "50%", label: "Cost Reduction", detail: "Year over year" },
  ];

  it("renders title", () => {
    render(<ProofBlock title="Project Metrics" metrics={metrics} />);
    expect(screen.getByText("Project Metrics")).toBeInTheDocument();
  });

  it("renders subtitle when provided", () => {
    render(
      <ProofBlock
        title="Metrics"
        subTitle="Key Performance Indicators"
        metrics={metrics}
      />,
    );
    expect(screen.getByText("Key Performance Indicators")).toBeInTheDocument();
  });

  it("renders caption when provided", () => {
    render(
      <ProofBlock title="Metrics" caption="As of Q4 2025" metrics={metrics} />,
    );
    expect(screen.getByText("As of Q4 2025")).toBeInTheDocument();
  });

  it("renders all metric values", () => {
    render(<ProofBlock title="Metrics" metrics={metrics} />);
    expect(screen.getByText("95%")).toBeInTheDocument();
    expect(screen.getByText("2.5x")).toBeInTheDocument();
    expect(screen.getByText("50%")).toBeInTheDocument();
  });

  it("renders all metric labels", () => {
    render(<ProofBlock title="Metrics" metrics={metrics} />);
    expect(screen.getByText("Customer Satisfaction")).toBeInTheDocument();
    expect(screen.getByText("Performance Increase")).toBeInTheDocument();
    expect(screen.getByText("Cost Reduction")).toBeInTheDocument();
  });

  it("renders metric detail when provided", () => {
    render(<ProofBlock title="Metrics" metrics={metrics} />);
    expect(screen.getByText("Year over year")).toBeInTheDocument();
  });

  it("does not render detail when not provided", () => {
    const metricsWithoutDetail = [{ value: "100%", label: "Success Rate" }];
    render(<ProofBlock title="Metrics" metrics={metricsWithoutDetail} />);
    expect(screen.queryByText("Year over year")).not.toBeInTheDocument();
  });

  it("applies tight grid class when tight is true", () => {
    const { container } = render(
      <ProofBlock title="Metrics" metrics={metrics} tight />,
    );
    expect(container.querySelector(`.${styles.metricsGridTight}`)).toBeInTheDocument();
  });

  it("applies dark class to metric cards when dark is true", () => {
    const { container } = render(
      <ProofBlock title="Metrics" metrics={metrics} dark />,
    );
    expect(container.querySelector(`.${styles.metricCardDark}`)).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <ProofBlock title="Metrics" metrics={metrics} className="custom-class" />,
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("applies aria-label when provided", () => {
    render(
      <ProofBlock
        title="Metrics"
        metrics={metrics}
        ariaLabel="Performance Statistics"
      />,
    );
    expect(screen.getByLabelText("Performance Statistics")).toBeInTheDocument();
  });

  it("uses title as aria-label when not provided", () => {
    render(<ProofBlock title="Default Label" metrics={metrics} />);
    expect(screen.getByLabelText("Default Label")).toBeInTheDocument();
  });

  it("renders as section element", () => {
    const { container } = render(
      <ProofBlock title="Metrics" metrics={metrics} />,
    );
    expect(container.querySelector("section")).toBeInTheDocument();
  });

  it("renders empty metrics array without error", () => {
    const { container } = render(<ProofBlock title="Metrics" metrics={[]} />);
    expect(container.querySelector("section")).toBeInTheDocument();
    expect(screen.getByText("Metrics")).toBeInTheDocument();
  });

  it("handles single metric", () => {
    const singleMetric = [{ value: "100%", label: "Uptime" }];
    render(<ProofBlock title="Metrics" metrics={singleMetric} />);
    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(screen.getByText("Uptime")).toBeInTheDocument();
  });

  it("renders multiple metrics with unique keys", () => {
    render(<ProofBlock title="Metrics" metrics={metrics} />);
    const metricCards = screen.getAllByText(
      /Customer Satisfaction|Performance Increase|Cost Reduction/,
    );
    expect(metricCards).toHaveLength(3);
  });
});
