import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import styles from "./ChatWidget.module.css";
import ChatComposer from "./ChatComposer";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import ChatToggle from "./ChatToggle";
import type { Message } from "./ChatWidget.types";

interface ChatWidgetProps {
  title?: string;
  description?: string;
  /**
   * Optional override for the API endpoint.
   * Defaults to VITE_DONNY_CHAT_ENDPOINT or /api/chat if not provided.
   */
  endpoint?: string;
}

const STORAGE_KEY = "dt-donny-chat";

const defaultGreeting: Message = {
  id: "intro",
  role: "assistant",
  content:
    "Hi! I’m Donny, the Digitaltableteur studio guide. Ask me about our work, services, or anything you see on the site.",
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

const ChatWidget: React.FC<ChatWidgetProps> = ({
  title = "Chat with Donny",
  description = "Brand-specific answers, no fluff.",
  endpoint,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([defaultGreeting]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const toggleButtonRef = useRef<HTMLButtonElement | null>(null);
  const focusReturnRef = useRef<number | null>(null);

  const apiEndpoint = useMemo(() => {
    // Resolution order: explicit prop > build-time env var > default relative
    if (endpoint) return endpoint;
    const envEndpoint = import.meta.env.VITE_DONNY_CHAT_ENDPOINT?.trim();
    if (envEndpoint) return envEndpoint;
    return "/api/chat";
  }, [endpoint]);

  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as Message[];
        if (Array.isArray(parsed) && parsed.length) {
          setMessages(parsed);
        }
      }
    } catch {
      // Ignore hydration errors
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // Ignore persistence errors
    }
  }, [messages]);

  useEffect(() => {
    if (!isOpen) return;
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
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
    };
  }, []);

  const closeChat = useCallback(() => {
    if (!isOpen) return;

    abortControllerRef.current?.abort();
    abortControllerRef.current = null;

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
  }, [isOpen]);

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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isSending) {
      return;
    }

    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: trimmed,
    };
    const pendingMessage: Message = {
      id: `pending-${Date.now()}`,
      role: "assistant",
      content: "Thinking…",
      pending: true,
    };

    setMessages((prev) => [...prev, userMessage, pendingMessage]);
    setInput("");
    setIsSending(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            ...messages.map(({ role, content }) => ({ role, content })),
            { role: userMessage.role, content: userMessage.content },
          ],
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        if ([404, 405].includes(response.status)) {
          setIsOffline(true);
        }
        throw new Error(`Request failed with ${response.status}`);
      }

      const data = await response.json();
      const assistantReply: Message = {
        id: generateId(),
        role: "assistant",
        content:
          typeof data?.reply === "string"
            ? data.reply
            : "I’m here, but something went sideways. Could you try again?",
      };

      setMessages((prev) =>
        prev.map((message) => (message.pending ? assistantReply : message)),
      );
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Chat request failed", error);
      const errorMessage = (() => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return "No worries, I stopped that request. What else can I help with?";
        }
        if (error instanceof TypeError) {
          return "Looks like we lost the connection. Check your network and try again.";
        }
        if (error instanceof Error && /429/.test(error.message)) {
          return "We just hit a request limit. Give it a moment and we’ll be back.";
        }
        if (error instanceof Error && /5\d{2}/.test(error.message)) {
          return "Donny’s brain is taking a quick nap (server hiccup). Let’s retry soon.";
        }
        if (isOffline) {
          return "Chat is temporarily offline; endpoint configuration pending.";
        }
        return "I couldn’t reach our studio brain right now. Please retry in a moment.";
      })();

      const fallback: Message = {
        id: generateId(),
        role: "assistant",
        content: errorMessage,
      };
      setMessages((prev) =>
        prev.map((message) => (message.pending ? fallback : message)),
      );
    } finally {
      abortControllerRef.current = null;
      setIsSending(false);
    }
  };

  const handleReset = () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setMessages([defaultGreeting]);
    setInput("");
    setIsSending(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

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
            isSending={isSending}
          />
          <ChatMessages ref={scrollerRef} messages={messages} />
          {isOffline && (
            <div
              className={styles.offlineNotice}
              role="status"
              aria-live="polite"
            >
              Chat temporarily offline while we finalize deployment.
            </div>
          )}
          <ChatComposer
            inputId="donny-input"
            placeholder={
              isOffline
                ? "Chat offline – check back soon"
                : "Ask about a project, service, or approach…"
            }
            value={input}
            onValueChange={setInput}
            onSubmit={handleSubmit}
            isSending={isSending || isOffline}
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
