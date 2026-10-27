import { AccessError } from "@/lib/server/access";

export class InvalidRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidRequestError";
  }
}

export function jsonResponse(data: unknown, status = 200): Response {
  return Response.json(data, {
    status,
    headers: {
      "cache-control": "private, no-store",
      "x-content-type-options": "nosniff",
    },
  });
}

export function errorResponse(error: unknown): Response {
  if (error instanceof AccessError) {
    return jsonResponse({ error: error.message }, error.status);
  }
  if (error instanceof InvalidRequestError) {
    return jsonResponse({ error: error.message }, 400);
  }

  console.error("MI Operations Hub API request failed.", error);
  return jsonResponse({ error: "The request could not be completed." }, 500);
}

export async function readJsonRequest(request: Request): Promise<unknown> {
  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > 1_000_000) {
    throw new InvalidRequestError("The request body is too large.");
  }
  const body = await request.text();
  if (new TextEncoder().encode(body).byteLength > 1_000_000) {
    throw new InvalidRequestError("The request body is too large.");
  }
  try {
    return JSON.parse(body) as unknown;
  } catch {
    throw new InvalidRequestError("The request body must contain valid JSON.");
  }
}
