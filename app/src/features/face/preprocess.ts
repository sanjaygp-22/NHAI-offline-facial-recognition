import { CameraFrame, FaceBox, PreprocessResult } from "../../types/face";
import { detectFace } from "./detector";

export async function preprocessFrame(
  frame: CameraFrame
): Promise<PreprocessResult> {
  if (!frame.data || frame.data.length < 10) {
    return { status: "no_face" };
  }

  const stats = sampleFrameStats(frame.data);
  if (stats.variance < 250 || stats.mean < 10 || stats.mean > 245) {
    return { status: "low_quality", qualityScore: stats.qualityScore };
  }

  const detection = await detectFace(frame);
  if (!detection.hasFace) {
    return {
      status: "no_face",
      qualityScore: stats.qualityScore,
    };
  }

  const faceBox: FaceBox = detection.box;

  return {
    status: "ok",
    faceBox,
    qualityScore: stats.qualityScore,
  };
}

function sampleFrameStats(data: Uint8Array) {
  const sampleCount = Math.min(2048, data.length);
  const step = Math.max(1, Math.floor(data.length / sampleCount));
  let sum = 0;
  let sumSq = 0;
  let count = 0;

  for (let i = 0; i < data.length; i += step) {
    const value = data[i];
    sum += value;
    sumSq += value * value;
    count += 1;
  }

  const mean = sum / count;
  const variance = Math.max(0, sumSq / count - mean * mean);
  const qualityScore = Math.min(1, variance / 5000);

  return { mean, variance, qualityScore };
}
