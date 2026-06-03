import React, { useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation";
import { enrollPerson } from "../../features/face";
import type { EnrollResult } from "../../types/face";
import CameraView, { type CameraViewHandle } from "../components/CameraView";

export type EnrollScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "Enroll"
>;

export default function EnrollScreen({ navigation }: EnrollScreenProps) {
  const cameraRef = useRef<CameraViewHandle>(null);
  const [enrollResult, setEnrollResult] = useState<EnrollResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  async function handleEnroll() {
    if (isRunning) {
      return;
    }

    setIsRunning(true);
    const frame = await cameraRef.current?.captureFrame();
    if (!frame) {
      setEnrollResult({ status: "no_face" });
      setIsRunning(false);
      return;
    }
    const personId = `staff-${Date.now().toString().slice(-5)}`;

    try {
      const result = await enrollPerson(personId, frame, {
        source: "mock",
      });
      setEnrollResult(result);
      if (result.status === "ok") {
        navigation.navigate("EnrollName", {
          personId,
          qualityScore: result.qualityScore,
        });
      }
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.cameraWrap}>
        <CameraView ref={cameraRef} />
        <View style={styles.topBar}>
          <Pressable
            style={styles.backButton}
            onPress={() => navigation.navigate("Dashboard")}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </Pressable>
          <Text style={styles.topTitle}>Enroll Staff</Text>
        </View>
        <View style={styles.scanOverlay}>
          <Text style={styles.scanTitle}>Capture a clear face</Text>
          <Text style={styles.scanSubtitle}>
            Remove glasses, masks, or helmets before capture.
          </Text>
        </View>
        <View style={styles.captureArea}>
          <Pressable
            style={styles.captureButton}
            onPress={handleEnroll}
            disabled={isRunning}
          >
            <View style={styles.captureInner} />
          </Pressable>
          <Text style={styles.captureLabel}>
            {isRunning ? "Enrolling..." : "Tap to enroll"}
          </Text>
          {enrollResult?.status ? (
            <Text style={styles.captureStatus}>
              Last: {enrollResult.status}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f8fc",
  },
  cameraWrap: {
    flex: 1,
    position: "relative",
  },
  topBar: {
    position: "absolute",
    top: 14,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderWidth: 1,
    borderColor: "rgba(31, 79, 191, 0.2)",
  },
  backButtonText: {
    color: "#1f4fbf",
    fontSize: 12,
    fontFamily: "AvenirNext-DemiBold",
  },
  topTitle: {
    color: "#ffffff",
    fontSize: 14,
    fontFamily: "AvenirNext-DemiBold",
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  scanOverlay: {
    position: "absolute",
    top: 80,
    left: 18,
    right: 18,
    padding: 16,
    backgroundColor: "rgba(18, 50, 107, 0.55)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
  },
  scanTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontFamily: "Georgia",
    fontWeight: "700",
  },
  scanSubtitle: {
    color: "#e6efff",
    marginTop: 6,
    fontSize: 13,
    fontFamily: "AvenirNext-Regular",
  },
  captureArea: {
    position: "absolute",
    bottom: 36,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  captureButton: {
    height: 74,
    width: 74,
    borderRadius: 37,
    borderWidth: 3,
    borderColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(31, 79, 191, 0.25)",
  },
  captureInner: {
    height: 54,
    width: 54,
    borderRadius: 27,
    backgroundColor: "#ffffff",
  },
  captureLabel: {
    marginTop: 10,
    color: "#e6efff",
    fontSize: 13,
    fontFamily: "AvenirNext-Regular",
    textShadowColor: "rgba(0, 0, 0, 0.35)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  captureStatus: {
    marginTop: 6,
    color: "#ffffff",
    fontSize: 12,
    fontFamily: "AvenirNext-DemiBold",
    textShadowColor: "rgba(0, 0, 0, 0.35)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
