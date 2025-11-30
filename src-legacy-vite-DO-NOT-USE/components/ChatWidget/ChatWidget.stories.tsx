import React, { useEffect, useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import ChatWidget from "./ChatWidget";
import { ChatTextArea } from "../Inputs/TextArea";
import Title from "@dt/Title";
import Text from "@dt/Text";

const FAKE_ENDPOINT = "/storybook-fake-chat";

const useMockChat = () => {
  const callCount = useRef(0);
  const [isMounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const originalFetch = globalThis.fetch;

    const handler: typeof globalThis.fetch = async (input, init) => {
      const url = typeof input === "string" ? input : input.toString();
      if (!url.includes(FAKE_ENDPOINT)) {
        return originalFetch(input, init);
      }

      callCount.current += 1;
      const replyBank = [
        "Great choice! I’m Donny’s demo brain. Ask me about projects, services, or design nerd-outs.",
        "Our real assistant riffs on portfolio data, but this preview keeps it short and sweet.",
        "Curious about tech stack, strategy, or next steps? I’ve got quick answers ready.",
      ];
      const reply =
        replyBank[(callCount.current - 1) % replyBank.length] ?? replyBank[0];

      const encoder = new TextEncoder();
      const stream = new ReadableStream<Uint8Array>({
        start(controller) {
          const assistantId = `assistant-${callCount.current}`;
          const words = reply.split(" ");
          const chunks = [
            { delay: 0, data: { type: "text-start", id: assistantId } },
            ...words.map((word, index) => ({
              delay: 120 * (index + 1),
              data: {
                type: "text-delta",
                id: assistantId,
                delta: `${word}${index === words.length - 1 ? "" : " "}`,
              },
            })),
            {
              delay: 120 * words.length + 80,
              data: { type: "text-end", id: assistantId },
            },
          ];

          chunks.forEach(({ delay, data }, index) => {
            setTimeout(() => {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify(data)}\n\n`),
              );
              if (index === chunks.length - 1) {
                controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                controller.close();
              }
            }, delay);
          });
        },
      });

      return new Response(stream, {
        status: 200,
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    };

    globalThis.fetch = handler;
    try {
      localStorage.removeItem("dt-donny-chat");
      localStorage.removeItem("dt-donny-chat-v2");
    } catch {
      /* ignore */
    }

    return () => {
      globalThis.fetch = originalFetch;
      setMounted(false);
    };
  }, []);

  return isMounted;
};

const ChatWidgetStoryDemo = () => {
  const ready = useMockChat();
  if (!ready) {
    return null;
  }
  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "2rem",
        background: "var(--main-body-background-color, #f5f5f5)",
        color: "var(--color-text, #111)",
      }}
    >
      <div style={{ maxWidth: "32rem", marginBottom: "6rem" }}>
        <Text size="M" terminals="sans">
          Donny Preview
        </Text>
        <Text size="S">
          Click the chat bubble in the bottom-right corner to open the demo. You
          can type a prompt and Donny will answer with a prerecorded reply so
          you can explore the flow without calling the real API.
        </Text>
      </div>
      <ChatWidget
        endpoint={FAKE_ENDPOINT}
        title="Meet Donny"
        description="This Storybook preview simulates the chat flow."
      />
    </div>
  );
};

const meta: Meta<typeof ChatWidget> = {
  title: "Components/AI/Chat/ChatWidget",
  component: ChatWidget,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Collapsible assistant widget that anchors bottom-right and remembers the conversation.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof ChatWidget>;

export const Playground: Story = {
  render: () => <ChatWidgetStoryDemo />,
};

export const ChatTextAreaDemo = (): React.ReactElement => {
  const [value, setValue] = React.useState(
    "Hello from Donny preview!\nAsk me anything about Digitaltableteur.",
  );

  return (
    <div style={{ maxWidth: "32rem" }}>
      <ChatTextArea
        value={value}
        onValueChange={setValue}
        placeholder="Type your message…"
        minRows={1}
        maxRows={6}
      />
    </div>
  );
};
