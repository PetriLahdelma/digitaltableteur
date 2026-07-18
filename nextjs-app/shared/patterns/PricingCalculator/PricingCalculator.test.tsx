import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { PricingCalculator } from "./PricingCalculator";
import {
  DURATION_OPTIONS,
  STANDARD_RATE,
  computePricing,
  getWorkloadOptions,
} from "./pricingMath";

expect.extend(toHaveNoViolations);

describe("pricingMath", () => {
  it("computes the default: 2 months × 5 days/week = 325 hours at the standard rate", () => {
    const pricing = computePricing("2m", 5);
    expect(pricing.totalHours).toBe(325);
    expect(pricing.effectiveRate).toBe(STANDARD_RATE);
    expect(pricing.discount).toBe(0);
    expect(pricing.allocationPercent).toBe(100);
    expect(pricing.total).toBe(325 * STANDARD_RATE);
  });

  it("prices only the 6/12-month partnership tiers at 90 €/h; all others stay standard", () => {
    expect(computePricing("2w", 5).effectiveRate).toBe(120);
    expect(computePricing("1m", 5).effectiveRate).toBe(120);
    expect(computePricing("3m", 5).effectiveRate).toBe(120);
    expect(computePricing("6m", 5).effectiveRate).toBe(90);
    expect(computePricing("12m", 5).effectiveRate).toBe(90);
  });

  it("grants the partnership rate only at 4+ days/week", () => {
    expect(computePricing("6m", 2).effectiveRate).toBe(120);
    expect(computePricing("6m", 3).effectiveRate).toBe(120);
    expect(computePricing("6m", 4).effectiveRate).toBe(90);
    expect(computePricing("12m", 2).effectiveRate).toBe(120);
    expect(computePricing("12m", 3).effectiveRate).toBe(120);
    expect(computePricing("12m", 4).effectiveRate).toBe(90);
  });

  it("reports savings versus the standard rate only when the discount applies", () => {
    expect(computePricing("2m", 5).savings).toBe(0);
    expect(computePricing("12m", 3).savings).toBe(0);
    const partnership = computePricing("6m", 5);
    expect(partnership.savings).toBe(partnership.totalHours * 30);
    expect(partnership.savings).toBe(29250);
  });

  it("scales hours with days per week and reports allocation as a share of 5 days", () => {
    const pricing = computePricing("2w", 3);
    expect(pricing.totalHours).toBe(Math.round(2 * 3 * 7.5));
    expect(pricing.allocationPercent).toBe(60);
    expect(pricing.total).toBe(pricing.totalHours * 120);
  });

  it("rounds half-hour midpoints up consistently (52/12 float-noise regression)", () => {
    // 1 month × 5 days is exactly 162.5 h; float 52/12 arithmetic used to
    // yield 162.4999… and round down while sibling midpoints rounded up.
    expect(computePricing("1m", 5).totalHours).toBe(163);
    expect(computePricing("1m", 3).totalHours).toBe(98);
    expect(computePricing("3m", 3).totalHours).toBe(293);
    expect(computePricing("3m", 5).totalHours).toBe(488);
  });

  it("offers only 4-5 days/week on short engagements (2 weeks / 1 month)", () => {
    expect(getWorkloadOptions("2w")).toEqual([4, 5]);
    expect(getWorkloadOptions("1m")).toEqual([4, 5]);
    expect(getWorkloadOptions("2m")).toEqual([2, 3, 4, 5]);
    expect(getWorkloadOptions("12m")).toEqual([2, 3, 4, 5]);
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
      screen.getByRole("group", { name: "Workload (per week)" }),
    ).toBeInTheDocument();
    // Defaults: 2 weeks × 5 days/week (short durations hide 2-3 days).
    expect(screen.getByRole("radio", { name: /^2\s*weeks$/i })).toBeChecked();
    expect(screen.getByRole("radio", { name: /5\s*days/i })).toBeChecked();
    expect(screen.queryByRole("radio", { name: /^2\s*days$/i })).toBeNull();
    expect(screen.queryByRole("radio", { name: /^3\s*days$/i })).toBeNull();
    expect(screen.getByText("75")).toBeInTheDocument();
    expect(screen.getByText(/2 weeks design partnership/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Rapid UX sprints and POC\/MVP validation/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Hands-on, end-to-end design execution"),
    ).toBeInTheDocument();
    // Workload cards only carry Partnership badges on 6/12-month durations,
    // while the duration cards advertise the tiers unconditionally.
    expect(
      screen.queryByRole("radio", { name: /days\s*Partnership/i }),
    ).toBeNull();
    expect(
      screen.getByRole("radio", { name: /6\s*months\s*Partnership/i }),
    ).toBeInTheDocument();
    // The partnership pricing rule is stated in visible copy.
    expect(
      screen.getByText(/Partnership rate 90€\/hour applies/i),
    ).toBeInTheDocument();
    // A polite status region carries the recomputed summary for AT.
    expect(screen.getByRole("status").textContent).toContain("75");
  });

  it("recomputes hours, rate, and included copy when the selection changes", async () => {
    const user = userEvent.setup();
    const format = new Intl.NumberFormat("en", { maximumFractionDigits: 0 });
    render(<PricingCalculator />);

    // 12 months at the default 5 days/week earns the partnership rate, and the
    // heavy workload cards now advertise it too.
    await user.click(screen.getByRole("radio", { name: /12\s*months/i }));
    expect(
      screen.getByRole("radio", { name: /4\s*days\s*Partnership/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(format.format(computePricing("12m", 5).totalHours)),
    ).toBeInTheDocument();
    expect(screen.getByText("90€/hour")).toBeInTheDocument();
    expect(
      screen.getByText("Partnership pricing: 1 day per week is free."),
    ).toBeInTheDocument();

    // Dropping to 3 days/week loses it again.
    await user.click(screen.getByRole("radio", { name: /3\s*days/i }));
    const next = computePricing("12m", 3);
    expect(next.effectiveRate).toBe(120);
    expect(screen.getByText(format.format(next.totalHours))).toBeInTheDocument();
    expect(screen.queryByText("90€/hour")).toBeNull();
    expect(
      screen.queryByText("Partnership pricing: 1 day per week is free."),
    ).toBeNull();
    expect(
      screen.getByText(/12 months design partnership/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/expertise for 3 days per week/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Holistic design leadership for your whole product/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/An advisory pace/i)).toBeInTheDocument();
  });

  it("switches the workload fit line at the 4-day boundary", async () => {
    const user = userEvent.setup();
    render(<PricingCalculator />);

    // 2 months offers the full workload range for the boundary check.
    await user.click(screen.getByRole("radio", { name: /^2\s*months$/i }));
    await user.click(screen.getByRole("radio", { name: /4\s*days/i }));
    expect(
      screen.getByText("Hands-on, end-to-end design execution"),
    ).toBeInTheDocument();
    expect(screen.queryByText(/An advisory pace/i)).toBeNull();

    await user.click(screen.getByRole("radio", { name: /3\s*days/i }));
    expect(screen.getByText(/An advisory pace/i)).toBeInTheDocument();
    expect(
      screen.queryByText("Hands-on, end-to-end design execution"),
    ).toBeNull();
  });

  it("hides 2-3 days/week for short durations and clamps the selection", async () => {
    const user = userEvent.setup();
    render(<PricingCalculator />);

    // 2 months offers the full workload range; pick 3 days.
    await user.click(screen.getByRole("radio", { name: /^2\s*months$/i }));
    await user.click(screen.getByRole("radio", { name: /3\s*days/i }));

    // Switching to 2 weeks removes 2-3 days and bumps the selection to 4.
    await user.click(screen.getByRole("radio", { name: /^2\s*weeks$/i }));
    expect(screen.queryByRole("radio", { name: /^2\s*days$/i })).toBeNull();
    expect(screen.queryByRole("radio", { name: /^3\s*days$/i })).toBeNull();
    expect(screen.getByRole("radio", { name: /4\s*days/i })).toBeChecked();

    // Back on 2 months the light workloads return.
    await user.click(screen.getByRole("radio", { name: /^2\s*months$/i }));
    expect(screen.getByRole("radio", { name: /^2\s*days$/i })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /^3\s*days$/i })).toBeInTheDocument();
  });

  it("links the CTA to contact booking, carrying the configuration, without an icon", async () => {
    const user = userEvent.setup();
    render(<PricingCalculator />);
    const cta = screen.getByRole("link", { name: "Get in touch" });
    expect(cta).toHaveAttribute("href", "/contact?mode=book&duration=2w&days=5");
    expect(cta.querySelector("svg")).toBeNull();

    await user.click(screen.getByRole("radio", { name: /12\s*months/i }));
    expect(cta).toHaveAttribute(
      "href",
      "/contact?mode=book&duration=12m&days=5",
    );
  });

  it("has no axe violations", async () => {
    const { container } = render(<PricingCalculator />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
