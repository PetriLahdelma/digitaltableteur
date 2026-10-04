/**
 * Proves the claims in Button.contract.json `temporal` and the consequence
 * runtime behavior (RFC 0001). The open checker fails any automated claim
 * whose id does not appear in this file.
 */
import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Button from "@dt/Button";

describe("pending-locks-immediately", () => {
  it("disables and marks busy on the same render, and ignores repeat activations", () => {
    let resolve!: () => void;
    const clickAction = vi.fn(
      () => new Promise<void>((done) => (resolve = done)),
    );
    render(<Button clickAction={clickAction}>Pay</Button>);
    const button = screen.getByRole("button", { name: "Pay" });

    fireEvent.click(button);
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");

    fireEvent.click(button);
    fireEvent.click(button);
    expect(clickAction).toHaveBeenCalledTimes(1);
    return act(async () => resolve());
  });
});

describe("pending-settles", () => {
  it("returns to idle when the promise resolves", async () => {
    let resolve!: () => void;
    render(
      <Button clickAction={() => new Promise<void>((done) => (resolve = done))}>
        Save
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Save" });
    fireEvent.click(button);
    await act(async () => resolve());
    expect(button).toBeEnabled();
    expect(button).not.toHaveAttribute("aria-busy");
  });

  it("returns to idle when the promise rejects", async () => {
    let reject!: (error: Error) => void;
    render(
      <Button
        clickAction={() => new Promise<void>((_, fail) => (reject = fail))}
      >
        Save
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Save" });
    fireEvent.click(button);
    await act(async () => reject(new Error("offline")));
    expect(button).toBeEnabled();
  });
});

describe("consequence", () => {
  it("renders the declared class as data-consequence", () => {
    render(<Button consequence="external">Send</Button>);
    expect(screen.getByRole("button", { name: "Send" })).toHaveAttribute(
      "data-consequence",
      "external",
    );
  });

  it("warns in development when an irreversible action is not tone=error", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<Button consequence="irreversible">Delete</Button>);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('consequence="irreversible"'));
    warn.mockClear();
    render(
      <Button consequence="irreversible" tone="error">
        Delete
      </Button>,
    );
    expect(warn).not.toHaveBeenCalledWith(expect.stringContaining("consequence"));
    warn.mockRestore();
  });
});
