import { CameraFrame, FaceBox } from "../../types/face";
import { loadDetectorModel, runDetectorModel } from "../../native/tflite/TFLiteBridge";
import { runtimeConfig } from "../config/runtimeConfig";
import { thresholds } from "../config/thresholds";
import { logInfo } from "../utils/logger";

export async function detectFace(frame: CameraFrame): Promise<
  | { hasFace: false; score: number }
  | { hasFace: true; score: number; box: FaceBox }
> {
  const model = await loadDetectorModel();
  if (runtimeConfig.debugDetector) {
    logInfo(
      `Detector input shape: ${JSON.stringify(model.inputs[0]?.shape ?? [])}`
    );
    logInfo(
      `Detector output shapes: ${JSON.stringify(
        model.outputs.map((output) => output.shape)
      )}`
    );
  }
  const input = createModelInput(frame, model.inputs[0]?.shape ?? []);
  const outputs = await runDetectorModel(input);
  if (runtimeConfig.debugDetector) {
    logInfo(
      `Detector outputs lengths: ${outputs.map((o) => o.length).join(",")}`
    );
  }
  const parsed = parseDetectorOutputs(outputs, frame);

  if (!parsed) {
    return { hasFace: false, score: 0 };
  }

  if (runtimeConfig.debugDetector) {
    logInfo(`Detector best score: ${parsed.score.toFixed(4)}`);
  }

  if (parsed.score < thresholds.faceDetection) {
    return { hasFace: false, score: parsed.score };
  }

  return { hasFace: true, score: parsed.score, box: parsed.box };
}

function createModelInput(frame: CameraFrame, shape: number[]): Float32Array {
  if (shape.length === 4 && shape[0] === 1 && shape[3] === 3) {
    const targetHeight = shape[1];
    const targetWidth = shape[2];
    const expectedRgb = frame.width * frame.height * 3;
    const expectedRgba = frame.width * frame.height * 4;
    const sourceChannels =
      frame.data.length === expectedRgba
        ? 4
        : frame.data.length === expectedRgb
          ? 3
          : 0;

    if (sourceChannels === 3 || sourceChannels === 4) {
      return resizeToRgbInput(
        frame,
        targetWidth,
        targetHeight,
        sourceChannels
      );
    }
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

function parseDetectorOutputs(
  outputs: Float32Array[],
  frame: CameraFrame
): { score: number; box: FaceBox } | null {
  if (outputs.length === 0) {
    return null;
  }

  const { boxOutput, scoreOutput, anchorCount } = pickDetectorOutputs(outputs);
  if (!boxOutput || !scoreOutput || anchorCount === 0) {
    return null;
  }

  const scores = normalizeScores(scoreOutput);
  let bestIndex = 0;
  let bestScore = scores[0];
  for (let i = 1; i < scores.length; i += 1) {
    if (scores[i] > bestScore) {
      bestScore = scores[i];
      bestIndex = i;
    }
  }

  const stride = Math.max(4, Math.floor(boxOutput.length / anchorCount));
  const offset = bestIndex * stride;
  if (offset + 3 >= boxOutput.length) {
    return null;
  }

  const box = decodeBox(
    boxOutput,
    offset,
    frame.width,
    frame.height
  );

  return { score: bestScore, box };
}

function pickDetectorOutputs(outputs: Float32Array[]) {
  let boxOutput: Float32Array | null = null;
  let anchorCount = 0;

  for (const output of outputs) {
    if (output.length % 16 === 0 && output.length >= 16) {
      const count = Math.floor(output.length / 16);
      if (count > anchorCount) {
        anchorCount = count;
        boxOutput = output;
      }
    }
  }

  if (!boxOutput) {
    return { boxOutput: null, scoreOutput: null, anchorCount: 0 };
  }

  const scoreOutput = outputs.find(
    (output) => output.length === anchorCount
  );

  return { boxOutput, scoreOutput: scoreOutput ?? null, anchorCount };
}

function normalizeScores(scores: Float32Array): Float32Array {
  let needsSigmoid = false;
  for (let i = 0; i < Math.min(scores.length, 64); i += 1) {
    const value = scores[i];
    if (value < 0 || value > 1) {
      needsSigmoid = true;
      break;
    }
  }

  if (!needsSigmoid) {
    return scores;
  }

  const normalized = new Float32Array(scores.length);
  for (let i = 0; i < scores.length; i += 1) {
    normalized[i] = sigmoid(scores[i]);
  }
  return normalized;
}

function decodeBox(
  output: Float32Array,
  offset: number,
  frameWidth: number,
  frameHeight: number
): FaceBox {
  const raw0 = output[offset];
  const raw1 = output[offset + 1];
  const raw2 = output[offset + 2];
  const raw3 = output[offset + 3];

  let ymin = raw0;
  let xmin = raw1;
  let ymax = raw2;
  let xmax = raw3;

  const looksLikeCorners =
    raw0 >= 0 &&
    raw1 >= 0 &&
    raw2 >= 0 &&
    raw3 >= 0 &&
    raw2 >= raw0 &&
    raw3 >= raw1 &&
    raw2 <= 1.5 &&
    raw3 <= 1.5;

  if (!looksLikeCorners) {
    const cx = raw0;
    const cy = raw1;
    const w = Math.max(0.001, raw2);
    const h = Math.max(0.001, raw3);
    ymin = cy - h / 2;
    xmin = cx - w / 2;
    ymax = cy + h / 2;
    xmax = cx + w / 2;
  }

  ymin = clamp01(ymin);
  xmin = clamp01(xmin);
  ymax = clamp01(ymax);
  xmax = clamp01(xmax);

  if (xmax <= xmin || ymax <= ymin) {
    return {
      x: 0,
      y: 0,
      width: frameWidth,
      height: frameHeight,
    };
  }

  return {
    x: xmin * frameWidth,
    y: ymin * frameHeight,
    width: Math.max(1, (xmax - xmin) * frameWidth),
    height: Math.max(1, (ymax - ymin) * frameHeight),
  };
}

function sigmoid(value: number): number {
  if (value >= 0) {
    const z = Math.exp(-value);
    return 1 / (1 + z);
  }
  const z = Math.exp(value);
  return z / (1 + z);
}

function resizeToRgbInput(
  frame: CameraFrame,
  targetWidth: number,
  targetHeight: number,
  sourceChannels: number
): Float32Array {
  const input = new Float32Array(targetWidth * targetHeight * 3);
  const xScale = frame.width / targetWidth;
  const yScale = frame.height / targetHeight;

  for (let y = 0; y < targetHeight; y += 1) {
    const srcY = Math.min(frame.height - 1, Math.floor(y * yScale));
    for (let x = 0; x < targetWidth; x += 1) {
      const srcX = Math.min(frame.width - 1, Math.floor(x * xScale));
      const srcIndex = (srcY * frame.width + srcX) * sourceChannels;
      const dstIndex = (y * targetWidth + x) * 3;

      const r = frame.data[srcIndex] ?? 0;
      const g = frame.data[srcIndex + 1] ?? r;
      const b = frame.data[srcIndex + 2] ?? r;

      input[dstIndex] = normalizePixel(r);
      input[dstIndex + 1] = normalizePixel(g);
      input[dstIndex + 2] = normalizePixel(b);
    }
  }

  return input;
}

function normalizePixel(value: number): number {
  return value / 127.5 - 1;
}

function clamp01(value: number): number {
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}
