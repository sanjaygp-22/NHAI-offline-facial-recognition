import React, { useEffect, useImperativeHandle, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  usePhotoOutput,
} from "react-native-vision-camera";
import type { PixelFormat, RawPixelData } from "react-native-nitro-image";
import type { CameraFrame } from "../../types/face";
import { logInfo } from "../../features/utils/logger";

export type CameraViewHandle = {
  captureFrame: () => Promise<CameraFrame>;
};

const CameraView = React.forwardRef<CameraViewHandle>((_, ref) => {
  const [isRequesting, setIsRequesting] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { hasPermission, requestPermission } = useCameraPermission();
  const [cameraPosition, setCameraPosition] = useState<"back" | "front">(
    "front"
  );
  const cameraDevice = useCameraDevice(cameraPosition);
  const photoOutput = usePhotoOutput();

  useImperativeHandle(ref, () => ({
    async captureFrame(): Promise<CameraFrame> {
      if (!cameraDevice) {
        throw new Error("Camera not ready");
      }

      const photo = await photoOutput.capturePhoto({}, {});
      let width = photo.width;
      let height = photo.height;
      let rawData: RawPixelData | null = null;
      let rawBytes: Uint8Array;

      if (photo.hasPixelBuffer) {
        const pixelBuffer = photo.getPixelBuffer();
        const expectedRgb = photo.width * photo.height * 3;
        const expectedRgba = photo.width * photo.height * 4;
        logInfo(
          `Capture bytes: ${pixelBuffer.byteLength} (expected ${expectedRgb} or ${expectedRgba})`
        );

        if (
          pixelBuffer.byteLength === expectedRgb ||
          pixelBuffer.byteLength === expectedRgba
        ) {
          rawBytes = new Uint8Array(pixelBuffer);
        } else {
          const image = await photo.toImageAsync();
          rawData = await image.toRawPixelDataAsync(false);
          image.dispose();
          width = rawData.width;
          height = rawData.height;
          rawBytes = new Uint8Array(rawData.buffer);
        }
      } else {
        const image = await photo.toImageAsync();
        rawData = await image.toRawPixelDataAsync(false);
        image.dispose();
        width = rawData.width;
        height = rawData.height;
        rawBytes = new Uint8Array(rawData.buffer);
      }

      const pixelFormat: PixelFormat = rawData?.pixelFormat ?? "RGB";
      if (rawData) {
        logInfo(
          `Capture raw pixel format: ${pixelFormat} (${rawBytes.length} bytes)`
        );
      }

      const rgbBytes = toRgbBytes(rawBytes, pixelFormat);
      const frame: CameraFrame = {
        width,
        height,
        format: "rgb",
        data: rgbBytes,
      };

      photo.dispose();
      return frame;
    },
  }));

  useEffect(() => {
    let isMounted = true;

    async function requestPermissionIfNeeded() {
      if (hasPermission) {
        setIsRequesting(false);
        return;
      }

      try {
        await requestPermission();
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setErrorMessage(
          error instanceof Error ? error.message : "Camera permission failed."
        );
      } finally {
        if (isMounted) {
          setIsRequesting(false);
        }
      }
    }

    requestPermissionIfNeeded();

    return () => {
      isMounted = false;
    };
  }, [hasPermission, requestPermission]);

  if (isRequesting) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.statusText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View style={styles.center}>
        <Text style={styles.statusText}>Camera error:</Text>
        <Text style={styles.statusText}>{errorMessage}</Text>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={styles.center}>
        <Text style={styles.statusText}>
          Camera permission denied. Please enable it in settings.
        </Text>
      </View>
    );
  }

  if (!cameraDevice) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.statusText}>Loading camera...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={cameraDevice}
        isActive={true}
        outputs={[photoOutput]}
      />
      <View style={styles.controls}>
        <Pressable
          style={styles.toggleButton}
          onPress={() =>
            setCameraPosition((current) =>
              current === "back" ? "front" : "back"
            )
          }
        >
          <Text style={styles.toggleText}>Swap</Text>
        </Pressable>
      </View>
    </View>
  );
});

CameraView.displayName = "CameraView";

export default CameraView;

function toRgbBytes(raw: Uint8Array, pixelFormat: PixelFormat): Uint8Array {
  if (pixelFormat === "RGB") {
    return raw;
  }

  if (pixelFormat === "BGR") {
    const rgb = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i += 3) {
      rgb[i] = raw[i + 2] ?? 0;
      rgb[i + 1] = raw[i + 1] ?? 0;
      rgb[i + 2] = raw[i] ?? 0;
    }
    return rgb;
  }

  const pixelCount = Math.floor(raw.length / 4);
  const rgb = new Uint8Array(pixelCount * 3);

  for (let i = 0; i < pixelCount; i += 1) {
    const base = i * 4;
    const out = i * 3;
    let r = raw[base];
    let g = raw[base + 1];
    let b = raw[base + 2];

    switch (pixelFormat) {
      case "BGRA":
      case "BGRX": {
        r = raw[base + 2];
        g = raw[base + 1];
        b = raw[base];
        break;
      }
      case "ARGB":
      case "XRGB": {
        r = raw[base + 1];
        g = raw[base + 2];
        b = raw[base + 3];
        break;
      }
      case "ABGR":
      case "XBGR": {
        r = raw[base + 3];
        g = raw[base + 2];
        b = raw[base + 1];
        break;
      }
      case "RGBA":
      case "RGBX": {
        r = raw[base];
        g = raw[base + 1];
        b = raw[base + 2];
        break;
      }
      default:
        break;
    }

    rgb[out] = r ?? 0;
    rgb[out + 1] = g ?? 0;
    rgb[out + 2] = b ?? 0;
  }

  return rgb;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "#000",
  },
  controls: {
    position: "absolute",
    top: 18,
    right: 18,
  },
  toggleButton: {
    height: 40,
    width: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderWidth: 1,
    borderColor: "rgba(31, 79, 191, 0.2)",
  },
  toggleText: {
    color: "#1f4fbf",
    fontSize: 11,
    letterSpacing: 0.3,
    fontFamily: "AvenirNext-DemiBold",
  },
  statusText: {
    color: "#fff",
    marginTop: 12,
    textAlign: "center",
  },
});
