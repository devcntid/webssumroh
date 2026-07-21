import { sql } from "@/lib/db";
import type { AdminRole, AdminUser, AdminUserPublic, PaginatedResult } from "@/types/db";

/**
 * Find active admin user by email (includes password_hash for login).
 * Called by: POST /api/auth/login
 */
export async function findAdminByEmail(email: string): Promise<AdminUser | null> {
  const rows = await sql`
    SELECT
      id, full_name, email, password_hash, role, is_active,
      last_login_at, login_fail_count, locked_until,
      created_at, updated_at, deleted_at
    FROM admin_users
    WHERE deleted_at IS NULL
      AND lower(email) = lower(${email})
    LIMIT 1
  `;
  return (rows[0] as AdminUser) ?? null;
}

/**
 * Record successful login — reset fail count, update last_login_at.
 */
export async function recordLoginSuccess(userId: number): Promise<void> {
  await sql`
    UPDATE admin_users
    SET last_login_at = NOW(),
        login_fail_count = 0,
        locked_until = NULL,
        updated_at = NOW()
    WHERE id = ${userId}
  `;
}

/**
 * Increment fail count; lock for 15 minutes after 5 failures.
 */
export async function recordLoginFailure(userId: number): Promise<void> {
  await sql`
    UPDATE admin_users
    SET login_fail_count = login_fail_count + 1,
        locked_until = CASE
          WHEN login_fail_count + 1 >= 5 THEN NOW() + INTERVAL '15 minutes'
          ELSE locked_until
        END,
        updated_at = NOW()
    WHERE id = ${userId}
  `;
}

/**
 * Get public admin user by id.
 */
export async function getAdminUserById(id: number): Promise<AdminUserPublic | null> {
  const rows = await sql`
    SELECT
      id, full_name, email, role, is_active, last_login_at,
      created_at, updated_at, deleted_at
    FROM admin_users
    WHERE id = ${id} AND deleted_at IS NULL
    LIMIT 1
  `;
  return (rows[0] as AdminUserPublic) ?? null;
}

export async function listAdminUsers(
  page = 1,
  perPage = 25
): Promise<PaginatedResult<AdminUserPublic>> {
  const offset = (page - 1) * perPage;
  const rows = await sql`
    SELECT
      id, full_name, email, role, is_active, last_login_at,
      created_at, updated_at, deleted_at,
      COUNT(*) OVER() AS total_count
    FROM admin_users
    WHERE deleted_at IS NULL
    ORDER BY created_at ASC
    LIMIT ${perPage}
    OFFSET ${offset}
  `;
  const total = rows.length > 0 ? Number((rows[0] as { total_count: number }).total_count) : 0;
  return {
    rows: rows.map(({ total_count: _, ...r }) => r as AdminUserPublic),
    total,
  };
}

export async function createAdminUser(input: {
  full_name: string;
  email: string;
  password_hash: string;
  role: AdminRole;
  is_active?: boolean;
}): Promise<AdminUserPublic> {
  const rows = await sql`
    INSERT INTO admin_users (full_name, email, password_hash, role, is_active)
    VALUES (
      ${input.full_name},
      ${input.email},
      ${input.password_hash},
      ${input.role},
      ${input.is_active ?? true}
    )
    RETURNING
      id, full_name, email, role, is_active, last_login_at,
      created_at, updated_at, deleted_at
  `;
  return rows[0] as AdminUserPublic;
}

export async function updateAdminUser(
  id: number,
  input: {
    full_name?: string;
    email?: string;
    role?: AdminRole;
    is_active?: boolean;
    password_hash?: string;
  }
): Promise<AdminUserPublic | null> {
  const existing = await getAdminUserById(id);
  if (!existing) return null;

  const full_name = input.full_name ?? existing.full_name;
  const email = input.email ?? existing.email;
  const role = input.role ?? existing.role;
  const is_active = input.is_active ?? existing.is_active;

  if (input.password_hash) {
    const rows = await sql`
      UPDATE admin_users
      SET full_name = ${full_name},
          email = ${email},
          role = ${role},
          is_active = ${is_active},
          password_hash = ${input.password_hash},
          login_fail_count = 0,
          locked_until = NULL,
          updated_at = NOW()
      WHERE id = ${id} AND deleted_at IS NULL
      RETURNING
        id, full_name, email, role, is_active, last_login_at,
        created_at, updated_at, deleted_at
    `;
    return (rows[0] as AdminUserPublic) ?? null;
  }

  const rows = await sql`
    UPDATE admin_users
    SET full_name = ${full_name},
        email = ${email},
        role = ${role},
        is_active = ${is_active},
        updated_at = NOW()
    WHERE id = ${id} AND deleted_at IS NULL
    RETURNING
      id, full_name, email, role, is_active, last_login_at,
      created_at, updated_at, deleted_at
  `;
  return (rows[0] as AdminUserPublic) ?? null;
}

/** Soft-deactivate (does not hard delete). */
export async function softDeleteAdminUser(id: number): Promise<void> {
  await sql`
    UPDATE admin_users
    SET deleted_at = NOW(), is_active = FALSE, updated_at = NOW()
    WHERE id = ${id} AND deleted_at IS NULL
  `;
}
