import type { S3Event, S3EventRecord } from "aws-lambda";
import { getImageDimensions } from "./config";
import { resizeImage } from "./imageProcessor";
import { downloadObject, uploadObject } from "./s3Service";
import {
  createResizedKey,
  decodeS3Key,
  getContentTypeFromKey,
  isOriginalKey,
} from "./utils";

interface RecordResult {
  status: "processed" | "ignored";
  inputKey: string;
  outputKey?: string;
}

function errorDetails(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return { message: String(error) };
}

async function processRecord(
  record: S3EventRecord,
  recordNumber: number,
): Promise<RecordResult> {
  const bucket = record.s3.bucket.name;
  const key = decodeS3Key(record.s3.object.key);

  console.log("Registro S3 recibido.", {
    recordNumber,
    bucket,
    originalKey: key,
    eventName: record.eventName,
  });

  if (!isOriginalKey(key)) {
    console.log("Registro ignorado: la key no pertenece a originals/.", {
      recordNumber,
      key,
    });
    return { status: "ignored", inputKey: key };
  }

  const expectedContentType = getContentTypeFromKey(key);
  if (!expectedContentType) {
    console.log("Registro ignorado: extensión no compatible.", {
      recordNumber,
      key,
      supportedExtensions: [".jpg", ".jpeg", ".png"],
    });
    return { status: "ignored", inputKey: key };
  }

  const dimensions = getImageDimensions();
  const outputKey = createResizedKey(key);

  console.log("Configuración de procesamiento.", {
    recordNumber,
    expectedContentType,
    width: dimensions.width,
    height: dimensions.height,
    outputKey,
  });

  const downloaded = await downloadObject(bucket, key);
  console.log("Descarga desde S3 confirmada.", {
    recordNumber,
    bucket,
    key,
    bytes: downloaded.body.length,
    declaredContentType: downloaded.declaredContentType ?? "no informado",
  });

  const processed = await resizeImage(
    downloaded.body,
    dimensions,
    expectedContentType,
  );
  console.log("Procesamiento con Sharp confirmado.", {
    recordNumber,
    detectedContentType: processed.contentType,
    sourceDimensions: `${processed.sourceWidth ?? "?"}x${processed.sourceHeight ?? "?"}`,
    outputDimensions: `${processed.outputWidth}x${processed.outputHeight}`,
    outputBytes: processed.body.length,
  });

  await uploadObject(
    bucket,
    outputKey,
    processed.body,
    processed.contentType,
  );
  console.log("Guardado en S3 confirmado.", {
    recordNumber,
    bucket,
    outputKey,
    contentType: processed.contentType,
  });

  return { status: "processed", inputKey: key, outputKey };
}

export async function handler(event: S3Event): Promise<void> {
  const records = event.Records ?? [];
  console.log("Inicio de ejecución de umg-image-resizer.", {
    recordCount: records.length,
  });

  const results: RecordResult[] = [];
  const failures: Error[] = [];

  for (const [index, record] of records.entries()) {
    try {
      results.push(await processRecord(record, index + 1));
    } catch (error: unknown) {
      console.error("Error al procesar registro S3.", {
        recordNumber: index + 1,
        bucket: record.s3?.bucket?.name,
        encodedKey: record.s3?.object?.key,
        error: errorDetails(error),
      });
      failures.push(
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }

  console.log("Fin de ejecución de umg-image-resizer.", {
    processed: results.filter((result) => result.status === "processed").length,
    ignored: results.filter((result) => result.status === "ignored").length,
    failed: failures.length,
    results,
  });

  if (failures.length > 0) {
    throw new AggregateError(
      failures,
      `${failures.length} de ${records.length} registro(s) no pudieron procesarse.`,
    );
  }
}
