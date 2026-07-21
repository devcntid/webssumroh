import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { invalidate, CACHE_KEYS } from "@/lib/cache";
import { writeAuditLog } from "@/lib/queries/audit-logs";
import {
  getDepartureScheduleById,
  softDeleteDepartureSchedule,
  updateDepartureSchedule,
} from "@/lib/queries/departure-schedules";

const CONTENT_ROLES = ["super_admin", "admin", "editor"] as const;

const UpdateSchema = z.object({
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

function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  const session = await requireAuth(req, [...CONTENT_ROLES]);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = parseId((await ctx.params).id);
  if (!id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data = await getDepartureScheduleById(id);
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ data });
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  const session = await requireAuth(req, [...CONTENT_ROLES]);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = parseId((await ctx.params).id);
  if (!id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = UpdateSchema.safeParse(body);
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

  const existing = await getDepartureScheduleById(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const result = await updateDepartureSchedule(id, parsed.data, session.userId);
  if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const keys = [CACHE_KEYS.DEPARTURES_PKG(parsed.data.package_id)];
  if (existing.package_id !== parsed.data.package_id) {
    keys.push(CACHE_KEYS.DEPARTURES_PKG(existing.package_id));
  }
  await invalidate(...keys);

  await writeAuditLog({
    admin_user_id: session.userId,
    action: "updated",
    entity_type: "departure_schedules",
    entity_id: id,
    changed_fields: parsed.data,
  });

  return NextResponse.json({ data: result });
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const session = await requireAuth(req, [...CONTENT_ROLES]);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = parseId((await ctx.params).id);
  if (!id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const existing = await getDepartureScheduleById(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await softDeleteDepartureSchedule(id);
  await invalidate(CACHE_KEYS.DEPARTURES_PKG(existing.package_id));

  await writeAuditLog({
    admin_user_id: session.userId,
    action: "deleted",
    entity_type: "departure_schedules",
    entity_id: id,
  });

  return new NextResponse(null, { status: 204 });
}
