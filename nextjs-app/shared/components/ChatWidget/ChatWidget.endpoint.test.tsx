import { describe, expect, it } from "vitest";
import {
  isLocalLikeHost,
  isTrustedChatHost,
  resolveChatApiEndpoint,
} from "./ChatWidget";

describe("ChatWidget endpoint resolution", () => {
  it("treats local development hosts as same-origin safe", () => {
    expect(isLocalLikeHost("localhost")).toBe(true);
    expect(isLocalLikeHost("192.168.1.55")).toBe(true);
    expect(isLocalLikeHost("172.20.0.5")).toBe(true);
  });

  it("only trusts the exact production host or subdomains", () => {
    expect(isTrustedChatHost("digitaltableteur.com")).toBe(true);
    expect(isTrustedChatHost("www.digitaltableteur.com")).toBe(true);
    expect(isTrustedChatHost("preview.digitaltableteur.com")).toBe(true);
    expect(isTrustedChatHost("evil-digitaltableteur.com")).toBe(false);
    expect(isTrustedChatHost("digitaltableteur.com.evil.test")).toBe(false);
  });

  it("uses same-origin API only for trusted hosts", () => {
    expect(
      resolveChatApiEndpoint({
        hostname: "www.digitaltableteur.com",
        origin: "https://www.digitaltableteur.com",
      }),
    ).toBe("https://www.digitaltableteur.com/api/chat");

    expect(
      resolveChatApiEndpoint({
        hostname: "evil-digitaltableteur.com",
        origin: "https://evil-digitaltableteur.com",
      }),
    ).toBe("https://www.digitaltableteur.com/api/chat");
  });
});
