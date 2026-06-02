# Integration Guide

## Overview
This guide shows how the React Native screens integrate with the offline pipeline.

## Entry Point
- Screens import only from `features/face/index.ts`.
- Internal modules are not used directly by screens.

## Enroll Flow
1. Capture camera frame.
2. Call `enrollPerson`.
3. Persist identity metadata and embeddings.

## Identify + Attendance Flow
1. Capture frame and call `runLivenessCheck`.
2. On pass, call `identifyPerson`.
3. Validate geofence via attendance service.
4. Record attendance and queue for sync.

## Sync Flow
- `syncIfOnline` is called on app resume or when connectivity changes.
- Purge manager removes records after confirmed upload.

## Configs
- Thresholds and policy are stored in `assets/configs`.
- Runtime config loaded at app startup.
