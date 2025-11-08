import React from "react";
import { render, screen } from "@testing-library/react";
import ChatHeader from "./ChatHeader";
import { I18nextProvider } from "react-i18next";
import i18n from "../../i18n";

function withI18n(ui: React.ReactElement) {
  return <I18nextProvider i18n={i18n}>{ui}</I18nextProvider>;
}

describe("ChatHeader offline title logic", () => {
  const baseProps = {
    description: "desc",
    onReset: () => {},
    onMinimize: () => {},
    isSending: false,
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
