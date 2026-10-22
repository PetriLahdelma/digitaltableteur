import type * as Sentry from "@sentry/nextjs";

type DataCollection = NonNullable<Parameters<typeof Sentry.init>[0]>["dataCollection"];

/*
 * Allowlists, not denylists: a header or query key nobody anticipated (a new
 * proxy's client-IP header, an email in a campaign URL) stays out by default.
 * Referer is left out because it can carry another site's URL.
 */
const REQUEST_HEADERS = { allow: ["accept", "accept-language", "content-type", "user-agent"] };
const RESPONSE_HEADERS = { allow: ["content-type"] };
/** The site's own query keys: pricing calculator, contact intent, work view. */
const QUERY_PARAMS = { allow: ["duration", "days", "mode", "package", "view"] };

/**
 * What Sentry may collect, shared by the client, server and edge configs.
 *
 * SDK v11 replaced `sendDefaultPii` with `dataCollection`, and its defaults
 * collect everything: user info and IP, cookies, headers, request and response
 * bodies, query strings, local variables and, for the chat, generative AI
 * prompts and replies. This starts from the v10 baseline in the migration
 * guide, narrows headers and query strings to allowlists and turns stack-frame
 * variables and queue arguments off, so nothing personal leaves the site
 * (GDPR, see the privacy policy).
 */
export const dataCollection: DataCollection = {
  userInfo: false,
  cookies: false,
  httpHeaders: { request: REQUEST_HEADERS, response: RESPONSE_HEADERS },
  httpBodies: [],
  urlQueryParams: QUERY_PARAMS,
  genAI: { inputs: false, outputs: false },
  databaseQueryData: false,
  graphQL: { document: false, variables: false },
  queues: false,
  stackFrameVariables: false,
};
