import type { IntakeDb } from "../db/client";
import type { DataKeyring } from "../security/keys";

/** An email the intake sends. Bodies carry names, links and codes, never answers. */
export type IntakeMail = Readonly<{
  to: string;
  subject: string;
  /** Plain-text alternative, the same words as the HTML. */
  text: string;
  /** Branded HTML (service/mail-html.ts); the brand mark rides along as an inline attachment. */
  html: string;
}>;

export type Mailer = Readonly<{ send: (mail: IntakeMail) => Promise<void> }>;

/**
 * Everything an intake service needs, passed in rather than read from
 * globals, so tests run the real services on PGlite with fixed time.
 */
export type IntakeContext = Readonly<{
  db: IntakeDb;
  ring: DataKeyring;
  hmacKey: Buffer;
  /** Absolute origin for links in emails, e.g. https://www.digitaltableteur.com */
  origin: string;
  now: () => Date;
}>;

export type Tx = Parameters<Parameters<IntakeDb["transaction"]>[0]>[0];

export const MINUTE = 60 * 1000;
export const HOUR = 60 * MINUTE;
