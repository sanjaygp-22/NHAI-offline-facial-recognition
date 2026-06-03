import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation";

export type DashboardScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "Dashboard"
>;

export default function DashboardScreen({ navigation }: DashboardScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Field Attendance</Text>
        <Text style={styles.subtitle}>
          Offline-first face verification for staff clock-in.
        </Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Quick Actions</Text>
        <Text style={styles.cardCopy}>
          Start a live attendance capture or enroll a new team member.
        </Text>
        <View style={styles.buttonStack}>
          <Pressable
            style={[styles.actionButton, styles.primaryButton]}
            onPress={() => navigation.navigate("Identify")}
          >
            <Text style={styles.primaryButtonText}>Attendance Now</Text>
          </Pressable>
          <Pressable
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => navigation.navigate("Enroll")}
          >
            <Text style={styles.secondaryButtonText}>Enroll Staff</Text>
          </Pressable>
        </View>
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerLabel}>Status</Text>
        <Text style={styles.footerValue}>Offline. 0 staff synced today.</Text>
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
  header: {
    marginTop: 16,
  },
  title: {
    fontSize: 28,
    color: "#12326b",
    fontFamily: "Georgia",
    fontWeight: "700",
  },
  subtitle: {
    marginTop: 8,
    color: "#4f6b9c",
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "AvenirNext-Regular",
  },
  card: {
    marginTop: 28,
    padding: 20,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e1e8f4",
    shadowColor: "#0d244a",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  cardTitle: {
    fontSize: 16,
    color: "#1d3f7a",
    letterSpacing: 0.3,
    fontFamily: "AvenirNext-DemiBold",
  },
  cardCopy: {
    marginTop: 8,
    color: "#4f6b9c",
    fontSize: 13,
    lineHeight: 18,
    fontFamily: "AvenirNext-Regular",
  },
  buttonStack: {
    marginTop: 16,
    gap: 12,
  },
  actionButton: {
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
  footer: {
    marginTop: "auto",
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: "#e1e8f4",
  },
  footerLabel: {
    color: "#7b92b7",
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase",
    fontFamily: "AvenirNext-Regular",
  },
  footerValue: {
    marginTop: 6,
    color: "#1d3f7a",
    fontSize: 14,
    fontFamily: "AvenirNext-Regular",
  },
});
