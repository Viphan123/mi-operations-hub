import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";

export class AccessError extends Error {
  constructor(message: string, readonly status: 401 | 403 | 503) {
    super(message);
    this.name = "AccessError";
  }
}

type AccessEnvironment = {
  CF_ACCESS_TEAM_DOMAIN?: string;
  CF_ACCESS_AUD?: string;
  MI_EDITOR_EMAILS?: string;
};

export type AccessUser = {
  email: string;
  env: CloudflareEnv;
};

const keySets = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

function emailFromPayload(payload: JWTPayload): string | null {
  const email = payload.email;
  return typeof email === "string" && email.includes("@") ? email.trim().toLowerCase() : null;
}

export async function authenticateAccessRequest(requestHeaders: Headers): Promise<AccessUser> {
  const { env } = await getCloudflareContext({ async: true });
  const accessEnv = env as AccessEnvironment;
  const domain = accessEnv.CF_ACCESS_TEAM_DOMAIN?.trim().replace(/^https?:\/\//, "").replace(/\/+$/, "");
  const audience = accessEnv.CF_ACCESS_AUD?.trim();
  if (!domain || !/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+cloudflareaccess\.com$/i.test(domain) || !audience) {
    throw new AccessError("Cloudflare Access is not configured for this workspace.", 503);
  }

  const token = requestHeaders.get("cf-access-jwt-assertion");
  if (!token) throw new AccessError("An authenticated Cloudflare Access session is required.", 401);

  const issuer = `https://${domain}`;
  let jwks = keySets.get(issuer);
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL("/cdn-cgi/access/certs", issuer));
    keySets.set(issuer, jwks);
  }

  let payload: JWTPayload;
  try {
    ({ payload } = await jwtVerify(token, jwks, { issuer, audience }));
  } catch {
    throw new AccessError("The Cloudflare Access session is invalid or expired.", 401);
  }

  const email = emailFromPayload(payload);
  if (!email) throw new AccessError("The Cloudflare Access session has no valid user identity.", 401);
  return { email, env };
}

export function canEditWorkspace(user: AccessUser): boolean {
  const allowedEditors = user.env.MI_EDITOR_EMAILS
    ?.split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean) ?? [];
  return allowedEditors.includes(user.email);
}

export function requireEditor(user: AccessUser): void {
  if (!canEditWorkspace(user)) {
    throw new AccessError("Your account is not authorized to edit this workspace.", 403);
  }
}

export function requireSameOrigin(request: Request): void {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) {
    throw new AccessError("The request origin is not authorized.", 403);
  }
}
