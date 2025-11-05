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
});
