import { put } from "@vercel/blob";

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);
const IMAGE_MAX_BYTES = 8 * 1024 * 1024; // 8MB
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
  return putPublicFile(file, folder);
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

/** Upload image or video based on MIME type. */
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

async function putPublicFile(file: File, folder: string): Promise<UploadResult> {
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
