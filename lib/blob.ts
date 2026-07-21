import { put } from "@vercel/blob";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 8 * 1024 * 1024; // 8MB

export interface UploadResult {
  url: string;
  pathname: string;
  contentType: string;
  size: number;
}

export async function uploadImage(
  file: File,
  folder = "uploads"
): Promise<UploadResult> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("UNSUPPORTED_FILE_TYPE");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("FILE_TOO_LARGE");
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const pathname = `${folder}/${Date.now()}-${safeName}`;

  const blob = await put(pathname, file, {
    access: "public",
    contentType: file.type,
  });

  return {
    url: blob.url,
    pathname: blob.pathname,
    contentType: file.type,
    size: file.size,
  };
}
