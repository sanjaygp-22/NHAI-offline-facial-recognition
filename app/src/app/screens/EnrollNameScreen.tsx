import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation";

export type EnrollNameScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "EnrollName"
>;

export default function EnrollNameScreen({
  navigation,
  route,
}: EnrollNameScreenProps) {
  const { personId, qualityScore } = route.params;
  const [name, setName] = useState("");

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Name the Enrolled Staff</Text>
        <Text style={styles.subtitle}>
          Save a recognizable label for this embedding.
        </Text>
        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>Staff Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter full name"
            placeholderTextColor="#93a7c6"
            value={name}
            onChangeText={setName}
          />
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Enrollment ID</Text>
          <Text style={styles.metaValue}>{personId}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Quality Score</Text>
          <Text style={styles.metaValue}>
            {typeof qualityScore === "number" ? qualityScore.toFixed(3) : "-"}
          </Text>
        </View>
      </View>
      <View style={styles.footer}>
        <Pressable
          style={[styles.button, styles.primaryButton]}
          onPress={() => navigation.navigate("Dashboard")}
        >
          <Text style={styles.primaryButtonText}>Save & Return</Text>
        </Pressable>
        <Pressable
          style={[styles.button, styles.secondaryButton]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.secondaryButtonText}>Back to Camera</Text>
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
  title: {
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
  fieldBlock: {
    marginTop: 16,
  },
  fieldLabel: {
    color: "#7b92b7",
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase",
    fontFamily: "AvenirNext-Regular",
  },
  input: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#d7e0ef",
    backgroundColor: "#f7f9fd",
    color: "#12326b",
    fontSize: 15,
    fontFamily: "AvenirNext-Regular",
  },
  metaRow: {
    marginTop: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#eef2f8",
  },
  metaLabel: {
    color: "#7b92b7",
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    fontFamily: "AvenirNext-Regular",
  },
  metaValue: {
    marginTop: 4,
    color: "#1d3f7a",
    fontSize: 15,
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
