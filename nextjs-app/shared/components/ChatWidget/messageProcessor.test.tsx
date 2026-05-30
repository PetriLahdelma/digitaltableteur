import { describe, it, expect } from "vitest";
import type { UIMessage } from "ai";
import {
  processMessage,
  processConversation,
  TOKEN_OPEN_HOURS,
  TOKEN_SERVICES_GRID,
  TOKEN_VERTAAUX_OFFER,
  extractCopy,
} from "@dt/ChatWidget/messageProcessor";

const makeMsg = (role: UIMessage["role"], text: string): UIMessage => ({
  id: Math.random().toString(36).slice(2),
  role,
  parts: [{ type: "text", text }],
});

describe("messageProcessor (user-triggered only) | OpenHours + ServicesGrid", () => {
  it("extractCopy returns raw text for basic message", () => {
    const m = makeMsg("assistant", "Hello world");
    expect(extractCopy(m)).toBe("Hello world");
  });

  it("extractCopy strips tool-result metadata from assistant messages", () => {
    const message: UIMessage = {
      id: "tool_meta",
      role: "assistant",
      parts: [
        {
          type: "tool-result",
          toolCallId: "call_123",
          result: { foo: "bar" },
        } as any,
        { type: "text", text: "Here is what I found." },
      ],
    };
    expect(extractCopy(message)).toBe("Here is what I found.");
  });

  it("extractCopy skips tool-result payloads (rendered as components)", () => {
    const message: UIMessage = {
      id: "tool_text",
      role: "assistant",
      parts: [
        {
          type: "tool-result",
          toolCallId: "call_token",
          result: "[[openHours]]",
        } as any,
      ],
    };
    expect(extractCopy(message)).toBe("");
  });

  it("assistant message alone does NOT inject components anymore", () => {
    const m = makeMsg("assistant", `Here are details ${TOKEN_OPEN_HOURS}`);
    const processed = processMessage(m);
    expect(processed.parts).toHaveLength(1);
    expect(processed.parts[0]).toMatchObject({ kind: "text" });
  });

  it("conversation injects OpenHours after user explicit token then assistant reply", () => {
    const convo = processConversation([
      makeMsg("user", `Please show ${TOKEN_OPEN_HOURS} now`),
      makeMsg("assistant", "Sure, here you go."),
    ]);
    const assistant = convo[1];
    expect(
      assistant.parts.some(
        (p) => p.kind === "component" && p.name === "OpenHours",
      ),
    ).toBe(true);
    // User part sanitized of token
    expect(convo[0].parts[0]).toMatchObject({ kind: "text" });
    expect((convo[0].parts[0] as any).content).not.toContain(TOKEN_OPEN_HOURS);
  });

  it("assistant multiple tokens now ignored (no components)", () => {
    const m = makeMsg(
      "assistant",
      `First ${TOKEN_OPEN_HOURS} middle ${TOKEN_OPEN_HOURS} end`,
    );
    const processed = processMessage(m);
    const componentCount = processed.parts.filter(
      (p) => p.kind === "component",
    ).length;
    expect(componentCount).toBe(0);
    expect(processed.parts.length).toBe(1);
  });

  // ServicesGrid token should interleave only once (dedup subsequent tokens)
  it("assistant servicesGrid token alone no longer injects component", () => {
    const m = makeMsg(
      "assistant",
      `Intro ${TOKEN_SERVICES_GRID} middle ${TOKEN_SERVICES_GRID} end`,
    );
    const processed = processMessage(m);
    const servicesParts = processed.parts.filter(
      (p) => p.kind === "component" && p.name === "ServicesGrid",
    );
    expect(servicesParts.length).toBe(0);
  });

  it("assistant heuristic services mention alone no longer injects ServicesGrid", () => {
    const m = makeMsg(
      "assistant",
      "Can you outline your services and capabilities?",
    );
    const processed = processMessage(m);
    const has = processed.parts.some(
      (p) => p.kind === "component" && p.name === "ServicesGrid",
    );
    expect(has).toBe(false);
  });

  // Multilingual heuristics (Finnish & Swedish)
  it("assistant Finnish open hours heuristic now no injection", () => {
    const m = makeMsg(
      "assistant",
      "Tässä ovat tämän päivän aukioloajat ja sulkemisaika.",
    );
    const processed = processMessage(m);
    const has = processed.parts.some(
      (p) => p.kind === "component" && p.name === "OpenHours",
    );
    expect(has).toBe(false);
  });

  it("assistant Swedish open hours heuristic now no injection", () => {
    const m = makeMsg(
      "assistant",
      "Här är dagens öppettider och stängningstid.",
    );
    const processed = processMessage(m);
    const has = processed.parts.some(
      (p) => p.kind === "component" && p.name === "OpenHours",
    );
    expect(has).toBe(false);
  });

  it("assistant Finnish services heuristic now no injection", () => {
    const m = makeMsg(
      "assistant",
      "Voimme kertoa palvelut ja mitä tarjoatte asiakkaillenne.",
    );
    const processed = processMessage(m);
    const has = processed.parts.some(
      (p) => p.kind === "component" && p.name === "ServicesGrid",
    );
    expect(has).toBe(false);
  });

  it("assistant Swedish services heuristic now no injection", () => {
    const m = makeMsg(
      "assistant",
      "Kan du lista era tjänster och vad erbjuder ni?",
    );
    const processed = processMessage(m);
    const has = processed.parts.some(
      (p) => p.kind === "component" && p.name === "ServicesGrid",
    );
    expect(has).toBe(false);
  });

  it("conversation injects ServicesGrid after user explicit token then assistant reply", () => {
    const convo = processConversation([
      makeMsg("user", `Show ${TOKEN_SERVICES_GRID} now please`),
      makeMsg("assistant", "Overview ready."),
    ]);
    const assistant = convo[1];
    expect(
      assistant.parts.some(
        (p) => p.kind === "component" && p.name === "ServicesGrid",
      ),
    ).toBe(true);
    expect((convo[0].parts[0] as any).content).not.toContain(
      TOKEN_SERVICES_GRID,
    );
  });

  it("user heuristic services mention does not inject ServicesGrid", () => {
    const m = makeMsg("user", "Tell me about your services and capabilities");
    const processed = processMessage(m);
    const hasServices = processed.parts.some(
      (p) => p.kind === "component" && p.name === "ServicesGrid",
    );
    expect(hasServices).toBe(false);
  });

  it("assistant sanitizes explicit openHours token + Finnish keyword after user token trigger", () => {
    const convo = processConversation([
      makeMsg("user", `Näytä ${TOKEN_OPEN_HOURS}`),
      makeMsg("assistant", `Aukioloajat ${TOKEN_OPEN_HOURS} ovat tässä.`),
    ]);
    const assistant = convo[1];
    const textPart = assistant.parts.find((p) => p.kind === "text") as any;
    expect(textPart.content).not.toContain(TOKEN_OPEN_HOURS);
    expect(/aukioloajat/i.test(textPart.content)).toBe(false);
  });

  it("assistant sanitizes explicit servicesGrid token + Swedish keyword after user token trigger", () => {
    const convo = processConversation([
      makeMsg("user", `Visa ${TOKEN_SERVICES_GRID}`),
      makeMsg("assistant", `Tjänster ${TOKEN_SERVICES_GRID} visas nedan.`),
    ]);
    const assistant = convo[1];
    const textPart = assistant.parts.find((p) => p.kind === "text") as any;
    expect(textPart.content).not.toContain(TOKEN_SERVICES_GRID);
    expect(/tjänster/i.test(textPart.content)).toBe(false);
  });

  it("assistant sanitizes English keyword + token for services after user token trigger", () => {
    const convo = processConversation([
      makeMsg("user", `Please show ${TOKEN_SERVICES_GRID}`),
      makeMsg("assistant", `Services ${TOKEN_SERVICES_GRID} listed.`),
    ]);
    const assistant = convo[1];
    const textPart = assistant.parts.find((p) => p.kind === "text") as any;
    expect(textPart.content).not.toContain(TOKEN_SERVICES_GRID);
    expect(/services/i.test(textPart.content)).toBe(false);
  });

  it("assistant sanitizes English keyword + token for open hours after user token trigger", () => {
    const convo = processConversation([
      makeMsg("user", `Please show ${TOKEN_OPEN_HOURS}`),
      makeMsg("assistant", `Open hours ${TOKEN_OPEN_HOURS} are shown.`),
    ]);
    const assistant = convo[1];
    const textPart = assistant.parts.find((p) => p.kind === "text") as any;
    expect(textPart.content).not.toContain(TOKEN_OPEN_HOURS);
    expect(/open\s*hours/i.test(textPart.content)).toBe(false);
  });

  it("injects VertaaUX offer after accessibility questions", () => {
    const convo = processConversation([
      makeMsg("user", "We have accessibility issues on our site"),
      makeMsg(
        "assistant",
        `VertaaUX can help audit those issues. ${TOKEN_VERTAAUX_OFFER}`,
      ),
    ]);
    const assistant = convo[1];
    const offer = assistant.parts.find(
      (part) =>
        part.kind === "component" && part.name === "VertaaUxAccessibilityOffer",
    );
    expect(offer).toMatchObject({
      kind: "component",
      name: "VertaaUxAccessibilityOffer",
      props: {
        caseStudyUrl: "/work/vertaaux",
        productUrl: "https://vertaaux.ai",
      },
    });
  });
});
