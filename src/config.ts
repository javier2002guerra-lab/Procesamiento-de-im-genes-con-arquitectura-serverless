const DEFAULT_IMAGE_WIDTH = 800;
const DEFAULT_IMAGE_HEIGHT = 600;
const MAX_IMAGE_DIMENSION = 10_000;

export interface ImageDimensions {
  width: number;
  height: number;
}

function readPositiveInteger(value: string | undefined, fallback: number): number {
  if (value === undefined || value.trim() === "") {
    return fallback;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0 || parsed > MAX_IMAGE_DIMENSION) {
    console.warn(
      `Dimensión inválida "${value}"; se utilizará el valor predeterminado ${fallback}.`,
    );
    return fallback;
  }

  return parsed;
}

export function getImageDimensions(): ImageDimensions {
  return {
    width: readPositiveInteger(process.env.IMAGE_WIDTH, DEFAULT_IMAGE_WIDTH),
    height: readPositiveInteger(process.env.IMAGE_HEIGHT, DEFAULT_IMAGE_HEIGHT),
  };
}
