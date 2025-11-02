import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./ChatWidget.module.css";
import {
  IoChatbubbleEllipsesOutline,
  IoSend,
  IoChevronDown,
  IoRefresh,
} from "react-icons/io5";
import Button from "@dt/Button";
import { ChatTextArea } from "../Inputs/TextArea";

type Role = "user" | "assistant";

interface Message {
  id: string;
  role: Role;
  content: string;
  pending?: boolean;
}

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

  const apiEndpoint = useMemo(() => {
    if (endpoint) return endpoint;
    if (import.meta.env.VITE_DONNY_CHAT_ENDPOINT) {
      return import.meta.env.VITE_DONNY_CHAT_ENDPOINT;
    }
    return "/api/chat";
  }, [endpoint]);

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
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        abortControllerRef.current?.abort();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isSending) {
      return;
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
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
        throw new Error(`Request failed with ${response.status}`);
      }

      const data = await response.json();
      const assistantReply: Message = {
        id: crypto.randomUUID(),
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
        return "I couldn’t reach our studio brain right now. Please retry in a moment.";
      })();

      const fallback: Message = {
        id: crypto.randomUUID(),
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
          role="dialog"
          aria-modal="false"
          aria-hidden={!isOpen}
          tabIndex={isOpen ? 0 : -1}
        >
          <header className={styles.header}>
            <div className={styles.headerCopy}>
              <p className={styles.tagline}>DT Donny</p>
              <h2 className={styles.title}>{title}</h2>
              <p className={styles.subtitle}>{description}</p>
            </div>
            <div className={styles.headerActions}>
              <Button
                type="button"
                onClick={handleReset}
                disabled={isSending}
                aria-label="Reset conversation"
                variant="tertiary"
                size="s"
                icon={<IoRefresh />}
              >
                Reset
              </Button>
              <Button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Minimize chat"
                variant="tertiary"
                icon={<IoChevronDown />}
                size="s"
              />
            </div>
          </header>
          <div className={styles.messages} ref={scrollerRef}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={styles.message}
                data-role={message.role}
              >
                <p>{message.content}</p>
              </div>
            ))}
          </div>
          <form className={styles.composer} onSubmit={handleSubmit}>
            <label className={styles.inputLabel} htmlFor="donny-input">
              Ask Donny a question
            </label>
            <div className={styles.inputRow}>
              <ChatTextArea
                id="donny-input"
                className={styles.input}
                placeholder="Ask about a project, service, or approach…"
                value={input}
                onValueChange={setInput}
                minRows={1}
                maxRows={6}
                maxLength={1_000}
                disabled={isSending}
                aria-live="polite"
              />
              <Button
                type="submit"
                className={styles.sendButton}
                aria-label="Send message"
                disabled={isSending || !input.trim()}
                icon={<IoSend />}
                variant="primary"
                size="s"
              />
            </div>
          </form>
        </div>
      </div>
      <Button
        type="button"
        rounded={true}
        className={styles.toggle}
        data-open={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls="donny-panel"
        aria-label={isOpen ? "Hide chat" : "Chat with Donny"}
        variant="primary"
        size="m"
      >
        <IoChatbubbleEllipsesOutline />
        <span className={styles.toggleLabel}>Chat</span>
      </Button>
    </>
  );
};

export default ChatWidget;
