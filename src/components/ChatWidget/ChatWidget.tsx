import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { UIMessage } from "ai";
import styles from "./ChatWidget.module.css";
import ChatComposer from "./ChatComposer";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import ChatToggle from "./ChatToggle";

interface ChatWidgetProps {
  title?: string;
  description?: string;
  /**
   * Optional override for the API endpoint.
   * Defaults to VITE_DONNY_CHAT_ENDPOINT, otherwise falls back to the secure proxy or /api/chat.
   */
  endpoint?: string;
}

const STORAGE_KEY = "dt-donny-chat-v2";
const LEGACY_STORAGE_KEY = "dt-donny-chat";
const GREETING_TEXT =
  "Hi! I’m Donny, the Digitaltableteur studio guide. Ask me about our work, services, or anything you see on the site.";

const REMOTE_CHAT_ENDPOINT =
  "https://digitaltableteursecureproxy.vercel.app/api/chat";

const createGreetingMessage = (): UIMessage => ({
  id: "intro",
  role: "assistant",
  parts: [{ type: "text", text: GREETING_TEXT }],
});

type StoredMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

const generateId = () => {
  if (
    typeof globalThis !== "undefined" &&
    globalThis.crypto &&
    typeof globalThis.crypto.randomUUID === "function"
  ) {
    return globalThis.crypto.randomUUID();
  }

  if (
    typeof globalThis !== "undefined" &&
    globalThis.crypto &&
    typeof globalThis.crypto.getRandomValues === "function"
  ) {
    const bytes = new Uint8Array(16);
    globalThis.crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"));

    return [
      hex.slice(0, 4).join(""),
      hex.slice(4, 6).join(""),
      hex.slice(6, 8).join(""),
      hex.slice(8, 10).join(""),
      hex.slice(10, 16).join(""),
    ].join("-");
  }

  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const extractTextFromMessage = (message: UIMessage) => {
  if (!Array.isArray(message.parts) || message.parts.length === 0) {
    return "";
  }

  return message.parts
    .map((part) => {
      if (part.type === "text") {
        const textPart = part as { text?: unknown };
        return typeof textPart.text === "string" ? textPart.text : "";
      }
      if (part.type === "reasoning" && "text" in part) {
        const textValue = (part as { text?: unknown }).text;
        return typeof textValue === "string" ? textValue : "";
      }
      if (part.type === "tool-result" || part.type.startsWith("tool-")) {
        const toolPart = part as unknown as {
          type: string;
          toolName?: string;
          toolCallId: string;
        };
        const label = toolPart.toolName ?? toolPart.toolCallId ?? "tool";
        return `[${label} result available]`;
      }
      return "";
    })
    .filter(Boolean)
    .join("\n\n")
    .trim();
};

const toStoredMessages = (messages: UIMessage[]): StoredMessage[] => {
  const unique = new Map<string, StoredMessage>();

  messages
    .filter(
      (message) => message.role === "assistant" || message.role === "user",
    )
    .forEach((message) => {
      const { role } = message;
      if (role !== "assistant" && role !== "user") {
        return;
      }
      const text = extractTextFromMessage(message);
      if (!text) return;
      unique.set(message.id, {
        id: message.id,
        role,
        text,
      });
    });

  const ordered: StoredMessage[] = [];
  messages.forEach((message) => {
    if (!unique.has(message.id)) return;
    const existing = unique.get(message.id);
    if (existing && !ordered.find((entry) => entry.id === existing.id)) {
      ordered.push(existing);
    }
  });

  const sanitized = ordered.filter(
    (entry) => entry.role === "assistant" || entry.role === "user",
  );

  if (sanitized.length === 0 || sanitized[0]?.id !== "intro") {
    sanitized.unshift({ id: "intro", role: "assistant", text: GREETING_TEXT });
  } else {
    sanitized[0] = { id: "intro", role: "assistant", text: GREETING_TEXT };
  }

  return sanitized;
};

const parseStoredMessages = (raw: string | null): StoredMessage[] | null => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;

    const messages: StoredMessage[] = [];
    parsed.forEach((item) => {
      if (!item || typeof item !== "object") return;
      const candidate = item as Partial<StoredMessage>;
      if (
        (candidate.role === "assistant" || candidate.role === "user") &&
        typeof candidate.text === "string"
      ) {
        messages.push({
          id:
            typeof candidate.id === "string" && candidate.id
              ? candidate.id
              : generateId(),
          role: candidate.role,
          text: candidate.text,
        });
      }
    });

    return messages.length ? messages : null;
  } catch {
    return null;
  }
};

const parseLegacyMessages = (raw: string | null): StoredMessage[] | null => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;

    const messages: StoredMessage[] = [];
    parsed.forEach((item) => {
      if (!item || typeof item !== "object") return;
      const candidate = item as {
        id?: string;
        role?: string;
        content?: string;
      };
      if (
        (candidate.role === "assistant" || candidate.role === "user") &&
        typeof candidate.content === "string"
      ) {
        messages.push({
          id:
            typeof candidate.id === "string" && candidate.id
              ? candidate.id
              : generateId(),
          role: candidate.role,
          text: candidate.content,
        });
      }
    });

    return messages.length ? messages : null;
  } catch {
    return null;
  }
};

const fromStoredMessages = (entries: StoredMessage[]): UIMessage[] => {
  const seen = new Set<string>();
  const ordered: StoredMessage[] = [];

  entries.forEach((entry) => {
    if (seen.has(entry.id)) return;
    seen.add(entry.id);
    ordered.push(entry);
  });

  const result: UIMessage[] = [];
  let hasGreeting = false;

  ordered.forEach((entry) => {
    if (!entry.text.trim()) return;
    if (entry.id === "intro") {
      hasGreeting = true;
      result.push(createGreetingMessage());
      return;
    }
    result.push({
      id: entry.id || generateId(),
      role: entry.role,
      parts: [{ type: "text", text: entry.text }],
    });
  });

  if (!hasGreeting) {
    result.unshift(createGreetingMessage());
  }

  return result.length ? result : [createGreetingMessage()];
};

const loadInitialMessages = (): UIMessage[] => {
  if (typeof window === "undefined") {
    return [createGreetingMessage()];
  }

  const storedV2 = parseStoredMessages(localStorage.getItem(STORAGE_KEY));
  if (storedV2?.length) {
    return fromStoredMessages(storedV2);
  }

  const legacy = parseLegacyMessages(localStorage.getItem(LEGACY_STORAGE_KEY));
  if (legacy?.length) {
    return fromStoredMessages(legacy);
  }

  return [createGreetingMessage()];
};

const resolveErrorMessage = (error: Error | undefined | null) => {
  if (!error) return null;
  const message = error.message ?? "";
  const normalized = message.toLowerCase();

  if (normalized.includes("abort")) {
    return null;
  }
  if (normalized.includes("failed to fetch")) {
    return "Looks like we lost the connection. Check your network and try again.";
  }
  if (
    normalized.includes("authentication") ||
    normalized.includes("unauthorized")
  ) {
    return "Chat is offline while we finalize our AI Gateway configuration.";
  }
  if (normalized.includes("404") || normalized.includes("not found")) {
    return "Chat endpoint not found right now; we’re updating the deployment.";
  }
  if (normalized.includes("429")) {
    return "We just hit a request limit. Give it a moment and we’ll be back.";
  }
  if (normalized.match(/5\d{2}/)) {
    return "Donny’s brain is taking a quick nap (server hiccup). Let’s retry soon.";
  }
  return "I couldn’t reach our studio brain right now. Please retry in a moment.";
};

const ChatWidget: React.FC<ChatWidgetProps> = ({
  title = "Chat with Donny",
  description = "Brand-specific answers, no fluff.",
  endpoint,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const toggleButtonRef = useRef<HTMLButtonElement | null>(null);
  const focusReturnRef = useRef<number | null>(null);

  const apiEndpoint = useMemo(() => {
    if (endpoint) return endpoint;
    const envEndpoint = import.meta.env.VITE_DONNY_CHAT_ENDPOINT?.trim();
    if (envEndpoint) return envEndpoint;
    if (typeof window !== "undefined") {
      const host = window.location.hostname.toLowerCase();
      if (
        host === "localhost" ||
        host === "127.0.0.1" ||
        host === "digitaltableteur.com" ||
        host === "www.digitaltableteur.com"
      ) {
        return REMOTE_CHAT_ENDPOINT;
      }
    }
    return "/api/chat";
  }, [endpoint]);

  const [initialMessages] = useState<UIMessage[]>(() => loadInitialMessages());

  const transport = useMemo(() => {
    return new DefaultChatTransport({
      api: apiEndpoint,
    });
  }, [apiEndpoint]);

  const {
    messages,
    sendMessage,
    stop,
    status,
    error,
    clearError,
    setMessages,
  } = useChat({
    id: "donny-chat",
    messages: initialMessages,
    transport,
  });

  const isStreaming = status === "submitted" || status === "streaming";
  const errorMessage = resolveErrorMessage(error);

  useEffect(() => {
    if (!isOpen) return;
    const container = scrollerRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
  }, [messages, isOpen]);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    if (isOpen) {
      panel.removeAttribute("inert");
    } else {
      panel.setAttribute("inert", "");
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (focusReturnRef.current !== null && typeof window !== "undefined") {
        cancelAnimationFrame(focusReturnRef.current);
      }
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const serialized = toStoredMessages(messages);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch {
      // ignore storage errors
    }
  }, [messages]);

  const closeChat = useCallback(() => {
    if (!isOpen) return;

    stop();

    if (
      panelRef.current &&
      document.activeElement instanceof HTMLElement &&
      panelRef.current.contains(document.activeElement)
    ) {
      document.activeElement.blur();
    }

    setIsOpen(false);

    if (typeof window !== "undefined") {
      focusReturnRef.current = window.requestAnimationFrame(() => {
        toggleButtonRef.current?.focus();
        focusReturnRef.current = null;
      });
    } else {
      toggleButtonRef.current?.focus();
    }
  }, [isOpen, stop]);

  const handleToggle = useCallback(() => {
    if (isOpen) {
      closeChat();
      return;
    }
    setIsOpen(true);
  }, [closeChat, isOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeChat();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [closeChat]);

  const handleSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      const trimmed = draft.trim();
      if (!trimmed || isStreaming) {
        return;
      }

      if (error) {
        clearError();
      }

      sendMessage({ text: trimmed });
      setDraft("");
    },
    [draft, isStreaming, sendMessage, error, clearError],
  );

  const handleReset = useCallback(() => {
    stop();
    const resetMessages = [createGreetingMessage()];
    setMessages(resetMessages);
    setDraft("");
    clearError();

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(toStoredMessages(resetMessages)),
        );
      } catch {
        // ignore storage errors
      }
    }
  }, [stop, setMessages, clearError]);

  return (
    <>
      <div className={styles.container} data-open={isOpen}>
        <div
          id="donny-panel"
          className={styles.panel}
          ref={panelRef}
          role="dialog"
          aria-modal="false"
          aria-hidden={!isOpen}
          tabIndex={isOpen ? 0 : -1}
        >
          <ChatHeader
            title={title}
            description={description}
            onReset={handleReset}
            onMinimize={closeChat}
            isSending={isStreaming}
          />
          <ChatMessages
            ref={scrollerRef}
            messages={messages}
            isStreaming={isStreaming}
          />
          {errorMessage && (
            <div
              className={styles.statusBanner}
              role="status"
              aria-live="polite"
            >
              {errorMessage}
            </div>
          )}
          <ChatComposer
            inputId="donny-input"
            placeholder="Ask about a project, service, or approach…"
            value={draft}
            onValueChange={setDraft}
            onSubmit={handleSubmit}
            isSending={isStreaming}
            maxLength={1_000}
          />
        </div>
      </div>
      <ChatToggle
        ref={toggleButtonRef}
        isOpen={isOpen}
        onToggle={handleToggle}
        controlsId="donny-panel"
      />
    </>
  );
};

export default ChatWidget;
