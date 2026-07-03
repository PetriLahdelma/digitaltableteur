import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SecureCVDownload from "@dt/SecureCVDownload";
import { I18nextProvider } from "react-i18next";
import i18n from "../../i18n";

const renderWithI18n = (ui: React.ReactElement) => (
  <I18nextProvider i18n={i18n}>{ui}</I18nextProvider>
);

describe("SecureCVDownload", () => {
  const originalCreateObjectURL = URL.createObjectURL;
  const originalRevoke = URL.revokeObjectURL;

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    (global.fetch as any) = vi.fn();
    URL.createObjectURL = vi.fn(() => "blob:cv");
    URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevoke;
    vi.clearAllMocks();
  });

  it("validates password then downloads CV", async () => {
    (global.fetch as any)
      .mockResolvedValueOnce({ ok: true, blob: vi.fn() }) // validation
      .mockResolvedValueOnce({
        ok: true,
        blob: vi.fn(() => Promise.resolve(new Blob(["cv"]))),
      }); // download

    render(renderWithI18n(<SecureCVDownload />));

    fireEvent.click(screen.getByRole("button", { name: /Download Resume/i }));
    const input = await screen.findByLabelText(/password/i);
    fireEvent.change(input, { target: { value: "secret" } });

    // Bounded advance past the 500ms validation debounce. runAllTimersAsync
    // never drains here: the Modal keeps a rAF loop alive, and jsdom backs
    // rAF with timers, so "run all" spins to vitest's 10k-timer abort on
    // slow runners (farm-only flake).
    await vi.advanceTimersByTimeAsync(600);

    await waitFor(() =>
      expect(screen.getByLabelText(/Valid/i)).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByRole("button", { name: /^Download$/i }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2));
    expect(URL.createObjectURL).toHaveBeenCalled();
  });

  it("shows error when password incorrect", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: "Incorrect password" }),
    });

    render(renderWithI18n(<SecureCVDownload />));
    fireEvent.click(screen.getByRole("button", { name: /Download Resume/i }));
    const input = await screen.findByLabelText(/password/i);
    fireEvent.change(input, { target: { value: "bad" } });
    await vi.advanceTimersByTimeAsync(600);

    expect(await screen.findByText(/Incorrect password/i)).toBeInTheDocument();
  });
});
