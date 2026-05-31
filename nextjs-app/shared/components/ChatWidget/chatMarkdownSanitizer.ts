import type { ProcessedPart } from "./messageProcessor";

const MARKDOWN_IMAGE = /!\[[^\]]*]\([^)]*\)/g;
const MARKDOWN_IMAGE_LINE = /^\s*!\[[^\]]*]\([^)]*\)\s*$/gm;
const HEADING_LINE = /^#{1,6}\s+.+$/gm;

const REDUNDANT_SECTION_HEADINGS =
  /^(#{1,6}\s+)?(notable case studies|case studies|relevant projects|service packages|pricing packages|recommended package(s)?|projects we've worked on)\s*:?\s*$/gim;

const REDUNDANT_INTRO_LINES =
  /^(here are some relevant projects.*|here are (the )?(relevant )?case studies.*|the following (projects|case studies).*):?\s*$/gim;

/**
 * Strip markdown the model should not emit when tool UI renders cards
 * (broken remote images, duplicate section headings, etc.).
 */
export function sanitizeAssistantChatMarkdown(
  content: string,
  toolParts: ProcessedPart[],
): string {
  const hasProjectCards = toolParts.some(
    (part) =>
      part.kind === "component" &&
      (part.name === "ProjectCards" || part.name === "ServicePackageCards"),
  );

  let sanitized = content
    .replace(MARKDOWN_IMAGE, "")
    .replace(MARKDOWN_IMAGE_LINE, "")
    .trim();

  if (hasProjectCards) {
    sanitized = sanitized
      .replace(REDUNDANT_SECTION_HEADINGS, "")
      .replace(REDUNDANT_INTRO_LINES, "")
      .replace(HEADING_LINE, (line) => {
        const text = line.replace(/^#{1,6}\s+/, "").trim().toLowerCase();
        if (
          text.includes("case stud") ||
          text.includes("service package") ||
          text.includes("notable project") ||
          text.includes("relevant project")
        ) {
          return "";
        }
        return line;
      });
  }

  return sanitized
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
