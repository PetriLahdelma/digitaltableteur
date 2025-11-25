import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import styles from "./Documentation.module.css";

const APIIntegrationDocsContent = () => {
  return (
    <article className={styles.wrapper}>
      <header className={styles.header}>
        <h1>API Integration</h1>
        <p className={styles.lead}>
          Serverless function architecture on Vercel with streaming AI chat, MCP
          tool calling, and secure data endpoints.
        </p>
      </header>

      <section className={styles.section}>
        <h2>Overview</h2>
        <p>
          The application uses Vercel serverless functions for backend logic,
          eliminating the need for a traditional Node.js server. All API routes
          are deployed automatically and scale on-demand.
        </p>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Endpoint</th>
              <th>Runtime</th>
              <th>Purpose</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>/api/chat</code>
              </td>
              <td>Node.js</td>
              <td>AI chat with streaming, MCP tools</td>
            </tr>
            <tr>
              <td>
                <code>/app/api/chat/route</code>
              </td>
              <td>Edge</td>
              <td>Edge function version of chat (faster cold starts)</td>
            </tr>
            <tr>
              <td>
                <code>/api/save-contact</code>
              </td>
              <td>Node.js</td>
              <td>Contact form EmailJS integration</td>
            </tr>
            <tr>
              <td>
                <code>/api/download-cv</code>
              </td>
              <td>Node.js</td>
              <td>Password-protected resume download</td>
            </tr>
            <tr>
              <td>
                <code>/api/test-health/*</code>
              </td>
              <td>Node.js</td>
              <td>CI/CD observability metrics</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className={styles.section}>
        <h2>Chat API (/api/chat)</h2>
        <p>
          The primary AI chat endpoint uses the Vercel AI SDK with streaming
          responses and Model Context Protocol (MCP) tool integration.
        </p>

        <h3>Implementation</h3>
        <pre className={styles.code}>
          {`// api/chat.ts
import { streamText } from 'ai';
import { createCorsHeaders } from './chat-shared';
import { donnyTools } from './donny-tools';

export default async function handler(req, res) {
  // CORS handling
  const corsHeaders = createCorsHeaders();
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Extract messages from request
  const { messages } = req.body;

  try {
    const result = await streamText({
      model: aiGatewayProvider,
      messages,
      tools: donnyTools,
      system: systemPrompt,
    });

    // Stream response
    result.toDataStream().pipe(res);
  } catch (error) {
    // Normalized error handling
    res.status(500).json({ error: 'Internal server error' });
  }
}`}
        </pre>

        <h3>Request Format</h3>
        <pre className={styles.code}>
          {`POST /api/chat
Content-Type: application/json

{
  "messages": [
    {
      "role": "user",
      "content": "What are your opening hours?"
    }
  ]
}`}
        </pre>

        <h3>Response Format (Streaming)</h3>
        <pre className={styles.code}>
          {`data: {"type":"text","text":"Our opening hours are:"}
data: {"type":"tool_call","toolCallId":"call_123","toolName":"getOpenHours"}
data: {"type":"tool_result","toolCallId":"call_123","result":{"hours":"Mon-Fri 9-17"}}
data: {"type":"text","text":" Monday to Friday, 9 AM to 5 PM."}
data: [DONE]`}
        </pre>

        <h3>Client Integration</h3>
        <pre className={styles.code}>
          {`// ChatWidget.tsx
import { useChat } from 'ai/react';

function ChatWidget() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/chat',
    onError: (error) => {
      console.error('Chat error:', error);
    },
  });

  return (
    <form onSubmit={handleSubmit}>
      {messages.map(msg => (
        <div key={msg.id}>{msg.content}</div>
      ))}
      <input value={input} onChange={handleInputChange} />
    </form>
  );
}`}
        </pre>
      </section>

      <section className={styles.section}>
        <h2>MCP Tool Integration</h2>
        <p>
          Model Context Protocol (MCP) tools extend the AI assistant's
          capabilities with structured function calling.
        </p>

        <h3>Tool Definition</h3>
        <pre className={styles.code}>
          {`// api/donny-tools.ts
import { z } from 'zod';

export const donnyTools = {
  getOpenHours: {
    description: 'Get business opening hours',
    parameters: z.object({}),
    execute: async () => {
      return {
        hours: {
          monday: '09:00-17:00',
          tuesday: '09:00-17:00',
          // ...
        }
      };
    },
  },
  
  getServices: {
    description: 'Get available services',
    parameters: z.object({
      category: z.enum(['web', 'mobile', 'consulting']).optional(),
    }),
    execute: async ({ category }) => {
      // Fetch and return services
      return services.filter(s => !category || s.category === category);
    },
  },
};`}
        </pre>

        <h3>Tool Calling Flow</h3>
        <ol>
          <li>User message triggers AI decision to call tool</li>
          <li>
            AI SDK sends <code>tool_call</code> event with parameters
          </li>
          <li>Server executes tool function with validation</li>
          <li>
            Result streamed back as <code>tool_result</code> event
          </li>
          <li>AI incorporates result into response</li>
        </ol>

        <h3>Available Tools</h3>
        <ul>
          <li>
            <code>getOpenHours</code> - Business hours lookup
          </li>
          <li>
            <code>getServices</code> - Service catalog with filtering
          </li>
          <li>
            <code>getContact</code> - Contact information retrieval
          </li>
          <li>
            <code>searchProjects</code> - Portfolio search by keywords
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>Contact Form API (/api/save-contact)</h2>
        <p>
          Handles contact form submissions with EmailJS integration and MongoDB
          persistence.
        </p>

        <h3>Implementation</h3>
        <pre className={styles.code}>
          {`// api/save-contact.js
import emailjs from '@emailjs/nodejs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, message } = req.body;

  // Validation
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Send via EmailJS
    await emailjs.send(
      process.env.EMAILJS_SERVICE_ID,
      process.env.EMAILJS_TEMPLATE_ID,
      { name, email, message },
      { publicKey: process.env.EMAILJS_PUBLIC_KEY }
    );

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('EmailJS error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
}`}
        </pre>

        <h3>Request Format</h3>
        <pre className={styles.code}>
          {`POST /api/save-contact
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "I'm interested in your services..."
}`}
        </pre>

        <h3>Response Format</h3>
        <pre className={styles.code}>
          {`// Success
{
  "success": true
}

// Error
{
  "error": "Failed to send message"
}`}
        </pre>
      </section>

      <section className={styles.section}>
        <h2>Secure CV Download (/api/download-cv)</h2>
        <p>Password-protected resume download with server-side file serving.</p>

        <h3>Implementation</h3>
        <pre className={styles.code}>
          {`// api/download-cv.js
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { password } = req.body;

  // Verify password
  if (password !== process.env.CV_PASSWORD) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  // Serve file
  const filePath = path.join(process.cwd(), 'private', 'cv.pdf');
  const fileBuffer = fs.readFileSync(filePath);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="CV.pdf"');
  res.send(fileBuffer);
}`}
        </pre>

        <h3>Client Integration</h3>
        <pre className={styles.code}>
          {`// SecureCVDownload.tsx
async function handleDownload(password: string) {
  const response = await fetch('/api/download-cv', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });

  if (!response.ok) {
    throw new Error('Invalid password');
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'CV.pdf';
  a.click();
}`}
        </pre>
      </section>

      <section className={styles.section}>
        <h2>CORS Configuration</h2>
        <p>
          Cross-Origin Resource Sharing (CORS) is handled centrally for all API
          endpoints.
        </p>

        <h3>Implementation</h3>
        <pre className={styles.code}>
          {`// api/chat-shared.ts
export function createCorsHeaders(): Record<string, string> {
  const allowedOrigins = [
    'https://digitaltableteur.com',
    'https://www.digitaltableteur.com',
    'http://localhost:3000',
    'http://localhost:5173',
  ];

  return {
    'Access-Control-Allow-Origin': allowedOrigins.join(','),
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

// Usage in endpoints
export default async function handler(req, res) {
  const corsHeaders = createCorsHeaders();
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Handle request...
}`}
        </pre>
      </section>

      <section className={styles.section}>
        <h2>Error Handling</h2>
        <p>
          Normalized error responses across all API endpoints for consistent
          client error handling.
        </p>

        <h3>Error Format</h3>
        <pre className={styles.code}>
          {`{
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": { /* Optional additional context */ }
}`}
        </pre>

        <h3>Common Error Codes</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Status</th>
              <th>Code</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>400</td>
              <td>
                <code>VALIDATION_ERROR</code>
              </td>
              <td>Invalid request parameters</td>
            </tr>
            <tr>
              <td>401</td>
              <td>
                <code>UNAUTHORIZED</code>
              </td>
              <td>Missing or invalid authentication</td>
            </tr>
            <tr>
              <td>404</td>
              <td>
                <code>NOT_FOUND</code>
              </td>
              <td>Requested resource does not exist</td>
            </tr>
            <tr>
              <td>429</td>
              <td>
                <code>RATE_LIMIT</code>
              </td>
              <td>Too many requests</td>
            </tr>
            <tr>
              <td>500</td>
              <td>
                <code>INTERNAL_ERROR</code>
              </td>
              <td>Unexpected server error</td>
            </tr>
          </tbody>
        </table>

        <h3>Client Error Handling</h3>
        <pre className={styles.code}>
          {`async function callAPI(endpoint: string, data: any) {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }

    return await response.json();
  } catch (error) {
    console.error('API error:', error);
    // Show user-friendly error message
    throw error;
  }
}`}
        </pre>
      </section>

      <section className={styles.section}>
        <h2>Environment Variables</h2>
        <p>
          Required environment variables for API functionality. Set in{" "}
          <code>.env.local</code> for development and Vercel dashboard for
          production.
        </p>

        <h3>Development (.env.local)</h3>
        <pre className={styles.code}>
          {`# AI Chat
OPENAI_API_KEY=sk-...
AI_GATEWAY_URL=https://gateway.ai.cloudflare.com/...

# EmailJS
VITE_EMAILJS_SERVICE_ID=service_...
VITE_EMAILJS_TEMPLATE_ID=template_...
VITE_EMAILJS_PUBLIC_KEY=...

# Secure CV
CV_PASSWORD=your-secure-password

# Analytics
VITE_GA_ID=G-...`}
        </pre>

        <h3>Production (Vercel)</h3>
        <ol>
          <li>Navigate to project settings in Vercel dashboard</li>
          <li>Go to "Environment Variables" section</li>
          <li>
            Add each variable with appropriate scope (Production, Preview,
            Development)
          </li>
          <li>Redeploy to apply changes</li>
        </ol>
      </section>

      <section className={styles.section}>
        <h2>Testing API Endpoints</h2>
        <p>Test serverless functions locally and in production.</p>

        <h3>Local Testing with curl</h3>
        <pre className={styles.code}>
          {`# Test chat endpoint
curl -X POST http://localhost:3000/api/chat \\
  -H "Content-Type: application/json" \\
  -d '{"messages":[{"role":"user","content":"Hello"}]}'

# Test contact form
curl -X POST http://localhost:3000/api/save-contact \\
  -H "Content-Type: application/json" \\
  -d '{"name":"Test","email":"test@example.com","message":"Hello"}'

# Test CV download
curl -X POST http://localhost:3000/api/download-cv \\
  -H "Content-Type: application/json" \\
  -d '{"password":"your-password"}' \\
  --output cv.pdf`}
        </pre>

        <h3>Integration Tests</h3>
        <pre className={styles.code}>
          {`// tests/api/chat.test.ts
import { describe, it, expect } from 'vitest';

describe('Chat API', () => {
  it('should handle user messages', async () => {
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hello' }],
      }),
    });

    expect(response.ok).toBe(true);
    // Assert streaming response
  });

  it('should handle tool calls', async () => {
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'What are your hours?' }],
      }),
    });

    expect(response.ok).toBe(true);
    // Assert tool execution
  });
});`}
        </pre>
      </section>

      <section className={styles.section}>
        <h2>Performance Considerations</h2>
        <ul>
          <li>
            <strong>Edge Functions</strong>: Use Edge runtime for faster cold
            starts (chat API has both Node and Edge versions)
          </li>
          <li>
            <strong>Streaming</strong>: Implement streaming for long-running
            operations (AI responses) to improve perceived performance
          </li>
          <li>
            <strong>Caching</strong>: Cache static responses when appropriate
            (e.g., service listings, opening hours)
          </li>
          <li>
            <strong>Rate Limiting</strong>: Implement rate limiting to prevent
            abuse (Vercel provides built-in DDoS protection)
          </li>
          <li>
            <strong>Monitoring</strong>: Use Vercel Analytics and{" "}
            <code>/api/test-health</code> endpoints for observability
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>Security Best Practices</h2>
        <ul>
          <li>
            Never expose API keys in client-side code—use environment variables
          </li>
          <li>Validate all input parameters with Zod schemas</li>
          <li>Implement CORS properly to prevent unauthorized origins</li>
          <li>Use HTTPS only in production (enforced by Vercel)</li>
          <li>Sanitize user input before processing or storing</li>
          <li>Rotate credentials regularly (CV password, EmailJS keys)</li>
          <li>Monitor API usage for anomalies</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>Files & Configuration</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>File</th>
              <th>Purpose</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>api/chat.ts</code>
              </td>
              <td>Node.js chat API handler</td>
            </tr>
            <tr>
              <td>
                <code>app/api/chat/route.ts</code>
              </td>
              <td>Edge function chat handler</td>
            </tr>
            <tr>
              <td>
                <code>api/chat-shared.ts</code>
              </td>
              <td>Shared CORS and utilities</td>
            </tr>
            <tr>
              <td>
                <code>api/donny-tools.ts</code>
              </td>
              <td>MCP tool definitions</td>
            </tr>
            <tr>
              <td>
                <code>api/donny-context.js</code>
              </td>
              <td>System prompt and context</td>
            </tr>
            <tr>
              <td>
                <code>api/save-contact.js</code>
              </td>
              <td>Contact form handler</td>
            </tr>
            <tr>
              <td>
                <code>api/download-cv.js</code>
              </td>
              <td>Secure CV download</td>
            </tr>
            <tr>
              <td>
                <code>vercel.json</code>
              </td>
              <td>Vercel configuration</td>
            </tr>
          </tbody>
        </table>
      </section>
    </article>
  );
};

const meta: Meta = {
  title: "Docs/API Integration",
  parameters: {
    layout: "fullscreen",},
};

export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => <APIIntegrationDocsContent />,
};
