import React, { useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import CameraView, { type CameraViewHandle } from "../components/CameraView";
import type { RootStackParamList } from "../navigation";
import { identifyPerson, runLivenessCheck } from "../../features/face";

export type IdentifyScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "Identify"
>;

export default function IdentifyScreen({ navigation }: IdentifyScreenProps) {
  const cameraRef = useRef<CameraViewHandle>(null);
  const [isRunning, setIsRunning] = useState(false);

  async function handleIdentify() {
    if (isRunning) {
      return;
    }

    setIsRunning(true);
    try {
      const frame = await cameraRef.current?.captureFrame();
      if (!frame) {
        navigation.navigate("IdentifyResult", {
          livenessStatus: "fail",
          matchStatus: "no_face",
        });
        return;
      }

      const liveness = await runLivenessCheck(frame, "both");
      if (liveness.status !== "pass") {
        navigation.navigate("IdentifyResult", {
          livenessStatus: liveness.status,
          livenessScore: liveness.passiveScore,
          matchStatus: "liveness_failed",
        });
        return;
      }

      const result = await identifyPerson(frame);
      navigation.navigate("IdentifyResult", {
        livenessStatus: liveness.status,
        livenessScore: liveness.passiveScore,
        matchStatus: result.status,
        bestMatchId: result.bestMatch?.personId,
        bestMatchScore: result.bestMatch?.score,
      });
    } catch (error) {
      navigation.navigate("IdentifyResult", {
        livenessStatus: "fail",
        matchStatus: "no_face",
      });
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
          <Text style={styles.topTitle}>Attendance Capture</Text>
        </View>
        <View style={styles.scanOverlay}>
          <Text style={styles.scanTitle}>Face forward</Text>
          <Text style={styles.scanSubtitle}>
            Blink once and keep your face centered.
          </Text>
        </View>
        <View style={styles.captureArea}>
          <Pressable
            style={styles.captureButton}
            onPress={handleIdentify}
            disabled={isRunning}
          >
            <View style={styles.captureInner} />
          </Pressable>
          <Text style={styles.captureLabel}>
            {isRunning ? "Scanning..." : "Tap to capture"}
          </Text>
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
    letterSpacing: 0.2,
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
});
