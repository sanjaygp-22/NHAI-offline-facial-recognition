import React, { useEffect, useImperativeHandle, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  usePhotoOutput,
} from "react-native-vision-camera";
import type { CameraFrame } from "../../types/face";

export type CameraViewHandle = {
  captureFrame: () => Promise<CameraFrame>;
};

const CameraView = React.forwardRef<CameraViewHandle>((_, ref) => {
  const [isRequesting, setIsRequesting] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { hasPermission, requestPermission } = useCameraPermission();
  const [cameraPosition, setCameraPosition] = useState<"back" | "front">(
    "back"
  );
  const cameraDevice = useCameraDevice(cameraPosition);
  const photoOutput = usePhotoOutput();

  useImperativeHandle(ref, () => ({
    async captureFrame(): Promise<CameraFrame> {
      if (!cameraDevice) {
        throw new Error("Camera not ready");
      }

      const photo = await photoOutput.capturePhoto({}, {});
      let pixelBuffer: ArrayBuffer;

      if (photo.hasPixelBuffer) {
        pixelBuffer = photo.getPixelBuffer();
      } else {
        pixelBuffer = photo.getFileData();
      }

      const frame: CameraFrame = {
        width: photo.width,
        height: photo.height,
        format: "rgb",
        data: new Uint8Array(pixelBuffer),
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
          <Text style={styles.toggleText}>
            {cameraPosition === "back" ? "Use Front" : "Use Back"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
});

CameraView.displayName = "CameraView";

export default CameraView;

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
    bottom: 24,
    left: 24,
    right: 24,
    alignItems: "center",
  },
  toggleButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: "rgba(10, 11, 13, 0.7)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  toggleText: {
    color: "#f7f1e8",
    fontSize: 13,
    letterSpacing: 0.4,
    fontFamily: "monospace",
  },
  statusText: {
    color: "#fff",
    marginTop: 12,
    textAlign: "center",
  },
});
