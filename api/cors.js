const allowedOrigins = [
  "https://digitaltableteur.com",
  "https://www.digitaltableteur.com",
  "http://localhost:5173",
  "http://localhost:3000",
];

const privateRange =
  /^(192\.168|10\.|172\.(1[6-9]|2[0-9]|3[0-1]))(\.\d{1,3}){2}$/;

const isDevOrigin = (origin) => {
  if (!origin) return false;
  try {
    const { hostname } = new URL(origin);
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "[::1]" ||
      hostname.endsWith(".local")
    ) {
      return true;
    }
    return privateRange.test(hostname);
  } catch {
    return false;
  }
};

export default function handleCors(request, response) {
  const origin = request.headers.origin;
  if (allowedOrigins.includes(origin) || isDevOrigin(origin)) {
    response.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    response.setHeader("Access-Control-Allow-Origin", allowedOrigins[0]);
  }
  response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (request.method === "OPTIONS") {
    response.status(200).end();
    return true;
  }
  return false;
}
