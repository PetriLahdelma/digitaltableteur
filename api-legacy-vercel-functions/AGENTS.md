# Serverless Functions - Quick Reference

## Package Identity

**Purpose**: Vercel serverless functions for secure operations  
**Technology**: Node.js, Vercel Functions

---

## Setup & Run

```bash
# Test locally with Vercel CLI
vercel dev

# Deploy
vercel --prod
```

---

## Patterns & Conventions

### File Structure

```
api-legacy-vercel-functions/
├── cors.js                  # CORS middleware (reusable)
├── chat.ts                  # AI chat endpoint
├── openai-chat.js           # OpenAI integration
├── save-contact.js          # Contact form handler
├── download-cv.js           # Secure CV download
├── donny-context.js         # Chat context/persona
└── donny-tools.ts           # Chat function calling tools
```

### Key Patterns

✅ **DO**: Use `cors.js` middleware for all endpoints

```javascript
// api/my-function.js
const cors = require("./cors");

module.exports = async (req, res) => {
  cors(res); // Set CORS headers

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Handle request
  const { data } = req.body;

  try {
    const result = await processData(data);
    return res.status(200).json({ success: true, result });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
```

✅ **DO**: Validate input before processing

```javascript
if (!req.body.email || !req.body.message) {
  return res.status(400).json({ error: "Missing required fields" });
}
```

✅ **DO**: Use environment variables for secrets

```javascript
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  return res.status(500).json({ error: "API key not configured" });
}
```

❌ **DON'T**: Hardcode API keys or secrets
❌ **DON'T**: Skip CORS headers (causes cross-origin errors)
❌ **DON'T**: Return sensitive error details to client

---

## Touch Points / Key Files

- **CORS middleware**: `api-legacy-vercel-functions/cors.js`
- **OpenAI chat**: `api-legacy-vercel-functions/openai-chat.js`
- **Contact form**: `api-legacy-vercel-functions/save-contact.js`
- **CV download**: `api-legacy-vercel-functions/download-cv.js`
- **Chat tools**: `api-legacy-vercel-functions/donny-tools.ts`

---

## JIT Index Hints

### Find Endpoints

```bash
# All function files
find api-legacy-vercel-functions -name "*.js" -o -name "*.ts"

# Exported handlers
rg -n "module.exports|export default" api-legacy-vercel-functions/
```

### Find Environment Variable Usage

```bash
rg -n "process.env" api-legacy-vercel-functions/
```

### Find CORS Usage

```bash
rg -n "cors\(" api-legacy-vercel-functions/
```

---

## Common Gotchas

- **CORS**: Always call `cors(res)` before returning response
- **Method validation**: Check `req.method` before processing
- **Error handling**: Catch errors and return 500 with user-friendly message
- **Environment variables**: Set in Vercel dashboard (not `.env.local`)
- **Response format**: Always return JSON with consistent structure

---

## Required Environment Variables

**Production (Vercel):**

- `OPENAI_API_KEY` → OpenAI chat functionality
- `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, `EMAILJS_PUBLIC_KEY` → Contact form
- `CV_PASSWORD` → Secure CV download validation

---

## Pre-Deploy Checks

```bash
# Test locally
vercel dev

# Check env vars are set
vercel env list

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

---

**See CORS reference: https://vercel.com/guides/how-to-enable-cors**
