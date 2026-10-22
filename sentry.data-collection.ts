import type * as Sentry from "@sentry/nextjs";

type DataCollection = NonNullable<Parameters<typeof Sentry.init>[0]>["dataCollection"];

/** Header and query keys that identify a person or their network location. */
const IDENTIFYING_KEYS = { deny: ["forwarded", "-ip", "remote-", "via", "-user"] };

/**
 * What Sentry may collect, shared by the client, server and edge configs.
 *
 * SDK v11 replaced `sendDefaultPii` with `dataCollection`, and its defaults
 * collect everything: user info and IP, cookies, headers, request and response
 * bodies, query strings, local variables and, for the chat, generative AI
 * prompts and replies. This is the v10 baseline from the migration guide, plus
 * stack-frame variables and queue arguments off, so nothing personal leaves
 * the site (GDPR, see the privacy policy).
 */
export const dataCollection: DataCollection = {
  userInfo: false,
  cookies: false,
  httpHeaders: { request: IDENTIFYING_KEYS, response: IDENTIFYING_KEYS },
  httpBodies: [],
  urlQueryParams: IDENTIFYING_KEYS,
  genAI: { inputs: false, outputs: false },
  databaseQueryData: false,
  graphQL: { document: false, variables: false },
  queues: false,
  stackFrameVariables: false,
};
