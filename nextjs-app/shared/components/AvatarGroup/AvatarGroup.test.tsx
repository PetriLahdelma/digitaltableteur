import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import AvatarGroup from "./AvatarGroup";
import Avatar from "@dt/Avatar";

expect.extend(toHaveNoViolations);

const avatars = (count: number) =>
  ["Aino V", "Bo L", "Carla M", "Deniz A", "Eero S", "Freja H"]
    .slice(0, count)
    .map((name) => <Avatar key={name} name={name} variant="initials" size="2.5rem" />);

describe("AvatarGroup", () => {
  it("renders a labelled group", () => {
    render(<AvatarGroup ariaLabel="Members">{avatars(3)}</AvatarGroup>);
    expect(screen.getByRole("group", { name: "Members" })).toBeInTheDocument();
  });

  it("collapses avatars beyond max into a +N bubble with sr text", () => {
    render(
      <AvatarGroup ariaLabel="Members" max={4}>
        {avatars(6)}
      </AvatarGroup>,
    );
    expect(screen.getByText("+2")).toBeInTheDocument();
    expect(screen.getByText("2 more")).toBeInTheDocument();
  });

  it("shows no bubble when children fit within max", () => {
    render(
      <AvatarGroup ariaLabel="Members" max={4}>
        {avatars(3)}
      </AvatarGroup>,
    );
    expect(screen.queryByText(/^\+\d/)).not.toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <AvatarGroup ariaLabel="Project members" max={4}>
        {avatars(6)}
      </AvatarGroup>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
