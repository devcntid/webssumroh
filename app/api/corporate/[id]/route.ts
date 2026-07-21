import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { writeAuditLog } from "@/lib/queries/audit-logs";
import {
  appendCorporateInquiryAgentNote,
  getCorporateInquiryById,
  updateCorporateInquiryStatus,
} from "@/lib/queries/corporate-inquiries";

const LEAD_ROLES = ["super_admin", "admin", "cs_agent"] as const;

const PatchSchema = z
  .object({
    status: z.enum(["new", "read", "responded", "quoted", "closed"]).optional(),
    assigned_to: z.number().int().positive().nullable().optional(),
    agent_notes: z.string().min(1).optional(),
  })
  .refine((d) => d.status !== undefined || d.agent_notes !== undefined, {
    message: "Provide status and/or agent_notes",
  });

function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  const session = await requireAuth(req, [...LEAD_ROLES]);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = parseId((await ctx.params).id);
  if (!id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data = await getCorporateInquiryById(id);
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ data });
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const session = await requireAuth(req, [...LEAD_ROLES]);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = parseId((await ctx.params).id);
  if (!id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 422 }
    );
  }

  const existing = await getCorporateInquiryById(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let data = existing;

  if (parsed.data.status !== undefined) {
    const updated = await updateCorporateInquiryStatus(
      id,
      parsed.data.status,
      parsed.data.assigned_to
    );
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    data = updated;
  }

  if (parsed.data.agent_notes) {
    const updated = await appendCorporateInquiryAgentNote(id, parsed.data.agent_notes);
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    data = updated;
  }

  await writeAuditLog({
    admin_user_id: session.userId,
    action: "updated",
    entity_type: "corporate_inquiries",
    entity_id: id,
    changed_fields: parsed.data,
  });

  return NextResponse.json({ data });
}
