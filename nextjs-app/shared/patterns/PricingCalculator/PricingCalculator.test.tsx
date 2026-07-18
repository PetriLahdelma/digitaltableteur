import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { PricingCalculator } from "./PricingCalculator";
import {
  DURATION_OPTIONS,
  STANDARD_RATE,
  computePricing,
} from "./pricingMath";

expect.extend(toHaveNoViolations);

describe("pricingMath", () => {
  it("matches the reference default: 2 months × 5 days/week = 303 hours at the standard rate", () => {
    const pricing = computePricing("2m", 5);
    expect(pricing.totalHours).toBe(303);
    expect(pricing.effectiveRate).toBe(STANDARD_RATE);
    expect(pricing.discount).toBe(0);
    expect(pricing.allocationPercent).toBe(100);
    expect(pricing.total).toBe(303 * STANDARD_RATE);
  });

  it("applies tier discounts to the hourly rate only on 3/6/12 month commitments", () => {
    expect(computePricing("2w", 5).effectiveRate).toBe(120);
    expect(computePricing("1m", 5).effectiveRate).toBe(120);
    expect(computePricing("3m", 5).effectiveRate).toBe(114);
    expect(computePricing("6m", 5).effectiveRate).toBe(108);
    expect(computePricing("12m", 5).effectiveRate).toBe(102);
  });

  it("scales hours with days per week and reports allocation as a share of 5 days", () => {
    const pricing = computePricing("2w", 3);
    expect(pricing.totalHours).toBe(Math.round(2 * 3 * 7));
    expect(pricing.allocationPercent).toBe(60);
    expect(pricing.total).toBe(pricing.totalHours * 120);
  });

  it("marks exactly the 6 and 12 month tiers as partnerships", () => {
    expect(
      DURATION_OPTIONS.filter((option) => option.partnership).map(
        (option) => option.id,
      ),
    ).toEqual(["6m", "12m"]);
  });
});

describe("PricingCalculator", () => {
  it("renders both selection groups with the defaults selected", () => {
    render(<PricingCalculator />);

    expect(
      screen.getByRole("group", { name: "Duration" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("group", { name: "Workload" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /^2\s*months$/i })).toBeChecked();
    expect(screen.getByRole("radio", { name: /5\s*days/i })).toBeChecked();
    expect(screen.getByText("303")).toBeInTheDocument();
    expect(screen.getByText(/2 months design partnership/i)).toBeInTheDocument();
  });

  it("recomputes hours, rate, and included copy when the selection changes", async () => {
    const user = userEvent.setup();
    render(<PricingCalculator />);

    await user.click(screen.getByRole("radio", { name: /12\s*months/i }));
    await user.click(screen.getByRole("radio", { name: /3\s*days/i }));

    const next = computePricing("12m", 3);
    const formatted = new Intl.NumberFormat("en", {
      maximumFractionDigits: 0,
    }).format(next.totalHours);
    expect(screen.getByText(formatted)).toBeInTheDocument();
    expect(screen.getByText(/102€\/hour/)).toBeInTheDocument();
    expect(
      screen.getByText(/12 months design partnership/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/expertise for 3 days per week/i),
    ).toBeInTheDocument();
  });

  it("links the CTA to contact booking without an icon", () => {
    render(<PricingCalculator />);
    const cta = screen.getByRole("link", { name: "Get in touch" });
    expect(cta).toHaveAttribute("href", "/contact?mode=book");
    expect(cta.querySelector("svg")).toBeNull();
  });

  it("has no axe violations", async () => {
    const { container } = render(<PricingCalculator />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
