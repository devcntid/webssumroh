import { IMAGE_TARGET_MAX_BYTES } from "@/lib/upload-limits";

/**
 * Browser-side image compression to WebP ≤ 200KB.
 * Avoids Vercel serverless body limits and sharp failures on upload.
 */
export async function compressImageForUpload(file: File): Promise<File> {
  if (!file.type.startsWith("image/") && !/\.(jpe?g|png|webp|gif)$/i.test(file.name)) {
    return file;
  }

  if (file.type === "image/webp" && file.size <= IMAGE_TARGET_MAX_BYTES) {
    return file;
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }

  const maxEdge = 1920;
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  let width = Math.max(1, Math.round(bitmap.width * scale));
  let height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }

  let quality = 0.82;
  let best: Blob | null = null;

  for (let attempt = 0; attempt < 8; attempt += 1) {
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((value) => resolve(value), "image/webp", quality)
    );

    if (blob && blob.size <= IMAGE_TARGET_MAX_BYTES) {
      best = blob;
      break;
    }

    if (blob && (!best || blob.size < best.size)) {
      best = blob;
    }

    if (quality > 0.4) {
      quality -= 0.1;
    } else {
      width = Math.max(1, Math.floor(width * 0.75));
      height = Math.max(1, Math.floor(height * 0.75));
      if (Math.max(width, height) < 480) break;
      quality = 0.72;
    }
  }

  bitmap.close();

  if (!best) return file;

  const base = file.name.replace(/\.[^.]+$/, "") || "image";
  return new File([best], `${base}.webp`, {
    type: "image/webp",
    lastModified: Date.now(),
  });
}

/** Compress (if image) then POST to /api/upload. */
export async function uploadAdminFile(
  file: File,
  folder: string
): Promise<{ url: string; size: number; contentType: string; pathname: string }> {
  const prepared =
    file.type.startsWith("video/") || /\.(mp4|webm|mov)$/i.test(file.name)
      ? file
      : await compressImageForUpload(file);

  const body = new FormData();
  body.append("file", prepared);
  body.append("folder", folder);

  const response = await fetch("/api/upload", { method: "POST", body });
  const json = await response.json().catch(() => ({}));
  if (!response.ok || !(json as { data?: { url?: string } }).data?.url) {
    const message =
      (json as { error?: string; detail?: string }).error ||
      (json as { detail?: string }).detail ||
      `Upload failed (${response.status})`;
    throw new Error(message);
  }

  return (json as {
    data: { url: string; size: number; contentType: string; pathname: string };
  }).data;
}
