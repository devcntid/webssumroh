import { sql } from "@/lib/db";
import { CACHE_KEYS, getCachedOrFetch } from "@/lib/cache";
import type { Department, PaginatedResult, TeamMember } from "@/types/db";

const TEAM_TTL = 1800;

export interface TeamMemberInput {
  full_name: string;
  role_title: string;
  department?: Department;
  photo_url?: string | null;
  bio?: string | null;
  is_active?: boolean;
  display_order?: number;
}

/**
 * Paginated admin team members list.
 * Called by: GET /api/team-members (admin)
 */
export async function listTeamMembersAdmin(opts: {
  page?: number;
  perPage?: number;
  status?: "active" | "inactive" | "all";
  department?: Department | "all";
}): Promise<PaginatedResult<TeamMember>> {
  const page = opts.page ?? 1;
  const perPage = opts.perPage ?? 25;
  const offset = (page - 1) * perPage;
  const status = opts.status ?? "all";
  const department = opts.department && opts.department !== "all" ? opts.department : null;

  const rows = await sql`
    SELECT
      id, full_name, role_title, department, photo_url, bio,
      is_active, display_order, created_at, updated_at, deleted_at, created_by,
      COUNT(*) OVER() AS total_count
    FROM team_members
    WHERE deleted_at IS NULL
      AND (
        ${status} = 'all'
        OR (${status} = 'active' AND is_active = TRUE)
        OR (${status} = 'inactive' AND is_active = FALSE)
      )
      AND (${department}::text IS NULL OR department = ${department})
    ORDER BY display_order ASC, id ASC
    LIMIT ${perPage}
    OFFSET ${offset}
  `;
  const total = rows.length > 0 ? Number((rows[0] as { total_count: number }).total_count) : 0;
  return {
    rows: rows.map(({ total_count: _, ...r }) => r as TeamMember),
    total,
  };
}

/**
 * Active team members for public About page.
 * Called by: public pages
 */
export async function getActiveTeamMembers(): Promise<TeamMember[]> {
  return getCachedOrFetch<TeamMember[]>(
    CACHE_KEYS.TEAM_ACTIVE,
    async () =>
      (await sql`
        SELECT
          id, full_name, role_title, department, photo_url, bio,
          is_active, display_order, created_at, updated_at, deleted_at, created_by
        FROM team_members
        WHERE deleted_at IS NULL
          AND is_active = TRUE
        ORDER BY display_order ASC, id ASC
      `) as TeamMember[],
    TEAM_TTL
  );
}

export async function getTeamMemberById(id: number): Promise<TeamMember | null> {
  const rows = await sql`
    SELECT
      id, full_name, role_title, department, photo_url, bio,
      is_active, display_order, created_at, updated_at, deleted_at, created_by
    FROM team_members
    WHERE id = ${id} AND deleted_at IS NULL
    LIMIT 1
  `;
  return (rows[0] as TeamMember) ?? null;
}

export async function createTeamMember(
  input: TeamMemberInput,
  userId: number
): Promise<TeamMember> {
  const rows = await sql`
    INSERT INTO team_members (
      full_name, role_title, department, photo_url, bio,
      is_active, display_order, created_by
    )
    VALUES (
      ${input.full_name}, ${input.role_title},
      ${input.department ?? "Operations"}, ${input.photo_url ?? null},
      ${input.bio ?? null}, ${input.is_active ?? true},
      ${input.display_order ?? 0}, ${userId}
    )
    RETURNING
      id, full_name, role_title, department, photo_url, bio,
      is_active, display_order, created_at, updated_at, deleted_at, created_by
  `;
  return rows[0] as TeamMember;
}

export async function updateTeamMember(
  id: number,
  input: TeamMemberInput
): Promise<TeamMember | null> {
  const rows = await sql`
    UPDATE team_members SET
      full_name = ${input.full_name},
      role_title = ${input.role_title},
      department = ${input.department ?? "Operations"},
      photo_url = ${input.photo_url ?? null},
      bio = ${input.bio ?? null},
      is_active = ${input.is_active ?? true},
      display_order = ${input.display_order ?? 0},
      updated_at = NOW()
    WHERE id = ${id} AND deleted_at IS NULL
    RETURNING
      id, full_name, role_title, department, photo_url, bio,
      is_active, display_order, created_at, updated_at, deleted_at, created_by
  `;
  return (rows[0] as TeamMember) ?? null;
}

export async function softDeleteTeamMember(id: number): Promise<void> {
  await sql`
    UPDATE team_members
    SET deleted_at = NOW(), updated_at = NOW()
    WHERE id = ${id} AND deleted_at IS NULL
  `;
}

export async function reorderTeamMembers(orderedIds: number[]): Promise<void> {
  if (orderedIds.length === 0) return;
  await sql`
    UPDATE team_members AS t
    SET display_order = u.ord::smallint, updated_at = NOW()
    FROM UNNEST(${orderedIds}::bigint[]) WITH ORDINALITY AS u(id, ord)
    WHERE t.id = u.id AND t.deleted_at IS NULL
  `;
}
