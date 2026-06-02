import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AttendanceScreen from "./screens/AttendanceScreen";
import EnrollScreen from "./screens/EnrollScreen";
import IdentifyScreen from "./screens/IdentifyScreen";

export type RootStackParamList = {
  Identify: undefined;
  Enroll: undefined;
  Attendance: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Identify"
        screenOptions={{
          headerStyle: { backgroundColor: "#101216" },
          headerTintColor: "#f7f1e8",
          headerTitleStyle: { fontFamily: "serif", fontWeight: "700" },
          contentStyle: { backgroundColor: "#0a0b0d" },
        }}
      >
        <Stack.Screen
          name="Identify"
          component={IdentifyScreen}
          options={{ title: "Field ID" }}
        />
        <Stack.Screen
          name="Enroll"
          component={EnrollScreen}
          options={{ title: "Enroll" }}
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
