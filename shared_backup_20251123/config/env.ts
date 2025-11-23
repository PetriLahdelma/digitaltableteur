// Shared environment adapter for Vite (import.meta.env) and Next.js (process.env).
// Always access environment variables through this module to avoid framework-specific APIs.

const isVite =
  typeof import.meta !== "undefined" && typeof (import.meta as any).env !== "undefined";

const env = isVite ? (import.meta as any).env : process.env;

export const ENV = {
  SENTRY_DSN: env?.VITE_SENTRY_DSN ?? env?.NEXT_PUBLIC_SENTRY_DSN,
  EMAILJS_SERVICE_ID: env?.VITE_EMAIL_SERVICE_ID ?? env?.NEXT_PUBLIC_EMAIL_SERVICE_ID,
  EMAILJS_TEMPLATE_ID: env?.VITE_EMAIL_TEMPLATE_ID ?? env?.NEXT_PUBLIC_EMAIL_TEMPLATE_ID,
  EMAILJS_PUBLIC_KEY: env?.VITE_EMAIL_PUBLIC_KEY ?? env?.NEXT_PUBLIC_EMAIL_PUBLIC_KEY,
  GA_ID: env?.VITE_GA_ID ?? env?.NEXT_PUBLIC_GA_ID,
  DONNY_CHAT_ENDPOINT: env?.VITE_DONNY_CHAT_ENDPOINT ?? env?.NEXT_PUBLIC_DONNY_CHAT_ENDPOINT,
  OPENAI_API_KEY: env?.OPENAI_API_KEY ?? env?.NEXT_PUBLIC_OPENAI_API_KEY,
};

export type EnvShape = typeof ENV;
