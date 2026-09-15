import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { asUploadableFile, uploadMedia } from "@/lib/blob";
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

  const file = asUploadableFile(form.get("file"));
  if (!file) {
    return NextResponse.json({ error: "Missing file field" }, { status: 422 });
  }

  const folderRaw = form.get("folder");
  const folder =
    typeof folderRaw === "string" && folderRaw.trim()
      ? folderRaw.trim().replace(/[^a-zA-Z0-9/_-]/g, "")
      : "uploads";

  try {
    const result = await uploadMedia(file, folder || "uploads");

    try {
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
    } catch (auditError) {
      // Upload must succeed even if audit logging fails.
      console.error("[upload] audit log failed", auditError);
    }

    return NextResponse.json({ data: result }, { status: 201 });
  } catch (e) {
    if (e instanceof Error) {
      if (e.message === "UNSUPPORTED_FILE_TYPE") {
        return NextResponse.json(
          { error: "Unsupported file type. Use JPEG, PNG, WebP, or GIF." },
          { status: 422 }
        );
      }
      if (e.message === "UNSUPPORTED_VIDEO_TYPE") {
        return NextResponse.json(
          { error: "Unsupported video type. Use MP4 or WebM." },
          { status: 422 }
        );
      }
      if (e.message === "FILE_TOO_LARGE") {
        return NextResponse.json(
          { error: "Image too large. Maximum upload size is 8MB (compressed to WebP ≤ 200KB)." },
          { status: 422 }
        );
      }
      if (e.message === "IMAGE_COMPRESS_FAILED") {
        return NextResponse.json(
          { error: "Could not process image. Try JPEG/PNG under 8MB." },
          { status: 422 }
        );
      }
      if (e.message === "VIDEO_TOO_LARGE") {
        return NextResponse.json(
          { error: "Video too large. Maximum size is 80MB." },
          { status: 422 }
        );
      }
      if (e.message === "BLOB_NOT_CONFIGURED") {
        return NextResponse.json(
          { error: "Storage is not configured. Set BLOB_READ_WRITE_TOKEN on the server." },
          { status: 500 }
        );
      }
      if (e.message === "BLOB_UPLOAD_FAILED") {
        return NextResponse.json(
          { error: "Could not store file. Check Vercel Blob token and try again." },
          { status: 500 }
        );
      }
    }
    console.error("[upload] unexpected error", e);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
