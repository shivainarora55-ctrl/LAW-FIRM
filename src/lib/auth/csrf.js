import "server-only";

export function assertSameOrigin(request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!origin || !host) throw new Error("Request origin could not be verified.");
  let parsedOrigin;
  try {
    parsedOrigin = new URL(origin);
  } catch {
    throw new Error("Request origin could not be verified.");
  }
  if (parsedOrigin.host.toLowerCase() !== host.toLowerCase()) throw new Error("Request origin could not be verified.");
}
