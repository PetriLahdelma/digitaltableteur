import { render, screen } from "@testing-library/react";
import ChatHeader from "./ChatHeader";
import React from "react";
import i18n, { initI18n } from "../../i18n";

// Minimal i18n bootstrap (reuses existing init used in other tests if present)
try {
  // Ensure react-i18next is loaded; already in deps.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require("react-i18next");
} catch (e) {
  // ignore if not found in the testing context
}

// Initialize i18n for translation keys used in tooltip
initI18n?.();

describe("ChatHeader availability dot", () => {
  it("renders open tooltip when within hours (mocked)", async () => {
    // Mock Date and Intl to force Monday 10:00 Helsinki
    const RealDate = Date;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).Date = class extends RealDate {
      constructor(...args: unknown[]) {
        if (!args.length) {
          super("2025-11-03T08:00:00.000Z"); // Monday 10:00 Helsinki (UTC+2 in Nov may be +2)
        } else {
          // @ts-ignore
          super(...args);
        }
      }
    } as DateConstructor;

    const { container } = render(
      <ChatHeader
        title="Test"
        description="Desc"
        onReset={() => {}}
        onMinimize={() => {}}
        isSending={false}
      />,
    );

    // Query via test id for reliability
    const dot = await screen.findByTestId("chat-availability-dot");
    expect(dot).toBeTruthy();
    expect(dot.getAttribute("title")).toMatch(/Open|Available|Auki|Öppet/i);

    // Restore Date
    (global as any).Date = RealDate;
  });

  it("shows open at 16:59 Helsinki (just before closing)", async () => {
    const RealDate = Date;
    // 16:59 Helsinki time on a Monday. Helsinki is UTC+2 in standard time (November).
    // So 16:59 Helsinki is 14:59 UTC.
    (global as any).Date = class extends RealDate {
      constructor(...args: unknown[]) {
        if (!args.length) {
          super("2025-11-03T14:59:00.000Z");
        } else {
          // @ts-ignore
          super(...args);
        }
      }
    } as DateConstructor;

    render(
      <ChatHeader
        title="Test"
        description="Desc"
        onReset={() => {}}
        onMinimize={() => {}}
        isSending={false}
      />,
    );
    const dot = await screen.findByTestId("chat-availability-dot");
    expect(dot.getAttribute("title")).toMatch(/Open|Available|Auki|Öppet/i);

    (global as any).Date = RealDate;
  });

  it("shows closed at 17:00 Helsinki (closing time boundary)", async () => {
    const RealDate = Date;
    // 17:00 Helsinki => 15:00 UTC
    (global as any).Date = class extends RealDate {
      constructor(...args: unknown[]) {
        if (!args.length) {
          super("2025-11-03T15:00:00.000Z");
        } else {
          // @ts-ignore
          super(...args);
        }
      }
    } as DateConstructor;

    render(
      <ChatHeader
        title="Test"
        description="Desc"
        onReset={() => {}}
        onMinimize={() => {}}
        isSending={false}
      />,
    );
    const dot = await screen.findByTestId("chat-availability-dot");
    // Accept any localized closed tooltip variant
    expect(dot.getAttribute("title")).toMatch(
      /Closed|Suljettu|Stängt|Outside business hours/i,
    );

    (global as any).Date = RealDate;
  });
});
