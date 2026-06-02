import { CameraFrame, FaceBox } from "../../types/face";
import { loadDetectorModel, runDetectorModel } from "../../native/tflite/TFLiteBridge";
import { runtimeConfig } from "../config/runtimeConfig";
import { logInfo } from "../utils/logger";

const SCORE_THRESHOLD = 0.6;

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

  if (parsed.score < SCORE_THRESHOLD) {
    return { hasFace: false, score: parsed.score };
  }

  return { hasFace: true, score: parsed.score, box: parsed.box };
}

function createModelInput(frame: CameraFrame, shape: number[]): Float32Array {
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

  const scores = pickScores(outputs);
  if (!scores || scores.length === 0) {
    return null;
  }

  let bestIndex = 0;
  let bestScore = scores[0];
  for (let i = 1; i < scores.length; i += 1) {
    if (scores[i] > bestScore) {
      bestScore = scores[i];
      bestIndex = i;
    }
  }

  const boxes = pickBoxes(outputs, scores.length);
  if (!boxes || boxes.length < 4) {
    return null;
  }

  const stride = Math.max(4, Math.floor(boxes.length / scores.length));
  const offset = bestIndex * stride;
  if (offset + 3 >= boxes.length) {
    return null;
  }

  const ymin = clamp01(boxes[offset]);
  const xmin = clamp01(boxes[offset + 1]);
  const ymax = clamp01(boxes[offset + 2]);
  const xmax = clamp01(boxes[offset + 3]);

  const box: FaceBox = {
    x: xmin * frame.width,
    y: ymin * frame.height,
    width: Math.max(1, (xmax - xmin) * frame.width),
    height: Math.max(1, (ymax - ymin) * frame.height),
  };

  return { score: bestScore, box };
}

function pickScores(outputs: Float32Array[]): Float32Array | null {
  let best: Float32Array | null = null;
  let bestVariance = 0;

  for (const output of outputs) {
    if (output.length < 5) {
      continue;
    }

    const variance = estimateVariance(output);
    const max = maxValue(output);
    if (max <= 1.2 && variance > bestVariance) {
      bestVariance = variance;
      best = output;
    }
  }

  return best ?? outputs[0];
}

function pickBoxes(outputs: Float32Array[], scoreCount: number): Float32Array | null {
  for (const output of outputs) {
    if (output.length >= scoreCount * 4 && output.length % scoreCount === 0) {
      return output;
    }
  }

  for (const output of outputs) {
    if (output.length % 4 === 0 && output.length >= 4) {
      return output;
    }
  }

  return null;
}

function estimateVariance(values: Float32Array): number {
  const sampleCount = Math.min(128, values.length);
  let sum = 0;
  let sumSq = 0;

  for (let i = 0; i < sampleCount; i += 1) {
    const value = values[i];
    sum += value;
    sumSq += value * value;
  }

  const mean = sum / sampleCount;
  return Math.max(0, sumSq / sampleCount - mean * mean);
}

function maxValue(values: Float32Array): number {
  let max = values[0];
  for (let i = 1; i < values.length; i += 1) {
    if (values[i] > max) {
      max = values[i];
    }
  }
  return max;
}

function clamp01(value: number): number {
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}
