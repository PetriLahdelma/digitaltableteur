import contract from "./ChatWidget.contract.json";
import React, { useEffect, useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import ChatWidget from "./ChatWidget";
import { ChatTextArea } from "./ChatTextArea";
import Title from "@dt/Title";
import Text from "@dt/Text";
import { expect, userEvent, waitFor, within } from "storybook/test"; // expect is available globally in Storybook browser tests

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

const ChatWidgetStoryDemo = (
  args?: Partial<React.ComponentProps<typeof ChatWidget>>,
) => {
  const ready = useMockChat();
  if (!ready) {
    return null;
  }
  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "2rem",
        background: "var(--main-body-background-color)",
        color: "var(--color-text)",
      }}
    >
      <div style={{ maxWidth: "32rem", marginBottom: "6rem" }}>
        <Text size="m" terminals="sans">
          Donny Preview
        </Text>
        <Text size="s">
          Click the chat bubble in the bottom-right corner to open the demo. You
          can type a prompt and Donny will answer with a prerecorded reply so
          you can explore the flow without calling the real API.
        </Text>
      </div>
      <ChatWidget
        endpoint={FAKE_ENDPOINT}
        title="Meet Donny"
        description="This Storybook preview simulates the chat flow."
        {...args}
      />
    </div>
  );
};

const meta: Meta<typeof ChatWidget> = {
  title: "Site/ChatWidget",
  component: ChatWidget,
  tags: ["beta", "!autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=473-25",
    },
    layout: "fullscreen",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: {
      description: {
        component:
          "Collapsible assistant widget that anchors bottom-right and remembers the conversation.",
      },
    },
  },
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts).
};

export default meta;

type Story = StoryObj<typeof ChatWidget>;

export const Playground: Story = {
  parameters: { a11y: { disable: true, test: "off" } },
  tags: ["beta-matrix"],
  // title/description render inside the chat panel (visible only once the
  // bubble is clicked open) and endpoint is behavior-only — all three are
  // effect-exempt in audit:controls; the EmptyState play story opens the
  // panel and asserts the title heading renders.
  render: (args) => <ChatWidgetStoryDemo {...args} />,
};

export const Default = Playground;

export const EmptyState: Story = {
  render: () => <ChatWidgetStoryDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(
      () => {
        expect(
          canvas.getByRole("button", { name: /chat|donny/i }),
        ).toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    // Open chat to see empty state
    const chatButton = canvas.getByRole("button", { name: /chat|donny/i });
    await userEvent.click(chatButton);

    // Verify empty state shows welcome message
    await waitFor(() => {
      expect(
        canvas.getByRole("heading", { name: /meet donny/i }),
      ).toBeInTheDocument();
    });
  },
};

export const KeyboardNavigation: Story = {
  render: () => <ChatWidgetStoryDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(
      () => {
        expect(
          canvas.getByRole("button", { name: /chat|donny/i }),
        ).toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    // Open with keyboard
    const chatButton = canvas.getByRole("button", { name: /chat|donny/i });
    chatButton.focus();
    await userEvent.keyboard("{Enter}");

    await waitFor(() => {
      expect(
        canvas.getByRole("heading", { name: /meet donny/i }),
      ).toBeInTheDocument();
    });

    // Type message with keyboard
    const input = canvas.getByRole("textbox");
    input.focus();
    await userEvent.keyboard("Hello Donny");

    // Verify message typed correctly
    expect(input).toHaveValue("Hello Donny");

    // Submit with Enter key
    await userEvent.keyboard("{Enter}");

    // Wait for user message to appear in chat (submitted successfully)
    await waitFor(
      () => {
        expect(canvas.getByText("Hello Donny")).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  },
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

export const Example: Story = {
  globals: { forcedColors: "none" },
  tags: ["beta-matrix"],
  render: () => <ChatWidgetStoryDemo />,
  parameters: { a11y: { disable: true }, controls: { disable: true } },
};

export const ForcedColors: Story = {
  parameters: { a11y: { disable: true, test: "off" } },
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  render: () => <ChatWidgetStoryDemo />,
};
