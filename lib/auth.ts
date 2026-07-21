import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { redis } from "@/lib/redis";
import type { AdminRole } from "@/types/db";
import type { SessionPayload } from "@/types/auth";

export const COOKIE_NAME = "ss_admin_token";
/** Root path so both `/panel` pages and `/api/*` routes receive the cookie. */
export const COOKIE_PATH = "/";
export const SESSION_TTL_SECONDS = 8 * 60 * 60; // 8 hours

/**
 * Temporary: skip login and treat every request as super_admin.
 * Set ADMIN_AUTH_BYPASS=false in env to re-enable auth.
 */
export const ADMIN_AUTH_BYPASS = process.env.ADMIN_AUTH_BYPASS !== "false";

export const DEV_ADMIN_SESSION: SessionPayload = {
  userId: 1,
  role: "super_admin",
  email: "admin@ssumroh.id",
  fullName: "System Administrator",
};

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must be set and at least 32 characters");
  }
  return new TextEncoder().encode(secret);
}

export async function signToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({
    userId: payload.userId,
    role: payload.role,
    email: payload.email,
    fullName: payload.fullName,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getJwtSecret());
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    if (
      typeof payload.userId !== "number" ||
      typeof payload.role !== "string" ||
      typeof payload.email !== "string"
    ) {
      return null;
    }
    return {
      userId: payload.userId,
      role: payload.role as AdminRole,
      email: payload.email,
      fullName: typeof payload.fullName === "string" ? payload.fullName : "",
    };
  } catch {
    return null;
  }
}

export function sessionKey(token: string): string {
  return `session:${token}`;
}

export async function createSession(token: string, payload: SessionPayload): Promise<void> {
  if (ADMIN_AUTH_BYPASS) return;
  await redis.set(sessionKey(token), JSON.stringify(payload), { ex: SESSION_TTL_SECONDS });
}

export async function destroySession(token: string): Promise<void> {
  try {
    await redis.del(sessionKey(token));
  } catch {
    // ignore
  }
}

export async function sessionExists(token: string): Promise<boolean> {
  if (ADMIN_AUTH_BYPASS) return true;
  try {
    const val = await redis.get(sessionKey(token));
    return val !== null && val !== undefined;
  } catch {
    return false;
  }
}

export function cookieOptions(maxAge = SESSION_TTL_SECONDS) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: COOKIE_PATH,
    maxAge,
  };
}

/**
 * Require authenticated admin with one of the allowed roles.
 * Returns session payload or null.
 */
export async function requireAuth(
  _req: NextRequest,
  allowedRoles: AdminRole[]
): Promise<SessionPayload | null> {
  if (ADMIN_AUTH_BYPASS) {
    return allowedRoles.includes(DEV_ADMIN_SESSION.role) ? DEV_ADMIN_SESSION : null;
  }

  const token = _req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload) return null;

  const exists = await sessionExists(token);
  if (!exists) return null;

  if (!allowedRoles.includes(payload.role)) return null;

  return payload;
}

/** Read session from cookies in Server Components / layouts. */
export async function getServerSession(): Promise<SessionPayload | null> {
  if (ADMIN_AUTH_BYPASS) return DEV_ADMIN_SESSION;

  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload) return null;

  const exists = await sessionExists(token);
  if (!exists) return null;

  return payload;
}
