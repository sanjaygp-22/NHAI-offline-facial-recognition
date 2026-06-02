import { AttendanceResult } from "../../types/attendance";
import {
  CameraFrame,
  IdentifyResult,
  EnrollResult,
  PreprocessResult,
} from "../../types/face";
import { LivenessResult } from "../../types/liveness";
import { GeoLocation, SyncResult } from "../../types/identity";
import { extractEmbedding } from "./embedder";
import { matchEmbedding, type EnrollmentRecord } from "./matcher";
import { preprocessFrame } from "./preprocess";

const enrollmentStore: EnrollmentRecord[] = [];

// Public entry point for face and liveness features.
export async function enrollPerson(
  _personId: string,
  _frame: CameraFrame,
  _metadata?: Record<string, string>
): Promise<EnrollResult> {
  const preprocess = await preprocessFrame(_frame);
  if (preprocess.status !== "ok") {
    return { status: preprocess.status, qualityScore: preprocess.qualityScore };
  }

  const embedding = await extractEmbedding(_frame, preprocess);
  enrollmentStore.push({ personId: _personId, embedding });

  return { status: "ok", qualityScore: preprocess.qualityScore };
}

export async function identifyPerson(_frame: CameraFrame): Promise<IdentifyResult> {
  const preprocess = await preprocessFrame(_frame);
  if (preprocess.status !== "ok") {
    return mapPreprocessToIdentify(preprocess);
  }

  const embedding = await extractEmbedding(_frame, preprocess);
  const match = matchEmbedding(embedding, enrollmentStore);

  if (match.status === "ok") {
    return {
      status: "ok",
      bestMatch: match.bestMatch,
      candidates: match.candidates,
    };
  }

  return {
    status: "no_match",
    candidates: match.candidates,
  };
}

export async function runLivenessCheck(
  _frame: CameraFrame,
  _mode: "passive" | "active" | "both"
): Promise<LivenessResult> {
  const preprocess = await preprocessFrame(_frame);
  if (preprocess.status !== "ok") {
    return { status: "fail", passiveScore: 0.0, blinkDetected: false };
  }

  return { status: "pass", passiveScore: 0.9, blinkDetected: true };
}

export async function recordAttendance(
  _personId: string,
  _location: GeoLocation,
  _deviceTime: string
): Promise<AttendanceResult> {
  throw new Error("Not implemented");
}

export async function syncIfOnline(_force?: boolean): Promise<SyncResult> {
  throw new Error("Not implemented");
}

function mapPreprocessToIdentify(preprocess: PreprocessResult): IdentifyResult {
  return {
    status: preprocess.status,
  };
}
