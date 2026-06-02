import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation";

export type AttendanceScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "Attendance"
>;

export default function AttendanceScreen({
  navigation,
}: AttendanceScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>Attendance Gate</Text>
        <Text style={styles.bannerText}>
          Identity and liveness checks must pass before the record is stored.
        </Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Geofence Status</Text>
        <Text style={styles.sectionValue}>Awaiting GPS lock...</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Session</Text>
        <Text style={styles.sectionValue}>Offline / Not synced</Text>
      </View>
      <View style={styles.footer}>
        <Pressable
          style={[styles.button, styles.secondaryButton]}
          onPress={() => navigation.navigate("Identify")}
        >
          <Text style={styles.secondaryButtonText}>Back to Camera</Text>
        </Pressable>
        <Pressable style={[styles.button, styles.primaryButton]}>
          <Text style={styles.primaryButtonText}>Confirm Attendance</Text>
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
  banner: {
    marginTop: 12,
    padding: 18,
    borderRadius: 18,
    backgroundColor: "#101216",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  bannerTitle: {
    color: "#f7f1e8",
    fontSize: 22,
    fontFamily: "serif",
    fontWeight: "700",
  },
  bannerText: {
    marginTop: 8,
    color: "#c9c1b4",
    fontSize: 13,
    lineHeight: 18,
    fontFamily: "monospace",
  },
  section: {
    marginTop: 18,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
  },
  sectionTitle: {
    color: "#ff6b35",
    fontSize: 12,
    fontFamily: "monospace",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  sectionValue: {
    marginTop: 6,
    color: "#f7f1e8",
    fontSize: 16,
    fontFamily: "serif",
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
