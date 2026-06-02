# Offline Face Recognition + Liveness Architecture

## Scope
This document describes the technical design for an entirely offline face recognition and liveness detection module integrated into a React Native app (Android 8.0+ / iOS 12+). It targets 1:N identification for field attendance with geofencing, local encryption, and optional background sync to AWS when connectivity returns.

## Goals
- Fully offline operation in zero-network zones.
- 1:N identification for enrolled personnel.
- Passive liveness (MiniFASNet) plus active blink challenge.
- Sub-1s end-to-end inference on 3GB RAM devices.
- Model size under 20 MB total.
- Accuracy target 95%+ on evaluation sets.
- React Native only for app runtime.

## Non-Goals
- Real-time video streaming to cloud.
- Storing raw face images after embeddings are created.
- Cross-device model retraining on-device.

## Constraints
- Submission deadline: June 5.
- Android 8.0+ and iOS 12+.
- Minimum 3 GB RAM.
- <1s inference per identification.
- <20 MB models total.
- Fully offline during operation.

## High-Level Architecture
```mermaid
flowchart LR
  A[Camera Frame] --> B[Face Detection]
  B --> C[Face Alignment]
  C --> D[Embedding Extractor]
  D --> E[Vector Index]
  C --> F[Liveness Passive]
  F --> G[Active Blink Challenge]
  E --> H[1:N Match]
  G --> I[Attendance Decision]
  H --> I
  I --> J[Geofence Validation]
  J --> K[Local Record Store]
  K --> L[Sync Queue]
  L --> M[AWS Upload (When Online)]
```

## Component Responsibilities
### React Native App
- Camera capture, UI, and user flows (enroll, identify, attendance).
- Calls only the `facePipeline.ts` entry point; no direct access to internals.
- Presents active liveness prompt (blink) and attendance feedback.

### Face Pipeline (offline)
- Face detection (lightweight TFLite model).
- Face alignment and normalization.
- Embedding extraction (MobileFaceNet or similar).
- 1:N similarity search against local embedding store.
- Passive liveness scoring (MiniFASNet).
- Active liveness confirmation (blink).

### Storage
- SQLite with AES-256 encryption for identities, embeddings, and attendance.
- No raw face images persisted after embedding creation.
- SHA-256 tamper hash on attendance records.

### Sync (when online)
- Connectivity watcher triggers background sync.
- Queue-based upload to AWS.
- Purge manager deletes uploaded records after verification.

### Attendance + Geofencing
- Attendance service requires both identity + liveness pass.
- Location service captures GPS at attendance time.
- Geofence validation determines if attendance is accepted.

## Data Flow
1. Capture frame from camera.
2. Run face detection and quality gating.
3. Align face and extract embedding.
4. Run passive liveness in parallel.
5. If passive score passes, request blink challenge.
6. On blink success, run 1:N match.
7. If similarity score passes threshold, confirm identity.
8. Validate geofence, then write attendance record.
9. Store record locally with hash; queue for sync.

## Offline ML Runtime
- ONNX is training/export format only.
- Models converted to TFLite for runtime.
- React Native uses `react-native-fast-tflite` for inference.
- All preprocessing and postprocessing runs locally.

## Security Model
- AES-256 encryption for local SQLite database.
- SHA-256 record hash to detect tampering.
- No raw face images stored after embedding extraction.
- Configurable retention for attendance records.

## Performance Strategy
- Quantized TFLite models where accuracy impact is acceptable.
- Face detector and liveness run on downscaled frames.
- Embedding extraction runs on aligned face crop only.
- Similarity search uses precomputed normalized embeddings.

## Failure Modes
- No face detected: prompt user to align face.
- Liveness failed: retry challenge with cooldown.
- Multiple faces detected: require single face in frame.
- Low quality: request better lighting or camera distance.
- Geofence failed: record event but mark invalid.

## Configurable Thresholds
- Face detection confidence.
- Passive liveness score.
- Blink success criteria.
- 1:N similarity threshold.
- Geofence radius and tolerance.

## Open Decisions
- Exact similarity search method (linear vs ANN depending on enrolled size).
- Blink detector implementation (eye aspect ratio vs small ML model).
- Final model selection based on evaluation results.
