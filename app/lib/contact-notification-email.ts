import { escapeHTML } from "./sanitize";

export type ContactNotificationPayload = {
  name: string;
  email: string;
  phone?: string | null;
  interest?: string | null;
  message: string;
  hearAbout?: string | null;
  budget?: string | null;
  timeline?: string | null;
  inspiration?: string | null;
  time?: string | null;
  attachmentName?: string | null;
  attachmentType?: string | null;
  attachmentData?: string | null;
  attachmentSize?: number | null;
  attachmentNotice?: string | null;
  requestPortfolioMaterials?: boolean | null;
};

const FONT =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const BRAND = "#041b23";
const ACCENT = "#b8ff00";
const MUTED = "#5c6b70";
const BORDER = "#e2e8ea";
const SURFACE = "#f7f9fa";

const BUDGET_LABELS: Record<string, string> = {
  "under-5k": "Under 5k€",
  "5k-15k": "5k€ – 15k€",
  "15k-50k": "15k€ – 50k€",
  "50k-plus": "50k€+",
  "not-sure": "Not sure yet",
};

const TIMELINE_LABELS: Record<string, string> = {
  asap: "ASAP",
  "1-2-months": "1–2 months",
  "3-6-months": "3–6 months",
  flexible: "Flexible",
};

const HEAR_ABOUT_LABELS: Record<string, string> = {
  "social-media": "Social media",
  "search-engine": "Search engine",
  "word-of-mouth": "Word of mouth",
  event: "Event or conference",
  "existing-client": "Existing client",
  other: "Other",
};

function humanizeSlug(value: string): string {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatSelectValue(
  value: string | null | undefined,
  labels: Record<string, string>,
): string | null {
  if (!value?.trim()) return null;
  const trimmed = value.trim();
  return labels[trimmed] ?? humanizeSlug(trimmed);
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatAttachmentDisplayName(name: string): string {
  const trimmed = name.trim();
  const extMatch = trimmed.match(/\.([a-z0-9]+)$/i);
  const ext = extMatch?.[1]?.toUpperCase() ?? "FILE";

  if (/^ig_[a-f0-9]+\.(png|jpe?g|gif|webp)$/i.test(trimmed)) {
    return `Uploaded image · ${ext}`;
  }

  if (trimmed.length > 42) {
    const extension = extMatch?.[0] ?? "";
    return `${trimmed.slice(0, 28)}…${extension}`;
  }

  return trimmed;
}

function splitInterest(value: string | null | undefined): string[] {
  if (!value?.trim()) return [];
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

type TextField = { label: string; value: string };

function buildTextFields(payload: ContactNotificationPayload): TextField[] {
  const fields: TextField[] = [
    { label: "Name", value: payload.name },
    { label: "Email", value: payload.email },
  ];

  if (payload.phone?.trim()) {
    fields.push({ label: "Phone", value: payload.phone.trim() });
  }
  if (payload.interest?.trim()) {
    fields.push({ label: "Project type", value: payload.interest.trim() });
  }

  const budget = formatSelectValue(payload.budget, BUDGET_LABELS);
  if (budget) fields.push({ label: "Budget", value: budget });

  const timeline = formatSelectValue(payload.timeline, TIMELINE_LABELS);
  if (timeline) fields.push({ label: "Timeline", value: timeline });

  const hearAbout = formatSelectValue(payload.hearAbout, HEAR_ABOUT_LABELS);
  if (hearAbout) fields.push({ label: "Source", value: hearAbout });

  if (payload.inspiration?.trim()) {
    fields.push({ label: "References", value: payload.inspiration.trim() });
  }
  if (payload.requestPortfolioMaterials) {
    fields.push({
      label: "Follow-up",
      value: "Resume, references, or portfolio requested",
    });
  }
  if (payload.time?.trim()) {
    fields.push({ label: "Submitted", value: payload.time.trim() });
  }
  if (payload.attachmentName?.trim()) {
    const size =
      typeof payload.attachmentSize === "number"
        ? formatBytes(payload.attachmentSize)
        : null;
    const type = payload.attachmentType?.split("/").pop()?.toUpperCase();
    fields.push({
      label: "Attachment",
      value: [
        formatAttachmentDisplayName(payload.attachmentName),
        size,
        type,
      ]
        .filter(Boolean)
        .join(" · "),
    });
  }
  if (payload.attachmentNotice?.trim()) {
    fields.push({
      label: "Attachment note",
      value: payload.attachmentNotice.trim(),
    });
  }

  return fields;
}

export function buildContactNotificationSubject(
  payload: ContactNotificationPayload,
): string {
  const leadInterest = payload.interest?.split(",")[0]?.trim();
  const portfolioFlag = payload.requestPortfolioMaterials
    ? "Portfolio follow-up · "
    : "";
  return leadInterest
    ? `${portfolioFlag}Contact inquiry · ${payload.name} · ${leadInterest}`
    : `${portfolioFlag}Contact inquiry · ${payload.name}`;
}

export function buildContactNotificationText(
  payload: ContactNotificationPayload,
): string {
  const lines = buildTextFields(payload).map(
    ({ label, value }) => `${label}: ${value}`,
  );
  return [...lines, "", "Message:", payload.message].join("\n");
}

function renderPill(label: string): string {
  return `<span style="display:inline-block;margin:0 6px 6px 0;padding:6px 12px;border:1px solid ${BORDER};border-radius:999px;background:${SURFACE};font-family:${FONT};font-size:13px;line-height:1.3;font-weight:500;color:${BRAND};">${escapeHTML(label)}</span>`;
}

function renderMetric(label: string, value: string, isLast = false): string {
  const width = isLast ? "34%" : "33%";
  return `
    <td width="${width}" style="padding:12px 10px;vertical-align:top;text-align:center;${isLast ? "" : `border-right:1px solid ${BORDER};`}">
      <p style="margin:0 0 4px 0;font-family:${FONT};font-size:10px;line-height:1.3;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${MUTED};">
        ${escapeHTML(label)}
      </p>
      <p style="margin:0;font-family:${FONT};font-size:14px;line-height:1.35;font-weight:600;color:${BRAND};">
        ${escapeHTML(value)}
      </p>
    </td>`;
}

function renderSection(title: string, bodyHtml: string): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:20px;">
      <tr>
        <td style="padding-bottom:8px;font-family:${FONT};font-size:11px;line-height:1.3;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${MUTED};">
          ${escapeHTML(title)}
        </td>
      </tr>
      <tr>
        <td style="font-family:${FONT};font-size:15px;line-height:1.55;color:${BRAND};">
          ${bodyHtml}
        </td>
      </tr>
    </table>`;
}

function renderAttachmentCard(
  name: string,
  size: number | null | undefined,
  type: string | null | undefined,
): string {
  const displayName = formatAttachmentDisplayName(name);
  const sizeLabel = typeof size === "number" ? formatBytes(size) : null;
  const typeLabel = type?.split("/").pop()?.toUpperCase() ?? null;

  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:20px;border:1px solid ${BORDER};border-radius:10px;background:${SURFACE};">
      <tr>
        <td style="padding:14px 16px;">
          <p style="margin:0 0 6px 0;font-family:${FONT};font-size:11px;line-height:1.3;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${MUTED};">
            Attachment included
          </p>
          <p style="margin:0 0 4px 0;font-family:${FONT};font-size:15px;line-height:1.4;font-weight:600;color:${BRAND};">
            ${escapeHTML(displayName)}
          </p>
          <p style="margin:0;font-family:${FONT};font-size:12px;line-height:1.4;color:${MUTED};">
            ${escapeHTML([sizeLabel, typeLabel].filter(Boolean).join(" · ") || "See attached file")}
          </p>
        </td>
      </tr>
    </table>`;
}

export function buildContactNotificationHtml(
  payload: ContactNotificationPayload,
): string {
  const budget = formatSelectValue(payload.budget, BUDGET_LABELS);
  const timeline = formatSelectValue(payload.timeline, TIMELINE_LABELS);
  const source = formatSelectValue(payload.hearAbout, HEAR_ABOUT_LABELS);
  const interests = splitInterest(payload.interest);
  const messageHtml = escapeHTML(payload.message).replace(/\n/g, "<br />");
  const mailto = `mailto:${encodeURIComponent(payload.email)}`;

  const metricItems = [
    budget ? { label: "Budget", value: budget } : null,
    timeline ? { label: "Timeline", value: timeline } : null,
    source ? { label: "Source", value: source } : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  const metricsRow =
    metricItems.length > 0
      ? `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:24px;border:1px solid ${BORDER};border-radius:10px;overflow:hidden;background:#ffffff;">
      <tr>
        ${metricItems
          .map((metric, index) =>
            renderMetric(
              metric.label,
              metric.value,
              index === metricItems.length - 1,
            ),
          )
          .join("")}
      </tr>
    </table>`
      : "";

  const projectSection =
    interests.length > 0
      ? renderSection("Project type", interests.map(renderPill).join(""))
      : "";

  const referencesSection = payload.inspiration?.trim()
    ? renderSection("References", escapeHTML(payload.inspiration.trim()))
    : "";

  const phoneSection = payload.phone?.trim()
    ? renderSection("Phone", escapeHTML(payload.phone.trim()))
    : "";

  const attachmentSection =
    payload.attachmentName?.trim()
      ? renderAttachmentCard(
          payload.attachmentName,
          payload.attachmentSize,
          payload.attachmentType,
        )
      : "";

  const attachmentNoticeSection = payload.attachmentNotice?.trim()
    ? renderSection("Attachment note", escapeHTML(payload.attachmentNotice.trim()))
    : "";

  const submittedLine = payload.time?.trim()
    ? `<p style="margin:8px 0 0 0;font-family:${FONT};font-size:13px;line-height:1.4;color:rgba(255,255,255,0.72);">${escapeHTML(payload.time.trim())}</p>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHTML(buildContactNotificationSubject(payload))}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#eef1f2;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#eef1f2;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:580px;background-color:#ffffff;border:1px solid #d6dee1;border-radius:14px;overflow:hidden;">
            <tr>
              <td style="padding:28px 28px 24px 28px;background-color:${BRAND};font-family:${FONT};">
                <p style="margin:0 0 10px 0;font-size:11px;line-height:1.4;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${ACCENT};">
                  digitaltableteur
                </p>
                <p style="margin:0 0 4px 0;font-size:13px;line-height:1.4;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:rgba(255,255,255,0.64);">
                  New contact inquiry
                </p>
                <h1 style="margin:0;font-size:28px;line-height:1.2;font-weight:600;color:#ffffff;">
                  ${escapeHTML(payload.name)}
                </h1>
                <p style="margin:10px 0 0 0;font-size:15px;line-height:1.4;">
                  <a href="${escapeHTML(mailto)}" style="color:#ffffff;text-decoration:underline;">${escapeHTML(payload.email)}</a>
                </p>
                ${submittedLine}
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                ${metricsRow}
                ${projectSection}
                ${phoneSection}
                ${referencesSection}
                ${attachmentSection}
                ${attachmentNoticeSection}
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:24px;">
                  <tr>
                    <td style="padding:18px 20px;background-color:${SURFACE};border:1px solid ${BORDER};border-left:4px solid ${ACCENT};border-radius:10px;font-family:${FONT};font-size:16px;line-height:1.65;color:${BRAND};">
                      <p style="margin:0 0 10px 0;font-size:11px;line-height:1.3;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${MUTED};">
                        Message
                      </p>
                      <p style="margin:0;">${messageHtml}</p>
                    </td>
                  </tr>
                </table>
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td align="center" style="padding-top:4px;">
                      <a href="${escapeHTML(mailto)}" style="display:inline-block;padding:14px 28px;border-radius:999px;background-color:${BRAND};font-family:${FONT};font-size:15px;line-height:1.3;font-weight:600;color:#ffffff;text-decoration:none;">
                        Reply to ${escapeHTML(payload.name.split(" ")[0] || payload.name)}
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:0 28px 24px 28px;font-family:${FONT};font-size:12px;line-height:1.5;color:${MUTED};">
                digitaltableteur.com · contact form notification
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
