import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AttendanceScreen from "./screens/AttendanceScreen";
import DashboardScreen from "./screens/DashboardScreen";
import EnrollNameScreen from "./screens/EnrollNameScreen";
import EnrollScreen from "./screens/EnrollScreen";
import IdentifyResultScreen from "./screens/IdentifyResultScreen";
import IdentifyScreen from "./screens/IdentifyScreen";

export type RootStackParamList = {
  Dashboard: undefined;
  Identify: undefined;
  IdentifyResult: {
    livenessStatus: string;
    livenessScore?: number;
    matchStatus: string;
    bestMatchId?: string;
    bestMatchScore?: number;
  };
  Enroll: undefined;
  EnrollName: { personId: string; qualityScore?: number };
  Attendance: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Dashboard"
        screenOptions={{
          headerStyle: { backgroundColor: "#ffffff" },
          headerTintColor: "#1f4fbf",
          headerTitleStyle: {
            fontFamily: "Georgia",
            fontWeight: "700",
            color: "#1d3f7a",
          },
          contentStyle: { backgroundColor: "#f6f8fc" },
        }}
      >
        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{ title: "Dashboard" }}
        />
        <Stack.Screen
          name="Identify"
          component={IdentifyScreen}
          options={{ title: "Attendance", headerShown: false }}
        />
        <Stack.Screen
          name="IdentifyResult"
          component={IdentifyResultScreen}
          options={{ title: "Result" }}
        />
        <Stack.Screen
          name="Enroll"
          component={EnrollScreen}
          options={{ title: "Enroll", headerShown: false }}
        />
        <Stack.Screen
          name="EnrollName"
          component={EnrollNameScreen}
          options={{ title: "Name Staff" }}
        />
        <Stack.Screen
          name="Attendance"
          component={AttendanceScreen}
          options={{ title: "Attendance" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
