import path from "node:path";

export const ORIGINALS_PREFIX = "originals/";
export const RESIZED_PREFIX = "resized/";

export type SupportedContentType = "image/jpeg" | "image/png";

const CONTENT_TYPE_BY_EXTENSION: Readonly<Record<string, SupportedContentType>> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
};

export function decodeS3Key(encodedKey: string): string {
  return decodeURIComponent(encodedKey.replace(/\+/g, " "));
}

export function isOriginalKey(key: string): boolean {
  return key.startsWith(ORIGINALS_PREFIX) && !key.startsWith(RESIZED_PREFIX);
}

export function getContentTypeFromKey(key: string): SupportedContentType | undefined {
  return CONTENT_TYPE_BY_EXTENSION[path.posix.extname(key).toLowerCase()];
}

export function createResizedKey(originalKey: string): string {
  if (!isOriginalKey(originalKey)) {
    throw new Error(`La key no pertenece a ${ORIGINALS_PREFIX}: ${originalKey}`);
  }

  const relativeKey = originalKey.slice(ORIGINALS_PREFIX.length);
  const extension = path.posix.extname(relativeKey);
  const baseName = relativeKey.slice(0, -extension.length);

  if (!baseName || !extension) {
    throw new Error(`No se puede construir una key de salida para: ${originalKey}`);
  }

  return `${RESIZED_PREFIX}${baseName}-resized${extension.toLowerCase()}`;
}
