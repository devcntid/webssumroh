import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { uploadImage } from "@/lib/blob";
import { writeAuditLog } from "@/lib/queries/audit-logs";

const CONTENT_ROLES = ["super_admin", "admin", "editor"] as const;

export async function POST(req: NextRequest) {
  const session = await requireAuth(req, [...CONTENT_ROLES]);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 422 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file field" }, { status: 422 });
  }

  const folderRaw = form.get("folder");
  const folder =
    typeof folderRaw === "string" && folderRaw.trim()
      ? folderRaw.trim().replace(/[^a-zA-Z0-9/_-]/g, "")
      : "uploads";

  try {
    const result = await uploadImage(file, folder || "uploads");

    await writeAuditLog({
      admin_user_id: session.userId,
      action: "created",
      entity_type: "uploads",
      changed_fields: {
        pathname: result.pathname,
        contentType: result.contentType,
        size: result.size,
      },
    });

    return NextResponse.json({ data: result }, { status: 201 });
  } catch (e) {
    if (e instanceof Error) {
      if (e.message === "UNSUPPORTED_FILE_TYPE") {
        return NextResponse.json(
          { error: "Unsupported file type. Use JPEG, PNG, or WebP." },
          { status: 422 }
        );
      }
      if (e.message === "FILE_TOO_LARGE") {
        return NextResponse.json(
          { error: "File too large. Maximum size is 8MB." },
          { status: 422 }
        );
      }
    }
    throw e;
  }
}
