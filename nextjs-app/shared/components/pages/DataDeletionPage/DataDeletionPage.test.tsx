import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { axe } from "vitest-axe";

import { renderWithProviders } from "../../../../../test-utils/render";
import { DataDeletionPage } from "./DataDeletionPage";

const TOKEN = "Abc_-".padEnd(43, "x");

describe("DataDeletionPage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    window.history.replaceState(null, "", "/");
  });

  it("asks for the address and sends a link request, never a deletion", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response("{}", { status: 202 }));
    const { container } = renderWithProviders(<DataDeletionPage />);

    expect(screen.getByRole("heading", { level: 1, name: /Delete your data/i })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Email address/i), {
      target: { value: "person@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Send confirmation link/i }));

    await screen.findByText(/confirmation link is on its way/i);
    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/gdpr/delete-data",
      expect.objectContaining({ method: "POST" }),
    );
    expect(String(fetchSpy.mock.calls[0]?.[1]?.body)).toContain("person@example.com");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("shows an error and sends nothing for an invalid address", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    renderWithProviders(<DataDeletionPage />);
    fireEvent.change(screen.getByLabelText(/Email address/i), { target: { value: "nope" } });
    fireEvent.click(screen.getByRole("button", { name: /Send confirmation link/i }));
    expect(await screen.findByText(/Enter a valid email address/i)).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("confirms with the link token only after a click, and clears it from the address bar", async () => {
    window.history.replaceState(null, "", `/privacy-policy/delete#t=${TOKEN}`);
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response('{"deleted":true}', { status: 200 }));
    const { container } = renderWithProviders(<DataDeletionPage />);

    const button = await screen.findByRole("button", { name: /Delete my data/i });
    expect(window.location.hash).toBe("");
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(await axe(container)).toHaveNoViolations();

    fireEvent.click(button);
    await screen.findByText(/Your data has been deleted/i);
    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/gdpr/delete-data/confirm",
      expect.objectContaining({ body: JSON.stringify({ token: TOKEN }) }),
    );
  });

  it("falls back to the request form when the link is invalid or expired", async () => {
    window.history.replaceState(null, "", `/privacy-policy/delete#t=${TOKEN}`);
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response('{"error":"invalid_link"}', { status: 400 }),
    );
    renderWithProviders(<DataDeletionPage />);

    fireEvent.click(await screen.findByRole("button", { name: /Delete my data/i }));
    await waitFor(() =>
      expect(screen.getByText(/invalid, already used or expired/i)).toBeInTheDocument(),
    );
    expect(screen.getByRole("button", { name: /Send confirmation link/i })).toBeInTheDocument();
  });
});
