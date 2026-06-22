import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useLocalAuth } from "@/contexts/LocalAuthContext";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
const hasClerk = publishableKey.startsWith("pk_");

function AuthLayoutWithClerk() {
  const { useAuth } = require("@clerk/expo");
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#08080F" }}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  if (isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}

function AuthLayoutLocal() {
  const { isLoaded, isSignedIn } = useLocalAuth();

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#08080F" }}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  if (isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}

export default function AuthLayout() {
  if (hasClerk) return <AuthLayoutWithClerk />;
  return <AuthLayoutLocal />;
}
