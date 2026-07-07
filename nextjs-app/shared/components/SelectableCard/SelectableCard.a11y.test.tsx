import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { SelectableCard, SelectableCardGroup } from "./SelectableCard";

expect.extend(toHaveNoViolations);

describe("SelectableCard accessibility", () => {
  it("single-select group has no axe violations", async () => {
    const { container } = render(
      <SelectableCardGroup
        type="single"
        legend="Choose a plan"
        defaultValue="team"
        name="plan"
      >
        <SelectableCard value="starter" title="Starter" description="1 seat." />
        <SelectableCard
          value="team"
          title="Team"
          description="Up to 10 seats."
        />
      </SelectableCardGroup>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("multiple-select group with helper text has no axe violations", async () => {
    const { container } = render(
      <SelectableCardGroup
        type="multiple"
        legend="Add-ons"
        helperText="Pick any that apply."
      >
        <SelectableCard
          value="analytics"
          title="Analytics"
          description="Dashboards."
        />
        <SelectableCard value="sso" title="SSO" description="SAML / OIDC." />
      </SelectableCardGroup>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("error state has no axe violations", async () => {
    const { container } = render(
      <SelectableCardGroup
        type="single"
        legend="Choose a plan"
        error="Select a plan to continue."
      >
        <SelectableCard value="starter" title="Starter" description="1 seat." />
      </SelectableCardGroup>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
