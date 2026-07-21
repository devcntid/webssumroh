import { SignJWT, jwtVerify } from "jose";
import { getServerSession as getNextAuthSession } from "next-auth";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { authOptions, SESSION_TTL_SECONDS } from "@/lib/auth-options";
import { redis } from "@/lib/redis";
import type { AdminRole } from "@/types/db";
import type { SessionPayload } from "@/types/auth";

export { SESSION_TTL_SECONDS };

export const COOKIE_NAME = "ss_admin_token";
/** Root path so both `/panel` pages and `/api/*` routes receive the cookie. */
export const COOKIE_PATH = "/";

/**
 * Temporary: skip login and treat every request as super_admin.
 * Set ADMIN_AUTH_BYPASS=true in env to enable. Defaults to OFF so SSO is enforced.
 */
export const ADMIN_AUTH_BYPASS = process.env.ADMIN_AUTH_BYPASS === "true";

export const DEV_ADMIN_SESSION: SessionPayload = {
  userId: 1,
  role: "super_admin",
  email: "admin@ssumroh.id",
  fullName: "System Administrator",
};

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET or NEXTAUTH_SECRET must be set and at least 32 characters");
  }
  return new TextEncoder().encode(secret);
}

/** Legacy password-login helpers (kept for /api/auth/login). */
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
 * Reads the NextAuth JWT (Google SSO session).
 * Returns session payload or null.
 */
export async function requireAuth(
  req: NextRequest,
  allowedRoles: AdminRole[]
): Promise<SessionPayload | null> {
  if (ADMIN_AUTH_BYPASS) {
    return allowedRoles.includes(DEV_ADMIN_SESSION.role) ? DEV_ADMIN_SESSION : null;
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (token?.userId && token.role && token.email) {
    if (!allowedRoles.includes(token.role)) return null;
    return {
      userId: token.userId,
      role: token.role,
      email: String(token.email),
      fullName: token.fullName ?? "",
    };
  }

  // Fallback: legacy password-login cookie (ss_admin_token)
  const legacy = req.cookies.get(COOKIE_NAME)?.value;
  if (!legacy) return null;

  const payload = await verifyToken(legacy);
  if (!payload) return null;

  const exists = await sessionExists(legacy);
  if (!exists) return null;

  if (!allowedRoles.includes(payload.role)) return null;
  return payload;
}

/** Read session from cookies in Server Components / layouts. */
export async function getServerSession(): Promise<SessionPayload | null> {
  if (ADMIN_AUTH_BYPASS) return DEV_ADMIN_SESSION;

  const session = await getNextAuthSession(authOptions);
  if (session?.user?.id && session.user.role && session.user.email) {
    return {
      userId: session.user.id,
      role: session.user.role,
      email: session.user.email,
      fullName: session.user.fullName ?? "",
    };
  }

  return null;
}
