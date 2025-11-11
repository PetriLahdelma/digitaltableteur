import { createCorsHeaders } from "./chat-shared";

const extractOrigin = (originHeader) => {
  if (Array.isArray(originHeader)) {
    return originHeader[0] ?? null;
  }
  return originHeader ?? null;
};

const applyHeaders = (res, headers) => {
  Object.entries(headers).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
};

export default function handleCors(req, res) {
  const origin = extractOrigin(req?.headers?.origin);
  const corsHeaders = createCorsHeaders(origin);

  if (res && typeof res.setHeader === "function") {
    applyHeaders(res, corsHeaders);
  }

  if (req?.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return true;
  }

  return false;
}
