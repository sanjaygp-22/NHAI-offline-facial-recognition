# Evaluation Plan

## Goals
- Verify accuracy, liveness robustness, and performance under constraints.
- Ensure <1s end-to-end identification.

## Datasets
- Face embedding validation set (internal or public).
- Liveness spoof set (print, screen, replay).
- Field-like camera samples (low light, outdoor, motion blur).

## Metrics
- Identification: top-1 accuracy, top-5 accuracy.
- Verification: ROC, FAR/FRR.
- Liveness: APCER, BPCER.
- Performance: end-to-end latency, FPS.
- Storage: model size, DB growth rate.

## Test Phases
1. Unit tests for preprocessing and scoring.
2. Model inference benchmarks on target devices.
3. End-to-end user flow tests (enroll, identify, attendance).
4. Offline mode tests with airplane mode enabled.

## Acceptance Criteria
- Accuracy >= 95% on evaluation set.
- Liveness false-accept rate within threshold.
- <1s identification on 3 GB RAM devices.
- All functions work with no network.
