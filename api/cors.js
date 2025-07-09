export default function handleCors(request, response) {
  const allowedOrigins = [
    "https://digitaltableteur.com",
    "https://www.digitaltableteur.com",
    "http://localhost:5173",
    "http://localhost:3000",
  ];
  const origin = request.headers.origin;
  if (allowedOrigins.includes(origin)) {
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
