type ImportMetaEnv = {
  VITE_CONTACT_SPAM_LOG_ENDPOINT?: string;
  MODE?: string;
};

type ImportMetaWithEnv = ImportMeta & { env?: ImportMetaEnv };

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const CONTACT_ATTACHMENT_MAX_BYTES = 2 * 1024 * 1024;
export const CONTACT_EMAIL_ATTACHMENT_LIMIT_BYTES = 2 * 1024 * 1024;
export const CONTACT_ACCEPTED_ATTACHMENT_TYPES = ".pdf,.png,.jpg,.jpeg";

export const validateContactEmail = (email: string) => EMAIL_REGEX.test(email);

const getSpamLogEndpoint = (): string | null => {
  const nextEndpoint =
    typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_APP_CONTACT_SPAM_LOG_ENDPOINT
      : undefined;
  if (nextEndpoint?.trim()) return nextEndpoint.trim();

  const metaEnv =
    typeof import.meta !== "undefined"
      ? (import.meta as ImportMetaWithEnv).env
      : undefined;
  const viteEndpoint = metaEnv?.VITE_CONTACT_SPAM_LOG_ENDPOINT;
  return viteEndpoint?.trim() || null;
};

const isDevEnvironment = () => {
  if (typeof process !== "undefined" && process.env.NODE_ENV) {
    return process.env.NODE_ENV !== "production";
  }

  const metaEnv =
    typeof import.meta !== "undefined"
      ? (import.meta as ImportMetaWithEnv).env
      : undefined;
  if (metaEnv?.MODE) {
    return metaEnv.MODE !== "production";
  }

  return false;
};

export const reportContactHoneypot = (honeypotValue: string) => {
  const isDev = isDevEnvironment();
  if (isDev) {
    // Keep this noisy log in dev only to avoid exposing bot patterns in prod logs.
    // eslint-disable-next-line no-console
    console.warn("Honeypot triggered, dropping submission.");
  }

  const endpoint = getSpamLogEndpoint();
  if (!endpoint) {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.info(
        "Honeypot triggered but no spam log endpoint configured. Set NEXT_PUBLIC_APP_CONTACT_SPAM_LOG_ENDPOINT (or VITE_CONTACT_SPAM_LOG_ENDPOINT in Vite) to capture these events.",
      );
    }
    return;
  }

  const payload = {
    event: "contact-form-honeypot",
    submittedAt: new Date().toISOString(),
    honeypotValue,
    path:
      typeof window !== "undefined" ? window.location.pathname : "unknown",
    userAgent:
      typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
  };

  const body = JSON.stringify(payload);
  const canUseBeacon =
    typeof navigator !== "undefined" &&
    typeof navigator.sendBeacon === "function";

  if (canUseBeacon) {
    const success = navigator.sendBeacon(
      endpoint,
      new Blob([body], { type: "application/json" }),
    );
    if (success) {
      return;
    }
  }

  if (typeof fetch !== "function") {
    return;
  }

  fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch((err) => {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.error("Failed to log honeypot submission", err);
    }
  });
};
