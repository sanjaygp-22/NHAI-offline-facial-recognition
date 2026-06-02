# Deployment Notes

## Platforms
- Android 8.0+ (min 3 GB RAM)
- iOS 12+

## Build Notes
- Bundle TFLite models under `app/assets/models`.
- Ensure `react-native-fast-tflite` is linked.
- Avoid network permissions for offline mode.

## Runtime Notes
- App must function with airplane mode enabled.
- Use background sync only when connectivity is available.

## Release Checklist
- Verify model sizes and total footprint.
- Run on-device latency benchmarks.
- Validate geofence accuracy in target zones.
- Confirm database encryption enabled.
