import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Placeholder admin gate for v1 (no SSO). Behaviour:
 *
 * - `ADMIN_GATE` unset  → admin is open; the UI shows a notice.
 * - `ADMIN_GATE=secret` → /admin asks for the passphrase once and stores a
 *   derived token in an HttpOnly cookie. API mutations accept the same token
 *   via the `x-admin-token` header or `Authorization: Bearer <ADMIN_GATE>`.
 *
 * Replace with real auth (SSO / allowlist) in a later wave — see CLAUDE.md.
 */

export const ADMIN_COOKIE = "mrf_admin";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 14; // 14 days

export function gateSecret(): string | undefined {
  const v = process.env.ADMIN_GATE?.trim();
  return v ? v : undefined;
}

export function isGateEnabled(): boolean {
  return Boolean(gateSecret());
}

/** Token stored in the cookie; never the passphrase itself. */
export function deriveToken(secret: string): string {
  return createHmac("sha256", secret).update("marketing-request-forms:admin").digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function passphraseMatches(candidate: string): boolean {
  const secret = gateSecret();
  return Boolean(secret) && safeEqual(candidate, secret as string);
}

export async function isAdminSession(): Promise<boolean> {
  const secret = gateSecret();
  if (!secret) return true;
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  return Boolean(token) && safeEqual(token as string, deriveToken(secret));
}

export async function grantAdminSession(): Promise<void> {
  const secret = gateSecret();
  if (!secret) return;
  (await cookies()).set(ADMIN_COOKIE, deriveToken(secret), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

export async function revokeAdminSession(): Promise<void> {
  (await cookies()).delete(ADMIN_COOKIE);
}

/** For Route Handlers: cookie session, `x-admin-token`, or Bearer passphrase. */
export async function isAuthorizedRequest(request: Request): Promise<boolean> {
  const secret = gateSecret();
  if (!secret) return true;
  const token = deriveToken(secret);
  const headerToken = request.headers.get("x-admin-token");
  if (headerToken && safeEqual(headerToken, token)) return true;
  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ") && safeEqual(auth.slice(7).trim(), secret)) return true;
  return isAdminSession();
}
