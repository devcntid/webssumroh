import { put } from "@vercel/blob";
import { compressImageToWebp } from "@/lib/image-compress";

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

export async function uploadImage(
  file: File,
  folder = "uploads"
): Promise<UploadResult> {
  if (!IMAGE_TYPES.has(file.type)) {
    throw new Error("UNSUPPORTED_FILE_TYPE");
  }
  if (file.size > IMAGE_MAX_BYTES) {
    throw new Error("FILE_TOO_LARGE");
  }

  const compressed = await compressImageToWebp(await file.arrayBuffer(), file.name);
  const webpFile = new File([new Uint8Array(compressed.buffer)], compressed.filename, {
    type: compressed.contentType,
  });

  return putPublicFile(webpFile, folder, compressed.contentType);
}

export async function uploadVideo(
  file: File,
  folder = "uploads/videos"
): Promise<UploadResult> {
  if (!VIDEO_TYPES.has(file.type)) {
    throw new Error("UNSUPPORTED_VIDEO_TYPE");
  }
  if (file.size > VIDEO_MAX_BYTES) {
    throw new Error("VIDEO_TOO_LARGE");
  }
  return putPublicFile(file, folder);
}

/** Upload image or video based on MIME type. Images are always compressed to WebP ≤ 200KB. */
export async function uploadMedia(
  file: File,
  folder = "uploads"
): Promise<UploadResult> {
  if (IMAGE_TYPES.has(file.type)) {
    return uploadImage(file, folder);
  }
  if (VIDEO_TYPES.has(file.type)) {
    return uploadVideo(file, folder);
  }
  throw new Error("UNSUPPORTED_FILE_TYPE");
}

async function putPublicFile(
  file: File,
  folder: string,
  contentType = file.type
): Promise<UploadResult> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const pathname = `${folder}/${Date.now()}-${safeName}`;

  const blob = await put(pathname, file, {
    access: "public",
    contentType,
  });

  return {
    url: blob.url,
    pathname: blob.pathname,
    contentType,
    size: file.size,
  };
}
