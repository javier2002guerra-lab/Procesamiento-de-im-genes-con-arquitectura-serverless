import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import type { SupportedContentType } from "./utils";

const s3Client = new S3Client({});

export interface DownloadedObject {
  body: Buffer;
  declaredContentType: string | undefined;
}

export async function downloadObject(
  bucket: string,
  key: string,
): Promise<DownloadedObject> {
  const response = await s3Client.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );

  if (!response.Body) {
    throw new Error(`S3 devolvió el objeto sin contenido: s3://${bucket}/${key}`);
  }

  const bytes = await response.Body.transformToByteArray();

  return {
    body: Buffer.from(bytes),
    declaredContentType: response.ContentType,
  };
}

export async function uploadObject(
  bucket: string,
  key: string,
  body: Buffer,
  contentType: SupportedContentType,
): Promise<void> {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
}
