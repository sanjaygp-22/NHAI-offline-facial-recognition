# API Contract (React Native)

## Purpose
Defines the public interface the app uses to interact with the offline face and liveness pipeline. Screens should only call `facePipeline.ts` and not internal modules.

## Public Entry Points
All functions are implemented in `facePipeline.ts` and re-exported via `features/face/index.ts`.

### enrollPerson
- **Description**: Enroll a new person by capturing a face and storing the embedding.
- **Input**:
  - `personId: string`
  - `metadata?: Record<string, string>`
  - `frame: CameraFrame`
- **Output**:
  - `EnrollResult` with `status` and `qualityScore`.

### identifyPerson
- **Description**: 1:N identification against the local embedding store.
- **Input**:
  - `frame: CameraFrame`
- **Output**:
  - `IdentifyResult` with `status`, `candidates`, and `bestMatch`.

### runLivenessCheck
- **Description**: Runs passive liveness and optionally active blink challenge.
- **Input**:
  - `frame: CameraFrame`
  - `mode: "passive" | "active" | "both"`
- **Output**:
  - `LivenessResult` with `passiveScore`, `blinkDetected`, and `status`.

### recordAttendance
- **Description**: Create attendance record only after identity + liveness success.
- **Input**:
  - `personId: string`
  - `location: GeoLocation`
  - `deviceTime: string`
- **Output**:
  - `AttendanceResult` with `status` and `recordId`.

### syncIfOnline
- **Description**: Trigger background sync when connectivity is available.
- **Input**:
  - `force?: boolean`
- **Output**:
  - `SyncResult` with `status` and `counts`.

## Core Types
```ts
export type CameraFrame = {
  width: number;
  height: number;
  format: "rgb" | "yuv";
  data: Uint8Array;
};

export type IdentifyCandidate = {
  personId: string;
  score: number;
};

export type IdentifyResult = {
  status: "ok" | "no_face" | "low_quality" | "multiple_faces" | "liveness_failed";
  bestMatch?: IdentifyCandidate;
  candidates?: IdentifyCandidate[];
};

export type EnrollResult = {
  status: "ok" | "no_face" | "low_quality" | "multiple_faces";
  qualityScore?: number;
};

export type LivenessResult = {
  status: "pass" | "fail" | "retry";
  passiveScore?: number;
  blinkDetected?: boolean;
};

export type GeoLocation = {
  lat: number;
  lon: number;
  accuracyMeters?: number;
};

export type AttendanceResult = {
  status: "ok" | "geofence_failed" | "duplicate" | "error";
  recordId?: string;
};

export type SyncResult = {
  status: "idle" | "running" | "ok" | "error";
  counts?: { uploaded: number; failed: number; purged: number };
};
```

## Error Handling
- Functions return typed `status` values rather than throwing, unless a fatal error occurs.
- Fatal errors (DB corruption, model load failure) should surface as `error` status and be logged.

## Versioning
- API changes require updates to `api_contract.md` and `features/face/index.ts` exports.
