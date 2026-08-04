import { render, screen } from "@testing-library/react";
import LegacyChip from "./LegacyChip";

describe("bench: forced-colors acceptance", () => {
  it("renders every status with its label", () => {
    render(
      <>
        <LegacyChip status="operational" />
        <LegacyChip status="degraded" />
        <LegacyChip status="down" />
      </>,
    );
    expect(screen.getByText("Operational")).toBeInTheDocument();
    expect(screen.getByText("Degraded")).toBeInTheDocument();
    expect(screen.getByText("Down")).toBeInTheDocument();
  });
});
