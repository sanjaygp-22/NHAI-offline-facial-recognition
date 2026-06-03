import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation";

export type IdentifyResultScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "IdentifyResult"
>;

export default function IdentifyResultScreen({
  navigation,
  route,
}: IdentifyResultScreenProps) {
  const {
    livenessStatus,
    livenessScore,
    matchStatus,
    bestMatchId,
    bestMatchScore,
  } = route.params;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>Capture Complete</Text>
        </View>
        <Text style={styles.title}>Verification Summary</Text>
        <Text style={styles.subtitle}>
          Review the liveness and match confidence before recording attendance.
        </Text>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Liveness</Text>
          <Text style={styles.metricValue}>{livenessStatus}</Text>
        </View>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Liveness Score</Text>
          <Text style={styles.metricValue}>
            {typeof livenessScore === "number"
              ? livenessScore.toFixed(3)
              : "-"}
          </Text>
        </View>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Match</Text>
          <Text style={styles.metricValue}>{matchStatus}</Text>
        </View>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Best Match</Text>
          <Text style={styles.metricValue}>{bestMatchId ?? "-"}</Text>
        </View>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Match Score</Text>
          <Text style={styles.metricValue}>
            {typeof bestMatchScore === "number"
              ? bestMatchScore.toFixed(3)
              : "-"}
          </Text>
        </View>
      </View>
      <View style={styles.footer}>
        <Pressable
          style={[styles.button, styles.primaryButton]}
          onPress={() => navigation.navigate("Attendance")}
        >
          <Text style={styles.primaryButtonText}>Back to Attendance</Text>
        </Pressable>
        <Pressable
          style={[styles.button, styles.secondaryButton]}
          onPress={() => navigation.navigate("Dashboard")}
        >
          <Text style={styles.secondaryButtonText}>Back to Dashboard</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#f6f8fc",
  },
  card: {
    padding: 20,
    borderRadius: 22,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e1e8f4",
    shadowColor: "#0d244a",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#e6efff",
  },
  statusText: {
    color: "#1f4fbf",
    fontSize: 12,
    letterSpacing: 0.4,
    fontFamily: "AvenirNext-DemiBold",
  },
  title: {
    marginTop: 12,
    fontSize: 22,
    color: "#12326b",
    fontFamily: "Georgia",
    fontWeight: "700",
  },
  subtitle: {
    marginTop: 6,
    color: "#4f6b9c",
    fontSize: 13,
    lineHeight: 18,
    fontFamily: "AvenirNext-Regular",
  },
  metricRow: {
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#eef2f8",
  },
  metricLabel: {
    color: "#7b92b7",
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    fontFamily: "AvenirNext-Regular",
  },
  metricValue: {
    marginTop: 4,
    color: "#1d3f7a",
    fontSize: 16,
    fontFamily: "AvenirNext-DemiBold",
  },
  footer: {
    marginTop: "auto",
    gap: 12,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: "#1f4fbf",
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontFamily: "AvenirNext-DemiBold",
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#1f4fbf",
    backgroundColor: "#eef3ff",
  },
  secondaryButtonText: {
    color: "#1f4fbf",
    fontSize: 15,
    fontFamily: "AvenirNext-DemiBold",
  },
});
