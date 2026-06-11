import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import ChatHeader from "@dt/ChatWidget/ChatHeader";
import { I18nextProvider } from "react-i18next";
import i18n from "../../i18n";

expect.extend(toHaveNoViolations);

function withI18n(ui: React.ReactElement) {
  return <I18nextProvider i18n={i18n}>{ui}</I18nextProvider>;
}

describe("ChatHeader offline title logic", () => {
  const baseProps = {
    description: "desc",
    onMinimize: () => {},
  };

  it("shows normal title during open hours (weekday 10:00)", () => {
    const date = new Date("2025-11-05T10:00:00.000Z"); // Wednesday 12:00 Helsinki -> 14:00? We'll simulate directly via timezone transform
    // We rely on Intl DateTimeFormat with Europe/Helsinki; constructing a date at 08:00 UTC roughly equals 10:00 Helsinki (depending DST) but for test simplicity we pass an hour inside range.
    render(
      withI18n(
        <ChatHeader
          title="Chat with Donny"
          {...baseProps}
          currentDate={date}
        />,
      ),
    );
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      /Chat with Donny|Keskustele Donnyn kanssa|Chatta med Donny/,
    );
    expect(screen.queryByText(/Donny Offline|poissa linjoilta/i)).toBeNull();
  });

  it("shows offline state outside hours (weekday 20:00)", () => {
    const date = new Date("2025-11-05T20:00:00.000Z");
    render(
      withI18n(
        <ChatHeader
          title="Chat with Donny"
          {...baseProps}
          currentDate={date}
        />,
      ),
    );
    // Offline title should appear
    expect(screen.getByTestId("chat-availability-dot")).toHaveClass(
      /availabilityDotClosed/,
    );
    expect(
      screen.getByText(/Studio offline|Studion offline|Studio offline/i),
    ).toBeInTheDocument();
  });

  it("shows offline state on weekend (Saturday noon)", () => {
    const date = new Date("2025-11-08T12:00:00.000Z"); // Saturday
    render(
      withI18n(
        <ChatHeader
          title="Chat with Donny"
          {...baseProps}
          currentDate={date}
        />,
      ),
    );
    expect(screen.getByTestId("chat-availability-dot")).toHaveClass(
      /availabilityDotClosed/,
    );
    expect(
      screen.getByText(/Studio offline|Studion offline|Studio offline/i),
    ).toBeInTheDocument();
  });
});

describe("ChatHeader accessibility", () => {
  const baseProps = {
    title: "Chat with Donny",
    description: "DT-specific answers, no fluff.",
    onMinimize: () => {},
  };

  it("has no accessibility violations in default state", async () => {
    const { container } = render(withI18n(<ChatHeader {...baseProps} />));
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("has no accessibility violations during offline hours", async () => {
    const offlineDate = new Date("2025-11-08T12:00:00.000Z"); // Saturday
    const { container } = render(
      withI18n(<ChatHeader {...baseProps} currentDate={offlineDate} />),
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("has proper ARIA label on minimize button", () => {
    render(withI18n(<ChatHeader {...baseProps} />));

    expect(
      screen.getByRole("button", { name: /minimize chat/i }),
    ).toBeInTheDocument();
  });
});

describe("ChatHeader button interactions", () => {
  const baseProps = {
    title: "Chat with Donny",
    description: "DT-specific answers, no fluff.",
    onMinimize: vi.fn(),
  };

  it("calls onMinimize when minimize button clicked", async () => {
    const onMinimize = vi.fn();
    render(withI18n(<ChatHeader {...baseProps} onMinimize={onMinimize} />));

    const minimizeButton = screen.getByRole("button", { name: /minimize/i });
    await userEvent.click(minimizeButton);

    expect(onMinimize).toHaveBeenCalledTimes(1);
  });

  // Clear (formerly Reset) moved to ChatComposer, inline next to the
  // shortcut hint. See ChatComposer.test.tsx for its interaction tests.
  it("does not render a clear/reset button", () => {
    render(withI18n(<ChatHeader {...baseProps} />));

    expect(screen.queryByRole("button", { name: /clear|reset/i })).toBeNull();
  });
});
