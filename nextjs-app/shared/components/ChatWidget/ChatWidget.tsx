"use client";

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
const RESEND_CONTACT_ENDPOINT = "/api/contact";
import ChatToggle from "./ChatToggle";
import { useTranslate } from "../../lib/translation";
import { resolveChatAvatarState } from "./chatAvatarState";
import { useDonnyChatNavigation } from "./useDonnyChatNavigation";
import { useDonnyChatLead } from "./useDonnyChatLead";
import { useDonnyChatExpression } from "./useDonnyChatExpression";

export interface ChatWidgetProps {
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
  "Hi! I'm Donny, the Digitaltableteur studio guide. Ask me about our work, or anything you notice on the site.";

const REMOTE_CHAT_ENDPOINT = "https://www.digitaltableteur.com/api/chat";
const INTERNAL_SITE_HOST = "digitaltableteur.com";

export function isTrustedChatHost(hostname: string): boolean {
  return (
    hostname === INTERNAL_SITE_HOST ||
    hostname.endsWith(`.${INTERNAL_SITE_HOST}`)
  );
}

export function isLocalLikeHost(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    /^192\.168\./.test(hostname) ||
    /^10\./.test(hostname) ||
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname)
  );
}

export type ChatErrorMessages = {
  network: string;
  auth: string;
  notFound: string;
  rateLimit: string;
  server: string;
  fallback: string;
};

/** Map useChat / transport errors to user-facing copy. */
export function resolveChatErrorMessage(
  error: Error | undefined | null,
  messages: ChatErrorMessages,
): string | null {
  if (!error) return null;
  const message = error.message ?? "";
  const normalized = message.toLowerCase();

  if (normalized.includes("abort")) {
    return null;
  }
  if (normalized.includes("failed to fetch")) {
    return messages.network;
  }
  if (
    normalized.includes("authentication") ||
    normalized.includes("unauthorized")
  ) {
    return messages.auth;
  }
  if (normalized.includes("404") || normalized.includes("not found")) {
    return messages.notFound;
  }
  if (
    normalized.includes("429") ||
    normalized.includes("rate limit") ||
    normalized.includes("rate_limit") ||
    normalized.includes("rate-limit") ||
    normalized.includes("quota") ||
    normalized.includes("insufficient_quota") ||
    normalized.includes("too many requests")
  ) {
    return messages.rateLimit;
  }
  if (
    normalized.includes("invalid 'tools") ||
    normalized.includes('invalid "tools')
  ) {
    return messages.server;
  }
  if (normalized.match(/5\d{2}/)) {
    return messages.server;
  }
  if (
    normalized.includes("no output generated") ||
    normalized.includes("gateway")
  ) {
    return messages.rateLimit;
  }
  return messages.fallback;
}

export function resolveChatApiEndpoint(options: {
  endpoint?: string;
  envEndpoint?: string;
  hostname?: string;
  origin?: string;
}): string {
  const {
    endpoint,
    envEndpoint,
    hostname,
    origin,
  } = options;

  if (endpoint?.trim()) {
    return endpoint.trim();
  }

  if (envEndpoint?.trim()) {
    return envEndpoint.trim();
  }

  if (
    hostname &&
    origin &&
    (isLocalLikeHost(hostname) || isTrustedChatHost(hostname))
  ) {
    return `${origin}/api/chat`;
  }

  return REMOTE_CHAT_ENDPOINT;
}

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

export const generateId = () => {
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
        // Tool results are rendered as interactive components (NavigateLink, ProjectCards, etc.)
        // — never include placeholder text for them in stored messages.
        return "";
      }
      return "";
    })
    .filter(Boolean)
    .join("\n\n")
    .trim();
};

export const toStoredMessages = (
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

export const parseStoredMessages = (raw: string | null): StoredMessage[] | null => {
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

export const parseLegacyMessages = (raw: string | null): StoredMessage[] | null => {
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

export const fromStoredMessages = (
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
): UIMessage[] => [createGreetingMessage(greetingText)];

const loadStoredMessages = (
  greetingText: string = DEFAULT_GREETING_TEXT,
): UIMessage[] | null => {
  if (typeof window === "undefined") return null;

  try {
    const storedRaw = localStorage.getItem(STORAGE_KEY);
    const storedV2 = parseStoredMessages(storedRaw);
    if (storedV2?.length) {
      return fromStoredMessages(storedV2, greetingText);
    }
    if (storedRaw) {
      localStorage.removeItem(STORAGE_KEY);
    }

    const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
    const legacy = parseLegacyMessages(legacyRaw);
    if (legacy?.length) {
      return fromStoredMessages(legacy, greetingText);
    }
    if (legacyRaw) {
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    }
  } catch {
    // ignore storage errors and fall back to greeting
  }

  return null;
};

/** Collapsible AI chat widget anchored to the viewport. */
const ChatWidget: React.FC<ChatWidgetProps> = ({
  title,
  description,
  endpoint,
}) => {
  const t = useTranslate();
  const greetingText = t("chatGreeting", DEFAULT_GREETING_TEXT);
  const [emailWorkflow, dispatchEmailWorkflow] = useReducer(
    emailWorkflowReducer,
    initialEmailWorkflowState,
  );
  // || not ??: Storybook's seeded text controls pass "", and an empty
  // dialog title/description is never valid — fall back to the translations.
  const resolvedTitle = title || t("chatTitle", "Chat with Donny");
  const resolvedDescription =
    description || t("chatDescription", "Brand-specific answers, no fluff.");
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
    (chatError: Error | undefined | null) =>
      resolveChatErrorMessage(chatError, errorMessages),
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
    const envEndpoint =
      (typeof import.meta !== "undefined" &&
        (import.meta as any).env?.VITE_DONNY_CHAT_ENDPOINT?.trim?.()) ||
      process.env.NEXT_PUBLIC_DONNY_CHAT_ENDPOINT?.trim?.();
    const hostname = typeof window !== "undefined" ? window.location.hostname : undefined;
    const origin = typeof window !== "undefined" ? window.location.origin : undefined;

    return resolveChatApiEndpoint({
      endpoint,
      envEndpoint,
      hostname,
      origin,
    });
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
    return new DefaultChatTransport({ api: activeEndpoint });
  }, [activeEndpoint, apiEndpoint, isMobileUA]);

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

  useDonnyChatNavigation(messages, status);
  useDonnyChatLead(messages, status);
  const forcedExpression = useDonnyChatExpression(messages, status);

  // Keywords that trigger special Donny reactions when user types them
  const TOOL_KEYWORDS = [
    "map", "location", "where", "address", "directions", "navigate",
    "email", "contact", "message", "send", "write",
    "search", "find", "look", "show me",
    "help", "how", "what", "why", "explain",
    "work", "portfolio", "project", "case study",
    "service", "offer", "price", "cost", "hire",
    "expression", "mood", "face", "moods",
  ];

  const reactiveAvatarState = useMemo(
    () =>
      resolveChatAvatarState({
        status,
        resolvedErrorCopy: errorMessage,
        fallbackErrorCopy: errorMessages.fallback,
        draft,
        toolKeywords: TOOL_KEYWORDS,
        emailWorkflowStep: emailWorkflow.step,
        messages,
      }),
    [
      status,
      errorMessage,
      errorMessages.fallback,
      draft,
      emailWorkflow.step,
      messages,
    ],
  );

  const avatarState =
    status === "submitted" || status === "streaming"
      ? reactiveAvatarState
      : (forcedExpression ?? reactiveAvatarState);

  useEffect(() => {
    const hydrated = loadStoredMessages(greetingText);
    if (!hydrated) return;
    setMessages((current) => {
      if (
        current.length &&
        JSON.stringify(current) === JSON.stringify(hydrated)
      ) {
        return current;
      }
      return hydrated;
    });
  }, [greetingText, setMessages]);

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

  // Lenis smooth scroll captures wheel events globally; exclude the chat panel
  // and forward wheel from header/composer into the message scroller (CodeBlockWindow pattern).
  useEffect(() => {
    if (!isOpen) return;
    const panel = panelRef.current;
    const scroller = scrollerRef.current;
    if (!panel || !scroller) return;

    const onWheel = (event: WheelEvent) => {
      if (scroller.scrollHeight <= scroller.clientHeight + 1) {
        return;
      }

      if (scroller.contains(event.target as Node)) {
        return;
      }

      const { scrollTop, scrollHeight, clientHeight } = scroller;
      const maxScrollTop = scrollHeight - clientHeight;
      const deltaY = event.deltaY;
      const canScrollUp = scrollTop > 0;
      const canScrollDown = scrollTop < maxScrollTop - 1;

      if ((deltaY < 0 && canScrollUp) || (deltaY > 0 && canScrollDown)) {
        event.preventDefault();
        scroller.scrollTop = Math.min(
          maxScrollTop,
          Math.max(0, scrollTop + deltaY),
        );
      }
    };

    panel.addEventListener("wheel", onWheel, { passive: false });
    return () => panel.removeEventListener("wheel", onWheel);
  }, [isOpen, messages.length]);

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

  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      const panel = panelRef.current;
      if (!panel) return;
      const target = event.target as Node | null;
      if (target && panel.contains(target)) return;
      if (target && toggleButtonRef.current?.contains(target)) return;
      closeChat();
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen, closeChat]);

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
        const response = await fetch(RESEND_CONTACT_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: draft.fullName.trim(),
            email: draft.email.trim(),
            phone: draft.phone?.trim() || "",
            interest: draft.interest,
            message: draft.message.trim(),
          }),
        });
        if (!response.ok) {
          const { error } = await response.json().catch(() => ({}));
          throw new Error(error || "sendFailed");
        }
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
          aria-label={resolvedTitle}
          tabIndex={isOpen ? 0 : -1}
          data-lenis-prevent-wheel=""
        >
          <ChatHeader
            title={resolvedTitle}
            description={resolvedDescription}
            onMinimize={closeChat}
            avatarState={avatarState}
            enableIdleExpressions={avatarState === "idle"}
            trackMouse
            isSpeaking={status === "streaming"}
            enableSleepDetection
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
            onReset={handleReset}
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
// Helpers are exported inline at their declaration above (see generateId,
// toStoredMessages, parseStoredMessages, parseLegacyMessages, fromStoredMessages).
// ChatWidget/index.ts re-exports them so tests can import via @dt/ChatWidget.
