import { CameraFrame, FaceBox, FaceEmbedding, PreprocessResult } from "../../types/face";
import { loadEmbeddingModel, runEmbeddingModel } from "../../native/tflite/TFLiteBridge";

export async function extractEmbedding(
  frame: CameraFrame,
  preprocess: PreprocessResult
): Promise<FaceEmbedding> {
  const model = await loadEmbeddingModel();
  const input = createModelInput(
    frame,
    preprocess.faceBox,
    model.inputs[0]?.shape ?? []
  );
  const output = await runEmbeddingModel(input);

  const normalized = l2Normalize(output);

  return {
    vector: Array.from(normalized),
    source: preprocess.status,
  };
}

function createModelInput(
  frame: CameraFrame,
  faceBox: FaceBox | undefined,
  shape: number[]
): Float32Array {
  if (shape.length === 4 && shape[0] === 1 && shape[3] === 3) {
    const targetHeight = shape[1];
    const targetWidth = shape[2];
    return cropAndResizeToInput(
      frame,
      faceBox,
      targetWidth,
      targetHeight
    );
  }

  const flatSize = shape.length > 0 ? shape.reduce((a, b) => a * b, 1) : 0;
  const targetSize = flatSize > 0 ? flatSize : frame.data.length;
  const input = new Float32Array(targetSize);

  for (let i = 0; i < targetSize; i += 1) {
    const value = frame.data[i % frame.data.length];
    input[i] = value / 255;
  }

  return input;
}

function l2Normalize(values: Float32Array): Float32Array {
  let norm = 0;
  for (let i = 0; i < values.length; i += 1) {
    const value = values[i];
    norm += value * value;
  }

  if (norm <= 0) {
    return values;
  }

  const inv = 1 / Math.sqrt(norm);
  const normalized = new Float32Array(values.length);
  for (let i = 0; i < values.length; i += 1) {
    normalized[i] = values[i] * inv;
  }
  return normalized;
}

function cropAndResizeToInput(
  frame: CameraFrame,
  faceBox: FaceBox | undefined,
  targetWidth: number,
  targetHeight: number
): Float32Array {
  const input = new Float32Array(targetWidth * targetHeight * 3);
  const crop = getAlignedCrop(frame, faceBox);
  const xScale = crop.width / targetWidth;
  const yScale = crop.height / targetHeight;

  for (let y = 0; y < targetHeight; y += 1) {
    const srcY = Math.min(
      frame.height - 1,
      Math.floor(crop.y + y * yScale)
    );
    for (let x = 0; x < targetWidth; x += 1) {
      const srcX = Math.min(
        frame.width - 1,
        Math.floor(crop.x + x * xScale)
      );
      const srcIndex = (srcY * frame.width + srcX) * 3;
      const dstIndex = (y * targetWidth + x) * 3;

      const r = frame.data[srcIndex] ?? 0;
      const g = frame.data[srcIndex + 1] ?? r;
      const b = frame.data[srcIndex + 2] ?? r;

      input[dstIndex] = r / 255;
      input[dstIndex + 1] = g / 255;
      input[dstIndex + 2] = b / 255;
    }
  }

  return input;
}

function getAlignedCrop(
  frame: CameraFrame,
  faceBox: FaceBox | undefined
): FaceBox {
  if (!faceBox) {
    return {
      x: 0,
      y: 0,
      width: frame.width,
      height: frame.height,
    };
  }

  const centerX = faceBox.x + faceBox.width / 2;
  const centerY = faceBox.y + faceBox.height / 2;
  const size = Math.max(faceBox.width, faceBox.height) * 1.25;
  const half = size / 2;
  const x = clamp(centerX - half, 0, frame.width - 1);
  const y = clamp(centerY - half, 0, frame.height - 1);
  const maxWidth = frame.width - x;
  const maxHeight = frame.height - y;
  const width = Math.min(size, maxWidth);
  const height = Math.min(size, maxHeight);

  return {
    x,
    y,
    width,
    height,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
