import React, { useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import CameraView, { type CameraViewHandle } from "../components/CameraView";
import type { RootStackParamList } from "../navigation";
import { identifyPerson, runLivenessCheck } from "../../features/face";
import type { IdentifyResult, LivenessResult } from "../../types/face";

export type IdentifyScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "Identify"
>;

export default function IdentifyScreen({ navigation }: IdentifyScreenProps) {
  const cameraRef = useRef<CameraViewHandle>(null);
  const [identifyResult, setIdentifyResult] = useState<IdentifyResult | null>(
    null
  );
  const [livenessResult, setLivenessResult] = useState<LivenessResult | null>(
    null
  );
  const [isRunning, setIsRunning] = useState(false);

  async function handleIdentify() {
    if (isRunning) {
      return;
    }

    setIsRunning(true);
    setIdentifyResult(null);
    setLivenessResult(null);
    try {
      const frame = await cameraRef.current?.captureFrame();
      if (!frame) {
        setIdentifyResult({ status: "no_face" });
        return;
      }

      const liveness = await runLivenessCheck(frame, "both");
      setLivenessResult(liveness);
      if (liveness.status !== "pass") {
        setIdentifyResult({ status: "liveness_failed" });
        return;
      }

      const result = await identifyPerson(frame);
      setIdentifyResult(result);
    } catch (error) {
      setIdentifyResult({ status: "no_face" });
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.cameraWrap}>
        <CameraView ref={cameraRef} />
        <View style={styles.scanOverlay}>
          <Text style={styles.scanTitle}>Align Face</Text>
          <Text style={styles.scanSubtitle}>Blink to confirm liveness</Text>
        </View>
      </View>
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Live Identify</Text>
        <Text style={styles.panelCopy}>
          Camera is ready. Use the actions below to enroll new staff or mark
          attendance once matched.
        </Text>
        <View style={styles.resultBox}>
          <Text style={styles.resultLabel}>Liveness</Text>
          <Text style={styles.resultValue}>
            {livenessResult?.status ?? "idle"}
          </Text>
          <Text style={styles.resultLabel}>Identify</Text>
          <Text style={styles.resultValue}>
            {identifyResult?.status ?? "idle"}
          </Text>
          {identifyResult?.bestMatch ? (
            <Text style={styles.resultValue}>
              Match: {identifyResult.bestMatch.personId} ({
                identifyResult.bestMatch.score.toFixed(3)
              })
            </Text>
          ) : null}
        </View>
        <View style={styles.actions}>
          <Pressable
            style={[styles.actionButton, styles.primaryButton]}
            onPress={handleIdentify}
          >
            <Text style={styles.primaryButtonText}>
              {isRunning ? "Scanning..." : "Run Identify"}
            </Text>
          </Pressable>
          <Pressable
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => navigation.navigate("Enroll")}
          >
            <Text style={styles.secondaryButtonText}>Enroll Staff</Text>
          </Pressable>
          <Pressable
            style={[styles.actionButton, styles.ghostButton]}
            onPress={() => navigation.navigate("Attendance")}
          >
            <Text style={styles.ghostButtonText}>Go to Attendance</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0b0d",
  },
  cameraWrap: {
    flex: 1.2,
    position: "relative",
  },
  scanOverlay: {
    position: "absolute",
    top: 24,
    left: 24,
    right: 24,
    padding: 16,
    backgroundColor: "rgba(8, 10, 12, 0.6)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 18,
  },
  scanTitle: {
    color: "#f7f1e8",
    fontSize: 18,
    fontFamily: "serif",
    fontWeight: "700",
  },
  scanSubtitle: {
    color: "#c5b7a4",
    marginTop: 6,
    fontSize: 13,
    fontFamily: "monospace",
    letterSpacing: 0.5,
  },
  panel: {
    flex: 0.8,
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.08)",
    backgroundColor: "#101216",
  },
  panelTitle: {
    fontSize: 20,
    fontFamily: "serif",
    fontWeight: "700",
    color: "#f7f1e8",
  },
  panelCopy: {
    marginTop: 8,
    color: "#c9c1b4",
    fontSize: 13,
    lineHeight: 18,
    fontFamily: "monospace",
  },
  actions: {
    marginTop: 18,
    gap: 12,
  },
  resultBox: {
    marginTop: 16,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
  },
  resultLabel: {
    color: "#9e9487",
    fontSize: 12,
    fontFamily: "monospace",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 6,
  },
  resultValue: {
    color: "#f7f1e8",
    fontSize: 14,
    fontFamily: "monospace",
    marginTop: 4,
  },
  actionButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: "#ff6b35",
  },
  primaryButtonText: {
    color: "#0a0b0d",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.4,
    fontFamily: "monospace",
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#ff6b35",
    backgroundColor: "transparent",
  },
  secondaryButtonText: {
    color: "#ff6b35",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.3,
    fontFamily: "monospace",
  },
  ghostButton: {
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    backgroundColor: "transparent",
  },
  ghostButtonText: {
    color: "#f7f1e8",
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: 0.2,
    fontFamily: "monospace",
  },
});
