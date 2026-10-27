import { escapeHTML } from "../../sanitize";
import type { IntakeLocale } from "../types";
import { MAIL_LOGO } from "./mail-logo";

/**
 * The HTML layout shared by every intake email. Mail clients ignore stylesheets
 * and CSS variables, so the design tokens are copied in as literal values
 * (nextjs-app/shared/styles/variables.css) and every style is inline; the only
 * <style> block adds dark mode and phone padding where clients support them.
 * Nothing loads from a server: the brand mark is an inline attachment
 * (MAIL_LOGO), there are no tracking pixels and no remote fonts.
 */

const COLOR = {
  primary: "#041b23", // --color-primary
  muted: "#626a72", // --color-muted
  page: "#f5f6f6", // field surface
  card: "#ffffff", // --color-white
  border: "#e3e6e7",
  codeSurface: "#f5f6f6",
} as const;

const FONT = "Satoshi,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const MONO = "ui-monospace,'SF Mono',Menlo,Consolas,'Roboto Mono',monospace";

export type MailBlock =
  | { kind: "heading"; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "note"; text: string }
  | { kind: "code"; label: string; code: string }
  | { kind: "button"; label: string; href: string; fallback: string }
  | { kind: "signature"; text: string }
  /** A part's title over its sections of question and answer pairs (the owner's copy of a submission). */
  | { kind: "answers"; title: string; sections: ReadonlyArray<{ title: string; rows: ReadonlyArray<{ label: string; value: string }> }> };

/** The plain-text alternative of one block, the same words as its HTML. */
export function mailBlockText(item: MailBlock): string {
  switch (item.kind) {
    case "code":
      return `${item.label}: ${item.code}`;
    case "button":
      return `${item.label}:\n${item.href}`;
    case "answers":
      return [
        item.title.toLocaleUpperCase(),
        // Label on its own line: questions already end in "?" or ".".
        ...item.sections.map((section) => [`## ${section.title}`, ...section.rows.map((row) => `${row.label}\n${row.value}`)].join("\n\n")),
      ].join("\n\n");
    default:
      return item.text;
  }
}

const lines = (text: string) => escapeHTML(text).replace(/\n/g, "<br />");

function block(item: MailBlock): string {
  switch (item.kind) {
    case "heading":
      return `<h1 class="dt-text" style="margin:0 0 16px 0;font-family:${FONT};font-size:26px;line-height:1.25;font-weight:600;color:${COLOR.primary};">${escapeHTML(item.text)}</h1>`;
    case "paragraph":
      return `<p class="dt-text" style="margin:0 0 24px 0;font-family:${FONT};font-size:16px;line-height:1.6;color:${COLOR.primary};">${lines(item.text)}</p>`;
    case "note":
      return `<p class="dt-muted" style="margin:0 0 24px 0;font-family:${FONT};font-size:14px;line-height:1.6;color:${COLOR.muted};">${lines(item.text)}</p>`;
    case "code":
      // One unbroken run of digits: copying it pastes exactly what the sign-in field accepts.
      return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 24px 0;">
  <tr>
    <td class="dt-code" style="padding:20px 24px;background-color:${COLOR.codeSurface};border:1px solid ${COLOR.border};border-radius:12px;">
      <p class="dt-muted" style="margin:0 0 6px 0;font-family:${FONT};font-size:13px;line-height:1.4;color:${COLOR.muted};">${escapeHTML(item.label)}</p>
      <p class="dt-text" style="margin:0;font-family:${MONO};font-size:34px;line-height:1.2;font-weight:600;letter-spacing:0.16em;color:${COLOR.primary};">${escapeHTML(item.code)}</p>
    </td>
  </tr>
</table>`;
    case "button":
      return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 16px 0;">
  <tr>
    <td class="dt-button" style="border-radius:8px;background-color:${COLOR.primary};">
      <a class="dt-button-link" href="${escapeHTML(item.href)}" style="display:inline-block;padding:14px 24px;font-family:${FONT};font-size:16px;line-height:1.2;font-weight:500;color:#ffffff;text-decoration:none;border-radius:8px;">${escapeHTML(item.label)}</a>
    </td>
  </tr>
</table>
<p class="dt-muted" style="margin:0 0 24px 0;font-family:${FONT};font-size:13px;line-height:1.6;color:${COLOR.muted};">${escapeHTML(item.fallback)}<br /><a class="dt-link" href="${escapeHTML(item.href)}" style="color:${COLOR.primary};text-decoration:underline;word-break:break-all;">${escapeHTML(item.href)}</a></p>`;
    case "answers": {
      const sections = item.sections
        .map((section) => {
          const rows = section.rows
            .map(
              (row) => `  <tr>
    <td class="dt-rule" style="padding:10px 0;border-top:1px solid ${COLOR.border};">
      <p class="dt-muted" style="margin:0 0 4px 0;font-family:${FONT};font-size:13px;line-height:1.4;color:${COLOR.muted};">${escapeHTML(row.label)}</p>
      <p class="dt-text" style="margin:0;font-family:${FONT};font-size:15px;line-height:1.5;color:${COLOR.primary};">${lines(row.value)}</p>
    </td>
  </tr>`,
            )
            .join("\n");
          return `<p class="dt-text" style="margin:16px 0 4px 0;font-family:${FONT};font-size:15px;line-height:1.4;font-weight:600;color:${COLOR.primary};">${escapeHTML(section.title)}</p>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 8px 0;">
${rows}
</table>`;
        })
        .join("\n");
      return `<h2 class="dt-text" style="margin:24px 0 4px 0;font-family:${FONT};font-size:20px;line-height:1.3;font-weight:600;color:${COLOR.primary};">${escapeHTML(item.title)}</h2>
${sections}`;
    }
    case "signature":
      return `<p class="dt-text" style="margin:8px 0 0 0;font-family:${FONT};font-size:16px;line-height:1.6;color:${COLOR.primary};">${lines(item.text)}</p>`;
  }
}

export function renderMailHtml(input: {
  locale: IntakeLocale;
  title: string;
  preheader: string;
  brand: string;
  blocks: MailBlock[];
  footer: string[];
}): string {
  const footer = input.footer
    .map(
      (text) =>
        `<p class="dt-muted" style="margin:0 0 8px 0;font-family:${FONT};font-size:13px;line-height:1.6;color:${COLOR.muted};">${lines(text)}</p>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="${input.locale}">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light dark" />
    <meta name="supported-color-schemes" content="light dark" />
    <title>${escapeHTML(input.title)}</title>
    <style>
      @media (max-width: 600px) {
        .dt-card-cell { padding: 32px 24px !important; }
        .dt-outer { padding: 16px 8px !important; }
      }
      @media (prefers-color-scheme: dark) {
        .dt-page, .dt-outer { background-color: #101416 !important; }
        .dt-card { background-color: #181a1b !important; border-color: #2a2f31 !important; }
        .dt-text, .dt-link { color: #f2f4f4 !important; }
        .dt-muted { color: #a3abb0 !important; }
        .dt-code { background-color: #23272a !important; border-color: #2a2f31 !important; }
        .dt-button { background-color: #f2f4f4 !important; }
        .dt-button-link { color: #041b23 !important; }
        .dt-rule { border-color: #2a2f31 !important; }
      }
    </style>
  </head>
  <body class="dt-page" style="margin:0;padding:0;background-color:${COLOR.page};">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">${escapeHTML(input.preheader)}</div>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" class="dt-outer" style="background-color:${COLOR.page};">
      <tr>
        <td align="center" class="dt-outer" style="padding:40px 16px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" class="dt-card" style="max-width:560px;background-color:${COLOR.card};border:1px solid ${COLOR.border};border-radius:16px;">
            <tr>
              <td class="dt-card-cell" style="padding:40px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 32px 0;">
                  <tr>
                    <td style="padding:0 10px 0 0;vertical-align:middle;">
                      <img src="cid:${MAIL_LOGO.contentId}" width="32" height="32" alt="" style="display:block;border:0;width:32px;height:32px;" />
                    </td>
                    <td class="dt-text" style="vertical-align:middle;font-family:${FONT};font-size:18px;line-height:1;font-weight:700;letter-spacing:-0.01em;color:${COLOR.primary};">${escapeHTML(input.brand)}</td>
                  </tr>
                </table>
                ${input.blocks.map(block).join("\n                ")}
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:8px 0 0 0;">
                  <tr>
                    <td class="dt-rule" style="padding:24px 0 0 0;border-top:1px solid ${COLOR.border};">${footer}</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
