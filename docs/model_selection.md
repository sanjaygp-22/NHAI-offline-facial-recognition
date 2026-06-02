# Model Selection

## Requirements
- Total model size < 20 MB.
- <1s inference end-to-end on 3 GB RAM devices.
- Fully offline runtime in React Native with TFLite.

## Selected Models (Initial)
- **Face Detection**: BlazeFace (TFLite).
- **Face Embedding**: MobileFaceNet (TFLite).
- **Passive Liveness**: MiniFASNet (TFLite).

## Export Pipeline
1. Train or fine-tune in PyTorch.
2. Export to ONNX for intermediate validation.
3. Convert to TFLite for mobile runtime.
4. Quantize (int8 or float16) if accuracy impact is acceptable.

## Model Size Budget (Target)
- Face detector: 1-2 MB.
- Embedding model: 5-8 MB.
- Liveness model: 3-6 MB.
- Total: < 20 MB.

## Evaluation Criteria
- Face detection recall on low light and outdoor conditions.
- Embedding accuracy (verification ROC, identification top-1).
- Liveness spoof rejection rate (print, screen, replay).
- Speed on Android 8.0 and iOS 12 devices.

## Open Items
- Decide final quantization approach after evaluation.
- Revisit detector if recall is insufficient in field lighting.
