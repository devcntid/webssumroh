import { put } from "@vercel/blob";
import { compressImageToWebp } from "@/lib/image-compress";
import { IMAGE_TARGET_MAX_BYTES } from "@/lib/upload-limits";

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);
const IMAGE_MAX_BYTES = 8 * 1024 * 1024; // 8MB upload input
const VIDEO_MAX_BYTES = 80 * 1024 * 1024; // 80MB

export interface UploadResult {
  url: string;
  pathname: string;
  contentType: string;
  size: number;
}

export interface UploadableFile {
  name: string;
  type: string;
  size: number;
  arrayBuffer: () => Promise<ArrayBuffer>;
}

/** Accept File/Blob from multipart even when `instanceof File` fails across realms. */
export function asUploadableFile(value: unknown): UploadableFile | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as {
    arrayBuffer?: () => Promise<ArrayBuffer>;
    size?: number;
    name?: string;
    type?: string;
  };
  if (typeof candidate.arrayBuffer !== "function") return null;
  if (typeof candidate.size !== "number") return null;

  const name =
    typeof candidate.name === "string" && candidate.name.trim()
      ? candidate.name
      : "upload.bin";
  const type = typeof candidate.type === "string" ? candidate.type : "";

  return {
    name,
    type,
    size: candidate.size,
    arrayBuffer: () => candidate.arrayBuffer!(),
  };
}

function extensionOf(name: string): string {
  const parts = name.toLowerCase().split(".");
  return parts.length > 1 ? parts[parts.length - 1] : "";
}

function resolveImageMime(file: UploadableFile): string | null {
  if (IMAGE_TYPES.has(file.type)) return file.type;
  switch (extensionOf(file.name)) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    default:
      return null;
  }
}

function isVideoFile(file: UploadableFile): boolean {
  if (VIDEO_TYPES.has(file.type)) return true;
  const ext = extensionOf(file.name);
  return ext === "mp4" || ext === "webm" || ext === "mov";
}

function webpFilename(originalName: string): string {
  const base =
    originalName.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9._-]/g, "_") || "image";
  return `${base}.webp`;
}

export async function uploadImage(
  file: UploadableFile,
  folder = "uploads"
): Promise<UploadResult> {
  const mime = resolveImageMime(file);
  if (!mime) {
    throw new Error("UNSUPPORTED_FILE_TYPE");
  }
  if (file.size > IMAGE_MAX_BYTES) {
    throw new Error("FILE_TOO_LARGE");
  }

  const bytes = Buffer.from(await file.arrayBuffer());

  // Client often already compressed to WebP ≤ 200KB — store directly (no sharp needed).
  if (
    (mime === "image/webp" || extensionOf(file.name) === "webp") &&
    bytes.byteLength <= IMAGE_TARGET_MAX_BYTES
  ) {
    return putPublicBytes(bytes, folder, webpFilename(file.name), "image/webp");
  }

  try {
    const compressed = await compressImageToWebp(bytes, file.name);
    return putPublicBytes(
      compressed.buffer,
      folder,
      compressed.filename,
      compressed.contentType
    );
  } catch (error) {
    // Fallback: if already small enough, upload original bytes.
    if (bytes.byteLength <= IMAGE_TARGET_MAX_BYTES) {
      const contentType = mime === "image/png" ? "image/png" : mime === "image/gif" ? "image/gif" : mime === "image/webp" ? "image/webp" : "image/jpeg";
      const ext =
        contentType === "image/png"
          ? "png"
          : contentType === "image/gif"
            ? "gif"
            : contentType === "image/webp"
              ? "webp"
              : "jpg";
      const base =
        file.name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9._-]/g, "_") || "image";
      console.error("[upload] sharp compress failed, using original small file", error);
      return putPublicBytes(bytes, folder, `${base}.${ext}`, contentType);
    }

    if (error instanceof Error && error.message === "IMAGE_COMPRESS_FAILED") {
      throw error;
    }
    console.error("[upload] image compress failed", error);
    throw new Error("IMAGE_COMPRESS_FAILED");
  }
}

export async function uploadVideo(
  file: UploadableFile,
  folder = "uploads/videos"
): Promise<UploadResult> {
  if (!isVideoFile(file)) {
    throw new Error("UNSUPPORTED_VIDEO_TYPE");
  }
  if (file.size > VIDEO_MAX_BYTES) {
    throw new Error("VIDEO_TOO_LARGE");
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const contentType = VIDEO_TYPES.has(file.type) ? file.type : "video/mp4";
  return putPublicBytes(bytes, folder, file.name, contentType);
}

/** Upload image or video based on MIME/extension. Images are compressed to WebP ≤ 200KB. */
export async function uploadMedia(
  file: UploadableFile,
  folder = "uploads"
): Promise<UploadResult> {
  if (isVideoFile(file)) {
    return uploadVideo(file, folder);
  }
  if (resolveImageMime(file)) {
    return uploadImage(file, folder);
  }
  throw new Error("UNSUPPORTED_FILE_TYPE");
}

async function putPublicBytes(
  body: Buffer,
  folder: string,
  filename: string,
  contentType: string
): Promise<UploadResult> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("BLOB_NOT_CONFIGURED");
  }

  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_") || "upload.bin";
  const pathname = `${folder.replace(/\/+$/, "")}/${Date.now()}-${safeName}`;

  try {
    const blob = await put(pathname, body, {
      access: "public",
      contentType,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return {
      url: blob.url,
      pathname: blob.pathname,
      contentType,
      size: body.byteLength,
    };
  } catch (error) {
    console.error("[upload] blob put failed", error);
    throw new Error("BLOB_UPLOAD_FAILED");
  }
}
