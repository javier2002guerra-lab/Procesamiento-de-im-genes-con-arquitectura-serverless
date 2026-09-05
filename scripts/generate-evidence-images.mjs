import { mkdir } from "node:fs/promises";
import sharp from "sharp";

await mkdir("evidence/originals", { recursive: true });
await mkdir("evidence/results", { recursive: true });

const jpegSvg = `<svg width="1600" height="900" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#152a5b"/><stop offset="1" stop-color="#00a8a8"/></linearGradient></defs>
  <rect width="1600" height="900" fill="url(#g)"/><circle cx="1250" cy="220" r="150" fill="#ffd166"/>
  <text x="110" y="390" font-family="Arial" font-size="92" font-weight="bold" fill="white">PRUEBA SERVERLESS</text>
  <text x="115" y="505" font-family="Arial" font-size="48" fill="#d9f7ff">JPEG original - 1600 x 900</text>
  <text x="115" y="590" font-family="Arial" font-size="36" fill="white">Amazon S3 - Lambda - Sharp</text>
</svg>`;

const pngSvg = `<svg width="1200" height="1600" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#6a1b9a"/><stop offset="1" stop-color="#ff7043"/></linearGradient></defs>
  <rect width="1200" height="1600" fill="url(#g)"/><rect x="120" y="220" width="960" height="960" rx="70" fill="none" stroke="white" stroke-width="18"/>
  <text x="160" y="610" font-family="Arial" font-size="76" font-weight="bold" fill="white">PRUEBA PNG</text>
  <text x="160" y="735" font-family="Arial" font-size="48" fill="white">1200 x 1600</text>
  <text x="160" y="850" font-family="Arial" font-size="37" fill="white">Procesamiento real local con Sharp</text>
</svg>`;

const jpegOriginal = await sharp(Buffer.from(jpegSvg)).jpeg({ quality: 92 }).toBuffer();
const pngOriginal = await sharp(Buffer.from(pngSvg)).png().toBuffer();

await sharp(jpegOriginal).toFile("evidence/originals/prueba-serverless.jpg");
await sharp(pngOriginal).toFile("evidence/originals/prueba-serverless.png");

const jpegResult = await sharp(jpegOriginal)
  .resize({ width: 800, height: 600, fit: "inside", withoutEnlargement: true })
  .toBuffer();
const pngResult = await sharp(pngOriginal)
  .resize({ width: 800, height: 600, fit: "inside", withoutEnlargement: true })
  .toBuffer();

await sharp(jpegResult).toFile("evidence/results/prueba-serverless-resized.jpg");
await sharp(pngResult).toFile("evidence/results/prueba-serverless-resized.png");

for (const [label, buffer] of [
  ["JPEG original", jpegOriginal],
  ["JPEG procesado", jpegResult],
  ["PNG original", pngOriginal],
  ["PNG procesado", pngResult],
]) {
  const metadata = await sharp(buffer).metadata();
  console.log(`${label}: ${metadata.width}x${metadata.height}, ${metadata.format}, ${buffer.length} bytes`);
}
