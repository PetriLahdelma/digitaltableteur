import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useReducer,
} from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { UIMessage } from "ai";
import styles from "./ChatWidget.module.css";
import ChatComposer, { ChatComposerHandle } from "./ChatComposer";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import { processConversationWithFlags } from "./messageProcessor";
import {
  emailWorkflowReducer,
  initialEmailWorkflowState,
} from "./emailWorkflow/reducer";
import ComposePrompt from "./emailWorkflow/ComposePrompt";
import FieldPrompt from "./emailWorkflow/FieldPrompt";
import ReviewSummary from "./emailWorkflow/ReviewSummary";
import SendStatus from "./emailWorkflow/SendStatus";
import { sendContactEmail } from "@dt/ContactForm/contactEmailService";
import ChatToggle from "./ChatToggle";
import { useTranslation } from "react-i18next";

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
const DEFAULT_GREETING_TEXT =
  "Hi! I’m Donny, the Digitaltableteur studio guide. Ask me about our work, or anything you notice on the site.";

const REMOTE_CHAT_ENDPOINT =
  "https://digitaltableteursecureproxy.vercel.app/api/chat";

const createGreetingMessage = (
  text: string = DEFAULT_GREETING_TEXT,
): UIMessage => ({
  id: "intro",
  role: "assistant",
  parts: [{ type: "text", text }],
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

const toStoredMessages = (
  messages: UIMessage[],
  greetingText: string = DEFAULT_GREETING_TEXT,
): StoredMessage[] => {
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
    sanitized.unshift({
      id: "intro",
      role: "assistant",
      text: greetingText,
    });
  } else {
    sanitized[0] = {
      id: "intro",
      role: "assistant",
      text: greetingText,
    };
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

const fromStoredMessages = (
  entries: StoredMessage[],
  greetingText: string = DEFAULT_GREETING_TEXT,
): UIMessage[] => {
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
      result.push(createGreetingMessage(greetingText));
      return;
    }
    result.push({
      id: entry.id || generateId(),
      role: entry.role,
      parts: [{ type: "text", text: entry.text }],
    });
  });

  if (!hasGreeting) {
    result.unshift(createGreetingMessage(greetingText));
  }

  return result.length ? result : [createGreetingMessage(greetingText)];
};

const loadInitialMessages = (
  greetingText: string = DEFAULT_GREETING_TEXT,
): UIMessage[] => {
  if (typeof window === "undefined") {
    return [createGreetingMessage(greetingText)];
  }

  const storedV2 = parseStoredMessages(localStorage.getItem(STORAGE_KEY));
  if (storedV2?.length) {
    return fromStoredMessages(storedV2, greetingText);
  }

  const legacy = parseLegacyMessages(localStorage.getItem(LEGACY_STORAGE_KEY));
  if (legacy?.length) {
    return fromStoredMessages(legacy, greetingText);
  }

  return [createGreetingMessage(greetingText)];
};
const ChatWidget: React.FC<ChatWidgetProps> = ({
  title,
  description,
  endpoint,
}) => {
  const { t } = useTranslation();
  const greetingText = t("chatGreeting", DEFAULT_GREETING_TEXT);
  const [emailWorkflow, dispatchEmailWorkflow] = useReducer(
    emailWorkflowReducer,
    initialEmailWorkflowState,
  );
  const resolvedTitle = title ?? t("chatTitle", "Chat with Donny");
  const resolvedDescription =
    description ?? t("chatDescription", "Brand-specific answers, no fluff.");
  const placeholderText = t("chatPlaceholder", "Ask me anything…");
  const inputLabelText = t("chatInputLabel", "Ask Donny a question");
  const sendLabelText = t("chatSend", "Send message");

  const errorMessages = useMemo(
    () => ({
      network: t(
        "chatErrorNetwork",
        "Looks like we lost the connection. Check your network and try again.",
      ),
      auth: t(
        "chatErrorAuth",
        "Chat is offline while we finalize our AI Gateway configuration.",
      ),
      notFound: t(
        "chatErrorNotFound",
        "Chat endpoint not found right now; we’re updating the deployment.",
      ),
      rateLimit: t(
        "chatErrorRateLimit",
        "We just hit a request limit. Give it a moment and we’ll be back.",
      ),
      server: t(
        "chatErrorServer",
        "Donny’s brain is taking a quick nap (server hiccup). Let’s retry soon.",
      ),
      fallback: t(
        "chatErrorFallback",
        "I couldn’t reach our studio brain right now. Please retry in a moment.",
      ),
    }),
    [t],
  );

  const resolveErrorMessage = useCallback(
    (error: Error | undefined | null) => {
      if (!error) return null;
      const message = error.message ?? "";
      const normalized = message.toLowerCase();

      if (normalized.includes("abort")) {
        return null;
      }
      if (normalized.includes("failed to fetch")) {
        return errorMessages.network;
      }
      if (
        normalized.includes("authentication") ||
        normalized.includes("unauthorized")
      ) {
        return errorMessages.auth;
      }
      if (normalized.includes("404") || normalized.includes("not found")) {
        return errorMessages.notFound;
      }
      if (normalized.includes("429")) {
        return errorMessages.rateLimit;
      }
      if (normalized.match(/5\d{2}/)) {
        return errorMessages.server;
      }
      return errorMessages.fallback;
    },
    [errorMessages],
  );

  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const toggleButtonRef = useRef<HTMLButtonElement | null>(null);
  const focusReturnRef = useRef<number | null>(null);

  // Determine initial endpoint (static resolution); we may fallback dynamically on certain network errors.
  const apiEndpoint = useMemo(() => {
    if (endpoint) return endpoint;
    const envEndpoint = import.meta.env.VITE_DONNY_CHAT_ENDPOINT?.trim();
    if (envEndpoint) return envEndpoint;
    if (typeof window !== "undefined") {
      const host = window.location.hostname.toLowerCase();
      // Treat private LAN IPs (RFC1918) similarly to localhost for endpoint purposes because vite dev server does not mount /api/chat.
      const isLocalLike =
        host === "localhost" ||
        host === "127.0.0.1" ||
        /^192\.168\./.test(host) ||
        /^10\./.test(host) ||
        /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host);
      const isProdDomain =
        host === "digitaltableteur.com" || host === "www.digitaltableteur.com";
      if (isLocalLike || isProdDomain) {
        return REMOTE_CHAT_ENDPOINT; // always use remote serverless function in dev & prod domain
      }
    }
    return REMOTE_CHAT_ENDPOINT; // fallback remote to avoid 404 on arbitrary hosts
  }, [endpoint]);

  // Debug flag (query param ?chatDebug=1 or localStorage flag dtChatDebug). Safe getItem wrapper for Safari private mode quirks.
  const debugEnabled = useMemo(() => {
    if (typeof window === "undefined") return false;
    const qsFlag = /(^|[?&])chatDebug=1(&|$)/.test(window.location.search);
    let lsFlag = false;
    try {
      lsFlag = localStorage.getItem("dtChatDebug") === "1";
    } catch {
      // ignore storage read issues
    }
    return qsFlag || lsFlag;
  }, []);

  const isMobileUA = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  }, []);

  // Active endpoint supports fallback switching when certain recoverable network errors occur on first attempt.
  const [activeEndpoint, setActiveEndpoint] = useState(apiEndpoint);
  const [hasRetried, setHasRetried] = useState(false);
  const lastUserMessageRef = useRef<string | null>(null);

  // Construct transport from activeEndpoint (NOT apiEndpoint directly) so we can swap.
  const transport = useMemo(() => {
    if (debugEnabled) {
      // eslint-disable-next-line no-console
      console.log("[ChatWidget] Using transport endpoint", activeEndpoint, {
        initial: apiEndpoint,
        mobile: isMobileUA,
      });
    }
    return new DefaultChatTransport({ api: activeEndpoint });
  }, [activeEndpoint, apiEndpoint, debugEnabled, isMobileUA]);

  const [initialMessages] = useState<UIMessage[]>(() =>
    loadInitialMessages(greetingText),
  );

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
    // jsdom may not implement scrollTo; feature detect and fallback
    if (typeof container.scrollTo === "function") {
      try {
        container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
      } catch {
        // fallback if options unsupported
        container.scrollTop = container.scrollHeight;
      }
    } else {
      container.scrollTop = container.scrollHeight;
    }
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
      const serialized = toStoredMessages(messages, greetingText);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch {
      // ignore storage errors
    }
  }, [messages, greetingText]);

  useEffect(() => {
    setMessages((previous) => {
      if (!previous.length) return previous;
      const [first, ...rest] = previous;
      if (!first || first.id !== "intro") return previous;
      const currentText = extractTextFromMessage(first);
      if (currentText === greetingText) return previous;
      return [createGreetingMessage(greetingText), ...rest];
    });
  }, [greetingText, setMessages]);

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

  const composerRef = useRef<ChatComposerHandle | null>(null);
  const handleToggle = useCallback(() => {
    if (isOpen) {
      closeChat();
      return;
    }
    setIsOpen(true);
    // Defer focus to next animation frame after open state renders composer.
    requestAnimationFrame(() => composerRef.current?.focusInput());
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

      lastUserMessageRef.current = trimmed;
      if (debugEnabled) {
        // eslint-disable-next-line no-console
        console.log("[ChatWidget] Sending user message", {
          text: trimmed,
          endpoint: activeEndpoint,
        });
      }
      sendMessage({ text: trimmed });
      setDraft("");
    },
    [
      draft,
      isStreaming,
      sendMessage,
      error,
      clearError,
      activeEndpoint,
      debugEnabled,
    ],
  );

  // Endpoint fallback logic: on certain network errors (failed to fetch / not found) try alternate endpoint once.
  useEffect(() => {
    if (!error || hasRetried) return;
    const message = (error.message || "").toLowerCase();
    const isRecoverable =
      message.includes("failed to fetch") ||
      message.includes("not found") ||
      message.includes("404");
    if (!isRecoverable) return;
    const alternate =
      activeEndpoint === REMOTE_CHAT_ENDPOINT
        ? "/api/chat"
        : REMOTE_CHAT_ENDPOINT;
    if (alternate === activeEndpoint) return; // no alternate
    setHasRetried(true);
    setActiveEndpoint(alternate);
    if (debugEnabled) {
      // eslint-disable-next-line no-console
      console.warn(
        "[ChatWidget] Recoverable error detected; switching endpoint",
        {
          from: activeEndpoint,
          to: alternate,
          error: error.message,
        },
      );
    }
  }, [error, hasRetried, activeEndpoint, debugEnabled]);

  // After switching endpoint, automatically retry last user message if present.
  useEffect(() => {
    if (!hasRetried) return;
    if (!lastUserMessageRef.current) return;
    // Avoid retry during streaming state; wait until idle.
    if (status === "streaming" || status === "submitted") return;
    const text = lastUserMessageRef.current;
    lastUserMessageRef.current = null; // prevent duplicate resend
    if (debugEnabled) {
      // eslint-disable-next-line no-console
      console.log(
        "[ChatWidget] Retrying last message after endpoint switch",
        text,
      );
    }
    sendMessage({ text });
  }, [hasRetried, status, sendMessage, debugEnabled]);

  const handleReset = useCallback(() => {
    stop();
    const resetMessages = [createGreetingMessage(greetingText)];
    setMessages(resetMessages);
    setDraft("");
    clearError();

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(toStoredMessages(resetMessages, greetingText)),
        );
      } catch {
        // ignore storage errors
      }
    }
  }, [stop, setMessages, clearError, greetingText]);

  // Derive processed parts for trigger detection (non-render injection for now)
  // Email workflow trigger detection + assistant phrase injection
  const lastAssistantIndexRef = useRef<number | null>(null);
  useEffect(() => {
    const processedResult = processConversationWithFlags(messages as any);
    const { pendingEmailWorkflowGeneral, pendingEmailWorkflowSimple } =
      processedResult;
    const shouldTrigger =
      (pendingEmailWorkflowGeneral || pendingEmailWorkflowSimple) &&
      emailWorkflow.step === "idle";
    if (shouldTrigger) {
      dispatchEmailWorkflow({ type: "TRIGGER" });
      // Inject a synthetic assistant message with required phrase OR email info prior to workflow UI.
      const phraseGeneral = t(
        "chatEmailSendPhrase",
        "Sure thing! Let's send an email!",
      );
      const phraseSimple = t(
        "chatEmailSimplePhrase",
        "Our email is mail@digitaltableteur.com. Would you like to send an email now?",
      );
      const synthetic: UIMessage = {
        id: generateId(),
        role: "assistant",
        parts: [
          {
            type: "text",
            text: pendingEmailWorkflowGeneral ? phraseGeneral : phraseSimple,
          },
        ],
      };
      setMessages((prev) => {
        const next = [...prev, synthetic];
        lastAssistantIndexRef.current = next.length - 1; // index of synthetic assistant message
        return next;
      });
    }
  }, [messages, emailWorkflow.step, t, setMessages]);

  // Handle send side-effects when entering 'sending'
  useEffect(() => {
    if (emailWorkflow.step !== "sending" || !("draft" in emailWorkflow)) return;
    const draft = emailWorkflow.draft;
    let cancelled = false;
    (async () => {
      try {
        const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID?.trim();
        const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID?.trim();
        const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY?.trim();
        await sendContactEmail({
          SERVICE_ID,
          TEMPLATE_ID,
          PUBLIC_KEY,
          payload: {
            name: draft.fullName.trim(),
            email: draft.email.trim(),
            phone: draft.phone?.trim() || "",
            interest: draft.interest,
            message: draft.message.trim(),
          },
        });
        if (cancelled) return;
        dispatchEmailWorkflow({ type: "SEND_SUCCESS" });
      } catch (err: any) {
        if (cancelled) return;
        const code = err?.code || err?.message || "unknown";
        dispatchEmailWorkflow({ type: "SEND_ERROR", errorCode: code });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [emailWorkflow]);

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
            title={resolvedTitle}
            description={resolvedDescription}
            onReset={handleReset}
            onMinimize={closeChat}
            isSending={isStreaming}
          />
          <ChatMessages
            ref={scrollerRef}
            messages={messages}
            isStreaming={isStreaming}
            emailWorkflow={emailWorkflow}
            dispatchEmailWorkflow={dispatchEmailWorkflow}
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
            ref={composerRef}
            inputId="donny-input"
            placeholder={placeholderText}
            label={inputLabelText}
            sendLabel={sendLabelText}
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
