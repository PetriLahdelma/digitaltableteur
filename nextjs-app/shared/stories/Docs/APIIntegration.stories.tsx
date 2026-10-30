import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import Code from "@dt/Code";
import CodeBlock from "@dt/CodeBlock";
import {
  GuideCodeList,
  GuideList,
  GuidePage,
  GuideSection,
  GuideSteps,
  GuideTable,
} from "../../../../.storybook/blocks/guide/GuidePage";

const code = (value: string) => <Code size="inherit">{value}</Code>;

/**
 * Site API reference. The design system itself has no server code; these
 * are the Next.js route handlers its components talk to (Donny, the contact
 * form, intake), kept here so component docs can point at one place.
 */
const APIIntegrationDocsContent = () => (
  <GuidePage
    kicker="Reference"
    title="API integration"
    lede="The site's server side is a set of Next.js route handlers under app/api. The design system has no server code of its own; this page covers the endpoints its components call and the rules every handler follows."
  >
    <GuideSection
      title="Rules for every handler"
      intro="These hold for every route. The details live in app/api/AGENTS.md."
    >
      <GuideList
        items={[
          "Validate the request with Zod before any side effect, and answer 400 with a short message when it fails.",
          "Rate-limit every public POST, and answer 429 with a Retry-After header when the limit is hit.",
          "Sanitise anything that reaches MongoDB or HTML.",
          "Never return a stack trace, a secret or someone else's data. Log no personal data in plain text.",
          "Secrets are server-only environment variables, without the NEXT_PUBLIC_ prefix.",
        ]}
      />
    </GuideSection>

    <GuideSection
      title="Endpoints"
      intro="Grouped by what calls them. Intake routes sit behind passkey or emailed-code sessions."
    >
      <GuideTable
        caption="Site API endpoints"
        columns={["Route", "Method", "Called by"]}
        rows={[
          [
            code("/api/chat"),
            "POST",
            "ChatWidget (Donny), streaming replies with tool calls",
          ],
          [
            code("/api/contact"),
            "POST",
            "ContactForm and ContactFormEditorial",
          ],
          [
            code("/api/download-cv"),
            "POST",
            "SecureCVDownload, behind a password",
          ],
          [
            code("/api/gdpr/delete-data"),
            "GET, POST",
            "The data deletion page: request and status",
          ],
          [
            code("/api/gdpr/delete-data/confirm"),
            "POST",
            "The confirmation link in the deletion email",
          ],
          [
            code("/mcp"),
            "MCP",
            "External agents: design-system and consulting tools over HTTP",
          ],
          [
            code("/api/intake/auth/*"),
            "POST",
            "Client intake sign-in: invite link, email, code, sign-out",
          ],
          [
            code("/api/intake/forms/[inviteId]/*"),
            "PUT, POST",
            "Intake autosave (draft) and submit",
          ],
          [
            code("/api/intake/admin/*"),
            "GET, POST",
            "The intake admin: passkeys, invites, submissions and PDFs",
          ],
          [
            code("/api/test-health/runs"),
            "GET, POST",
            "Recording and reading test runs",
          ],
          [code("/api/cron/*"), "GET", "Scheduled jobs on Vercel"],
        ]}
      />
    </GuideSection>

    <GuideSection
      title="Chat"
      intro="Donny's endpoint streams with the Vercel AI SDK. The client sends the whole conversation as UI messages; the server trims the history, applies prompt-injection guards and lets the model call the site's tools."
    >
      <GuideSteps
        steps={[
          {
            title: "Client sends",
            body: "ChatWidget posts the UI messages through the AI SDK's useChat transport.",
          },
          {
            title: "Server checks",
            body: "The body is normalised, the rate limit is checked and the history is trimmed to fit.",
          },
          {
            title: "Model streams",
            body: "streamText runs with the scoped Donny tools and streams text and tool results back.",
          },
        ]}
      />
      <CodeBlock
        language="ts"
        copyable
        code={`// Request
POST /api/chat
{ "messages": UIMessage[] }

// Response: a UI message stream (text, tool calls and tool results)
// 429 with Retry-After when rate-limited`}
      />
    </GuideSection>

    <GuideSection
      title="Contact"
      intro="The contact form posts JSON. Only name, email and message are required; the rest are optional profile fields. Valid submissions are stored and emailed to the studio."
    >
      <GuideTable
        caption="Contact request fields"
        columns={["Field", "Rule"]}
        rows={[
          [code("name"), "Required, 2 to 200 characters"],
          [code("email"), "Required, a valid address"],
          [code("message"), "Required, 5 to 5,000 characters"],
          [
            <GuideCodeList key="phone interest budget timeline" names="phone interest budget timeline" />,
            "Optional, short text",
          ],
          [
            <GuideCodeList key="attachmentName attachmentType attachment" names="attachmentName attachmentType attachment" />,
            "Optional, one file as base64 within the size limit",
          ],
          [
            code("submissionId"),
            "Optional UUID, so a retry does not create a duplicate",
          ],
        ]}
      />
    </GuideSection>

    <GuideSection title="Calling an endpoint from a component">
      <CodeBlock
        language="tsx"
        copyable
        code={`const response = await fetch("/api/contact", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name, email, message }),
});

if (response.status === 429) {
  // Show the retry time from the Retry-After header.
}
if (!response.ok) {
  const { error } = await response.json();
  // Show error in the form's AlertBanner.
}`}
      />
    </GuideSection>

    <GuideSection title="Tests">
      <GuideList
        items={[
          <>
            Handler tests, such as {code("app/api/contact/route.test.ts")}, run
            with {code("npm test")}.
          </>,
          <>
            {code("npm run test:security")} runs the prompt-injection and abuse
            cases for chat.
          </>,
        ]}
      />
    </GuideSection>
  </GuidePage>
);

const meta: Meta = {
  title: "Docs/API integration",
  parameters: {
    layout: "fullscreen",
    wip: { disabled: true },
    vitest: {
      skip: true, // Documentation page; no behaviour to test.
    },
  },
};

export default meta;

type Story = StoryObj;

export const Default: Story = { render: () => <APIIntegrationDocsContent /> };
