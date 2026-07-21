import { sql } from "@/lib/db";
import type {
  DepartureSchedule,
  DepartureScheduleWithPackage,
  PaginatedResult,
  ScheduleStatus,
} from "@/types/db";

export interface DepartureScheduleInput {
  package_id: number;
  departure_date: string;
  return_date: string;
  departure_city?: string;
  airline?: string | null;
  total_seats: number;
  seats_remaining: number;
  price_override_idr?: number | null;
  status?: ScheduleStatus;
  internal_notes?: string | null;
}

/**
 * List departure schedules with package name/category join.
 * Called by: admin schedules API, dashboard
 */
export async function listDepartureSchedules(opts: {
  page?: number;
  perPage?: number;
  packageId?: number;
  status?: ScheduleStatus | "all";
}): Promise<PaginatedResult<DepartureScheduleWithPackage>> {
  const page = opts.page ?? 1;
  const perPage = opts.perPage ?? 25;
  const offset = (page - 1) * perPage;
  const packageId = opts.packageId ?? null;
  const status = opts.status ?? "all";

  const rows = await sql`
    SELECT
      ds.id, ds.package_id, ds.departure_date, ds.return_date, ds.departure_city,
      ds.airline, ds.total_seats, ds.seats_remaining, ds.price_override_idr,
      ds.status, ds.internal_notes, ds.created_at, ds.updated_at, ds.deleted_at,
      ds.created_by, ds.updated_by,
      p.name AS package_name,
      p.category AS package_category,
      COUNT(*) OVER() AS total_count
    FROM departure_schedules ds
    INNER JOIN packages p ON p.id = ds.package_id
    WHERE ds.deleted_at IS NULL
      AND (${packageId}::bigint IS NULL OR ds.package_id = ${packageId})
      AND (${status} = 'all' OR ds.status = ${status})
    ORDER BY ds.departure_date ASC, ds.id ASC
    LIMIT ${perPage}
    OFFSET ${offset}
  `;
  const total = rows.length > 0 ? Number((rows[0] as { total_count: number }).total_count) : 0;
  return {
    rows: rows.map(({ total_count: _, ...r }) => r as DepartureScheduleWithPackage),
    total,
  };
}

export async function getDepartureScheduleById(
  id: number
): Promise<DepartureScheduleWithPackage | null> {
  const rows = await sql`
    SELECT
      ds.id, ds.package_id, ds.departure_date, ds.return_date, ds.departure_city,
      ds.airline, ds.total_seats, ds.seats_remaining, ds.price_override_idr,
      ds.status, ds.internal_notes, ds.created_at, ds.updated_at, ds.deleted_at,
      ds.created_by, ds.updated_by,
      p.name AS package_name,
      p.category AS package_category
    FROM departure_schedules ds
    INNER JOIN packages p ON p.id = ds.package_id
    WHERE ds.id = ${id} AND ds.deleted_at IS NULL
    LIMIT 1
  `;
  return (rows[0] as DepartureScheduleWithPackage) ?? null;
}

export async function createDepartureSchedule(
  input: DepartureScheduleInput,
  userId: number
): Promise<DepartureSchedule> {
  const rows = await sql`
    INSERT INTO departure_schedules (
      package_id, departure_date, return_date, departure_city, airline,
      total_seats, seats_remaining, price_override_idr, status, internal_notes,
      created_by, updated_by
    )
    VALUES (
      ${input.package_id}, ${input.departure_date}, ${input.return_date},
      ${input.departure_city ?? "CGK"}, ${input.airline ?? null},
      ${input.total_seats}, ${input.seats_remaining},
      ${input.price_override_idr ?? null}, ${input.status ?? "upcoming"},
      ${input.internal_notes ?? null}, ${userId}, ${userId}
    )
    RETURNING
      id, package_id, departure_date, return_date, departure_city, airline,
      total_seats, seats_remaining, price_override_idr, status, internal_notes,
      created_at, updated_at, deleted_at, created_by, updated_by
  `;
  return rows[0] as DepartureSchedule;
}

export async function updateDepartureSchedule(
  id: number,
  input: DepartureScheduleInput,
  userId: number
): Promise<DepartureSchedule | null> {
  const rows = await sql`
    UPDATE departure_schedules SET
      package_id = ${input.package_id},
      departure_date = ${input.departure_date},
      return_date = ${input.return_date},
      departure_city = ${input.departure_city ?? "CGK"},
      airline = ${input.airline ?? null},
      total_seats = ${input.total_seats},
      seats_remaining = ${input.seats_remaining},
      price_override_idr = ${input.price_override_idr ?? null},
      status = ${input.status ?? "upcoming"},
      internal_notes = ${input.internal_notes ?? null},
      updated_by = ${userId},
      updated_at = NOW()
    WHERE id = ${id} AND deleted_at IS NULL
    RETURNING
      id, package_id, departure_date, return_date, departure_city, airline,
      total_seats, seats_remaining, price_override_idr, status, internal_notes,
      created_at, updated_at, deleted_at, created_by, updated_by
  `;
  return (rows[0] as DepartureSchedule) ?? null;
}

export async function softDeleteDepartureSchedule(id: number): Promise<void> {
  await sql`
    UPDATE departure_schedules
    SET deleted_at = NOW(), updated_at = NOW()
    WHERE id = ${id} AND deleted_at IS NULL
  `;
}
