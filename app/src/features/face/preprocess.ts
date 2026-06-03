import { CameraFrame, FaceBox, PreprocessResult } from "../../types/face";
import { thresholds } from "../config/thresholds";
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
  if (!isFaceBoxValid(frame, faceBox)) {
    return {
      status: "no_face",
      qualityScore: stats.qualityScore,
    };
  }

  return {
    status: "ok",
    faceBox,
    qualityScore: stats.qualityScore,
  };
}

function isFaceBoxValid(frame: CameraFrame, box: FaceBox): boolean {
  if (box.width <= 0 || box.height <= 0) {
    return false;
  }

  const minSize =
    Math.min(frame.width, frame.height) * thresholds.faceMinRelativeSize;
  if (box.width < minSize || box.height < minSize) {
    return false;
  }

  const aspect = box.width / box.height;
  if (aspect < thresholds.faceAspectMin || aspect > thresholds.faceAspectMax) {
    return false;
  }

  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;
  const dx = Math.abs(centerX - frame.width / 2) / frame.width;
  const dy = Math.abs(centerY - frame.height / 2) / frame.height;
  if (dx > thresholds.faceCenterTolerance || dy > thresholds.faceCenterTolerance) {
    return false;
  }

  return true;
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
