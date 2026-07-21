import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { invalidate, CACHE_KEYS } from "@/lib/cache";
import { writeAuditLog } from "@/lib/queries/audit-logs";
import {
  createDepartureSchedule,
  listDepartureSchedules,
} from "@/lib/queries/departure-schedules";

const CONTENT_ROLES = ["super_admin", "admin", "editor"] as const;

const CreateSchema = z.object({
  package_id: z.number().int().positive(),
  departure_date: z.string().min(1),
  return_date: z.string().min(1),
  departure_city: z.string().max(50).optional(),
  airline: z.string().max(100).nullable().optional(),
  total_seats: z.number().int().nonnegative(),
  seats_remaining: z.number().int().nonnegative(),
  price_override_idr: z.number().int().nullable().optional(),
  status: z.enum(["upcoming", "ongoing", "completed", "cancelled"]).optional(),
  internal_notes: z.string().nullable().optional(),
});

export async function GET(req: NextRequest) {
  const session = await requireAuth(req, [...CONTENT_ROLES]);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);
  const per_page = Math.min(100, Math.max(1, Number(searchParams.get("per_page") ?? 25) || 25));
  const packageIdRaw = searchParams.get("package_id");
  const packageId = packageIdRaw ? Number(packageIdRaw) : undefined;
  const statusParam = searchParams.get("status");
  const status =
    statusParam === "upcoming" ||
    statusParam === "ongoing" ||
    statusParam === "completed" ||
    statusParam === "cancelled" ||
    statusParam === "all"
      ? statusParam
      : "all";

  const { rows, total } = await listDepartureSchedules({
    page,
    perPage: per_page,
    packageId: packageId && Number.isFinite(packageId) ? packageId : undefined,
    status,
  });

  return NextResponse.json({ data: rows, total, page, per_page });
}

export async function POST(req: NextRequest) {
  const session = await requireAuth(req, [...CONTENT_ROLES]);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 422 }
    );
  }

  if (parsed.data.seats_remaining > parsed.data.total_seats) {
    return NextResponse.json(
      {
        error: "Validation failed",
        issues: [
          {
            path: ["seats_remaining"],
            message: "seats_remaining cannot exceed total_seats",
          },
        ],
      },
      { status: 422 }
    );
  }

  const result = await createDepartureSchedule(parsed.data, session.userId);
  await invalidate(CACHE_KEYS.DEPARTURES_PKG(parsed.data.package_id));

  await writeAuditLog({
    admin_user_id: session.userId,
    action: "created",
    entity_type: "departure_schedules",
    entity_id: result.id,
    changed_fields: parsed.data,
  });

  return NextResponse.json(result, { status: 201 });
}
