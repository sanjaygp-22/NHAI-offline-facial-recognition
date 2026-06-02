# Liveness Design

## Overview
Liveness uses a two-step approach:
1) Passive liveness (MiniFASNet) on continuous frames.
2) Active blink challenge as final confirmation.

## Passive Liveness
- Model: MiniFASNet (TFLite).
- Input: aligned face crop.
- Output: spoof probability.
- Pass threshold configurable via `thresholds.json`.

## Active Liveness (Blink)
- Triggered only if passive liveness passes.
- Blink detection options:
  - Eye aspect ratio heuristic on landmarks.
  - Small lightweight blink classifier.
- Success criteria:
  - Blink detected within time window (e.g., 2.5s).
  - Single face visible during challenge.

## Anti-Spoof Measures
- Reject static image patterns and low texture variance.
- Check moire artifacts from screen replays.
- Require temporal change between frames.

## Failure Handling
- Passive fail: prompt user to retry.
- Blink fail: allow limited retries with cooldown.
- Multiple faces: abort and reset.

## Metrics
- APCER / BPCER on spoof datasets.
- Mean blink detection latency.
- Liveness pass rate under varying light.
