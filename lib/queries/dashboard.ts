import { sql } from "@/lib/db";
import type { DepartureScheduleWithPackage, Testimonial } from "@/types/db";

export interface DashboardStats {
  newLeadsToday: number;
  activePackages: number;
  inactivePackages: number;
  departuresThisMonth: DepartureScheduleWithPackage[];
  seatsAlerts: DepartureScheduleWithPackage[];
  pendingTestimonials: Testimonial[];
  leadsByDay: { day: string; leads: number }[];
  packagesByCategory: { name: string; value: number }[];
}

/**
 * Aggregate stats for the admin dashboard home.
 * Called by: GET /api/dashboard
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const [
    leadCountRows,
    packageCountRows,
    departuresThisMonth,
    seatsAlerts,
    pendingTestimonials,
    leadsByDayRows,
    packagesByCategoryRows,
  ] = await Promise.all([
    sql`
      SELECT COUNT(*)::int AS count
      FROM contact_leads
      WHERE created_at::date = (CURRENT_TIMESTAMP AT TIME ZONE 'UTC')::date
    `,
    sql`
      SELECT
        COUNT(*) FILTER (WHERE is_active = TRUE)::int AS active_count,
        COUNT(*) FILTER (WHERE is_active = FALSE)::int AS inactive_count
      FROM packages
      WHERE deleted_at IS NULL
    `,
    sql`
      SELECT
        ds.id, ds.package_id, ds.departure_date, ds.return_date, ds.departure_city,
        ds.airline, ds.total_seats, ds.seats_remaining, ds.price_override_idr,
        ds.status, ds.internal_notes, ds.created_at, ds.updated_at, ds.deleted_at,
        ds.created_by, ds.updated_by,
        p.name AS package_name,
        p.category AS package_category
      FROM departure_schedules ds
      INNER JOIN packages p ON p.id = ds.package_id
      WHERE ds.deleted_at IS NULL
        AND date_trunc('month', ds.departure_date::timestamp)
          = date_trunc('month', (CURRENT_TIMESTAMP AT TIME ZONE 'UTC')::date::timestamp)
      ORDER BY ds.departure_date ASC, ds.id ASC
    `,
    sql`
      SELECT
        ds.id, ds.package_id, ds.departure_date, ds.return_date, ds.departure_city,
        ds.airline, ds.total_seats, ds.seats_remaining, ds.price_override_idr,
        ds.status, ds.internal_notes, ds.created_at, ds.updated_at, ds.deleted_at,
        ds.created_by, ds.updated_by,
        p.name AS package_name,
        p.category AS package_category
      FROM departure_schedules ds
      INNER JOIN packages p ON p.id = ds.package_id
      WHERE ds.deleted_at IS NULL
        AND ds.status = 'upcoming'
        AND ds.seats_remaining <= 5
      ORDER BY ds.seats_remaining ASC, ds.departure_date ASC
    `,
    sql`
      SELECT
        id, full_name, initials, city_or_role, package_name, star_rating,
        quote_text, page_context, date_collected, is_verified, is_active,
        display_order, created_at, updated_at, deleted_at, created_by, updated_by
      FROM testimonials
      WHERE deleted_at IS NULL
        AND is_verified = FALSE
      ORDER BY created_at DESC
      LIMIT 10
    `,
    sql`
      WITH days AS (
        SELECT generate_series(
          ((CURRENT_TIMESTAMP AT TIME ZONE 'UTC')::date - INTERVAL '6 days')::date,
          (CURRENT_TIMESTAMP AT TIME ZONE 'UTC')::date,
          INTERVAL '1 day'
        )::date AS day
      )
      SELECT
        d.day::text AS day,
        COUNT(cl.id)::int AS leads
      FROM days d
      LEFT JOIN contact_leads cl ON cl.created_at::date = d.day
      GROUP BY d.day
      ORDER BY d.day ASC
    `,
    sql`
      SELECT
        category AS name,
        COUNT(*)::int AS value
      FROM packages
      WHERE deleted_at IS NULL
        AND is_active = TRUE
      GROUP BY category
      ORDER BY value DESC, category ASC
    `,
  ]);

  const packageCounts = packageCountRows[0] as {
    active_count: number;
    inactive_count: number;
  };

  return {
    newLeadsToday: Number((leadCountRows[0] as { count: number }).count),
    activePackages: Number(packageCounts.active_count),
    inactivePackages: Number(packageCounts.inactive_count),
    // Neon may return DATE/TIMESTAMPTZ as Date objects — coerce to ISO strings
    // so Server Components never try to render a raw Date as a React child.
    departuresThisMonth: (departuresThisMonth as DepartureScheduleWithPackage[]).map(
      normalizeScheduleDates
    ),
    seatsAlerts: (seatsAlerts as DepartureScheduleWithPackage[]).map(normalizeScheduleDates),
    pendingTestimonials: pendingTestimonials as Testimonial[],
    leadsByDay: (leadsByDayRows as { day: string | Date; leads: number }[]).map((r) => ({
      day: toDateString(r.day),
      leads: Number(r.leads),
    })),
    packagesByCategory: (packagesByCategoryRows as { name: string; value: number }[]).map(
      (r) => ({
        name: r.name,
        value: Number(r.value),
      })
    ),
  };
}

function toDateString(value: string | Date | null | undefined): string {
  if (value == null || value === "") return "";
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? "" : value.toISOString().slice(0, 10);
  }
  return String(value).slice(0, 10);
}

function normalizeScheduleDates(
  row: DepartureScheduleWithPackage
): DepartureScheduleWithPackage {
  return {
    ...row,
    departure_date: toDateString(row.departure_date as string | Date),
    return_date: toDateString(row.return_date as string | Date),
  };
}
