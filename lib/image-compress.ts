import { IMAGE_TARGET_MAX_BYTES } from "@/lib/upload-limits";

/** Max compressed output size for admin image uploads. */
export { IMAGE_TARGET_MAX_BYTES };

/** Longest edge before encoding — keeps files small while preserving detail. */
const MAX_EDGE_PX = 1920;

const MIN_QUALITY = 30;
const MAX_QUALITY = 85;
const MIN_EDGE_PX = 640;

/**
 * Compress any supported raster image to WebP ≤ 200KB.
 * Sharp is loaded dynamically so a native-binary failure does not crash the route module.
 */
export async function compressImageToWebp(
  input: Buffer | ArrayBuffer | Uint8Array,
  originalName = "image"
): Promise<{ buffer: Buffer; contentType: "image/webp"; filename: string; size: number }> {
  const sharpModule = await import("sharp");
  const sharp = sharpModule.default;

  const source = Buffer.isBuffer(input)
    ? input
    : Buffer.from(input instanceof ArrayBuffer ? new Uint8Array(input) : input);

  const meta = await sharp(source, { failOn: "none" }).rotate().metadata();
  const width = meta.width ?? MAX_EDGE_PX;
  const height = meta.height ?? MAX_EDGE_PX;
  const longest = Math.max(width, height);

  let edge = Math.min(longest, MAX_EDGE_PX);
  let best: Buffer | null = null;

  while (edge >= MIN_EDGE_PX) {
    let low = MIN_QUALITY;
    let high = MAX_QUALITY;
    let candidate: Buffer | null = null;

    while (low <= high) {
      const quality = Math.floor((low + high) / 2);
      const encoded = await encodeWebp(sharp, source, width, height, longest, edge, quality);

      if (encoded.byteLength <= IMAGE_TARGET_MAX_BYTES) {
        candidate = encoded;
        low = quality + 1;
      } else {
        high = quality - 1;
      }
    }

    if (candidate) {
      best = candidate;
      break;
    }

    edge = Math.floor(edge * 0.75);
  }

  if (!best) {
    best = await encodeWebp(sharp, source, width, height, longest, MIN_EDGE_PX, MIN_QUALITY);
  }

  if (best.byteLength > IMAGE_TARGET_MAX_BYTES) {
    throw new Error("IMAGE_COMPRESS_FAILED");
  }

  const base =
    originalName.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9._-]/g, "_") || "image";

  return {
    buffer: best,
    contentType: "image/webp",
    filename: `${base}.webp`,
    size: best.byteLength,
  };
}

async function encodeWebp(
  sharp: typeof import("sharp").default,
  source: Buffer,
  width: number,
  height: number,
  longest: number,
  edge: number,
  quality: number
): Promise<Buffer> {
  let pipeline = sharp(source, { failOn: "none" }).rotate();

  if (edge < longest) {
    pipeline = pipeline.resize({
      width: width >= height ? edge : undefined,
      height: height > width ? edge : undefined,
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  return pipeline.webp({ quality, effort: 4 }).toBuffer();
}
