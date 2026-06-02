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
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.cameraPreview}>
        <CameraView ref={cameraRef} />
      </View>
      <View style={styles.headerBlock}>
        <Text style={styles.title}>Enroll New Staff</Text>
        <Text style={styles.subtitle}>
          Capture a clear frontal photo. We store only embeddings and discard
          raw images.
        </Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Enrollment Checklist</Text>
        <View style={styles.list}>
          <Text style={styles.listItem}>• Neutral lighting, no glare</Text>
          <Text style={styles.listItem}>• Remove helmets and masks</Text>
          <Text style={styles.listItem}>• One face per frame</Text>
        </View>
        <View style={styles.resultBox}>
          <Text style={styles.resultLabel}>Last Enroll</Text>
          <Text style={styles.resultValue}>
            {enrollResult?.status ?? "idle"}
          </Text>
        </View>
      </View>
      <View style={styles.footer}>
        <Pressable
          style={[styles.button, styles.secondaryButton]}
          onPress={() => navigation.navigate("Identify")}
        >
          <Text style={styles.secondaryButtonText}>Back to Camera</Text>
        </Pressable>
        <Pressable style={[styles.button, styles.primaryButton]} onPress={handleEnroll}>
          <Text style={styles.primaryButtonText}>
            {isRunning ? "Enrolling..." : "Start Enroll"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#0a0b0d",
  },
  cameraPreview: {
    height: 220,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    marginBottom: 18,
  },
  headerBlock: {
    marginTop: 12,
  },
  title: {
    fontSize: 28,
    fontFamily: "serif",
    fontWeight: "700",
    color: "#f7f1e8",
  },
  subtitle: {
    marginTop: 8,
    color: "#c9c1b4",
    fontSize: 13,
    lineHeight: 19,
    fontFamily: "monospace",
  },
  card: {
    marginTop: 24,
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    backgroundColor: "#101216",
  },
  cardTitle: {
    color: "#ff6b35",
    fontSize: 16,
    fontFamily: "monospace",
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  list: {
    marginTop: 12,
    gap: 6,
  },
  listItem: {
    color: "#f7f1e8",
    fontSize: 13,
    fontFamily: "monospace",
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
  },
  resultValue: {
    color: "#f7f1e8",
    fontSize: 14,
    fontFamily: "monospace",
    marginTop: 6,
  },
  footer: {
    marginTop: "auto",
    gap: 12,
  },
  button: {
    paddingVertical: 14,
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
    borderColor: "#f7f1e8",
  },
  secondaryButtonText: {
    color: "#f7f1e8",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.3,
    fontFamily: "monospace",
  },
});
