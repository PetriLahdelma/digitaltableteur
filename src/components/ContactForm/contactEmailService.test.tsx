import { describe, it, expect, vi, beforeEach } from "vitest";

import { EmailServiceError, sendContactEmail } from "./contactEmailService";

const sendMock = vi.fn();

vi.mock("@emailjs/browser", () => ({
  send: (...args: any[]) => sendMock(...args),
}));

describe("contactEmailService", () => {
  beforeEach(() => {
    sendMock.mockReset();
  });

  it("throws when credentials are missing", async () => {
    await expect(
      sendContactEmail({
        payload: { name: "A", email: "a@example.com", message: "Hi" },
      }),
    ).rejects.toBeInstanceOf(EmailServiceError);
  });

  it("forwards payload to emailjs", async () => {
    sendMock.mockResolvedValueOnce({});
    await sendContactEmail({
      SERVICE_ID: "service",
      TEMPLATE_ID: "template",
      PUBLIC_KEY: "public",
      payload: {
        name: "Jane",
        email: "jane@example.com",
        phone: "123",
        interest: ["a", "b"],
        message: "Hello",
        hearAbout: "search",
        time: "now",
      },
    });
    expect(sendMock).toHaveBeenCalledWith(
      "service",
      "template",
      expect.objectContaining({
        name: "Jane",
        email: "jane@example.com",
        phone: "123",
        interest: "a, b",
        hearAbout: "search",
        message: "Hello",
      }),
      "public",
    );
  });

  it("wraps send failures", async () => {
    sendMock.mockRejectedValueOnce(new Error("boom"));
    await expect(
      sendContactEmail({
        SERVICE_ID: "service",
        TEMPLATE_ID: "template",
        PUBLIC_KEY: "public",
        payload: { name: "Jane", email: "jane@example.com", message: "Hi" },
      }),
    ).rejects.toMatchObject({ code: "sendFailed" });
  });
});
