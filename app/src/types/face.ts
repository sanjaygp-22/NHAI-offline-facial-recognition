export type CameraFrame = {
  width: number;
  height: number;
  format: "rgb" | "yuv";
  data: Uint8Array;
};

export type FaceBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type PreprocessResult = {
  status: "ok" | "no_face" | "low_quality" | "multiple_faces";
  faceBox?: FaceBox;
  qualityScore?: number;
};

export type FaceEmbedding = {
  vector: number[];
  source: PreprocessResult["status"];
};

export type IdentifyCandidate = {
  personId: string;
  score: number;
};

export type IdentifyResult = {
  status:
    | "ok"
    | "no_face"
    | "low_quality"
    | "multiple_faces"
    | "liveness_failed"
    | "no_match";
  bestMatch?: IdentifyCandidate;
  candidates?: IdentifyCandidate[];
};

export type MatchResult = {
  status: "ok" | "no_match" | "empty_gallery";
  bestMatch?: IdentifyCandidate;
  candidates?: IdentifyCandidate[];
};

export type EnrollResult = {
  status: "ok" | "no_face" | "low_quality" | "multiple_faces";
  qualityScore?: number;
};
