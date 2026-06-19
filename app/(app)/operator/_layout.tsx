import { Stack } from "expo-router";

export default function OperatorLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#F6F7F9" }
      }}
    />
  );
}
