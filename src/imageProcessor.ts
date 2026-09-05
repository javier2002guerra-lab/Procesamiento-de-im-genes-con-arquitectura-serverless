import sharp from "sharp";
import type { ImageDimensions } from "./config";
import type { SupportedContentType } from "./utils";

export interface ProcessedImage {
  body: Buffer;
  contentType: SupportedContentType;
  sourceWidth: number | undefined;
  sourceHeight: number | undefined;
  outputWidth: number;
  outputHeight: number;
}

function contentTypeForFormat(format: string | undefined): SupportedContentType {
  if (format === "jpeg") {
    return "image/jpeg";
  }

  if (format === "png") {
    return "image/png";
  }

  throw new Error(
    `Formato real no compatible: ${format ?? "desconocido"}. Solo se admiten JPEG y PNG.`,
  );
}

export async function resizeImage(
  input: Buffer,
  dimensions: ImageDimensions,
  expectedContentType: SupportedContentType,
): Promise<ProcessedImage> {
  const metadata = await sharp(input).metadata();
  const actualContentType = contentTypeForFormat(metadata.format);

  if (actualContentType !== expectedContentType) {
    throw new Error(
      `La extensión indica ${expectedContentType}, pero el contenido real es ${actualContentType}.`,
    );
  }

  const pipeline = sharp(input, { failOn: "error" })
    .rotate()
    .resize({
      width: dimensions.width,
      height: dimensions.height,
      fit: "inside",
      withoutEnlargement: true,
    });

  const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });

  return {
    body: data,
    contentType: actualContentType,
    sourceWidth: metadata.width,
    sourceHeight: metadata.height,
    outputWidth: info.width,
    outputHeight: info.height,
  };
}
