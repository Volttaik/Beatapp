import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { ClerkProvider, ClerkLoaded } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppearanceProvider } from "@/contexts/AppearanceContext";
import { DownloadProvider } from "@/contexts/DownloadContext";
import { LibraryProvider } from "@/contexts/LibraryContext";
import { LocalAuthProvider } from "@/contexts/LocalAuthContext";
import { PlayerProvider } from "@/contexts/PlayerContext";
import { PlaylistProvider } from "@/contexts/PlaylistContext";
import { StatsProvider } from "@/contexts/StatsContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
const proxyUrl = process.env.EXPO_PUBLIC_CLERK_PROXY_URL || undefined;
const hasClerk = publishableKey.startsWith("pk_");

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="player"
        options={{ presentation: "modal", headerShown: false, animation: "slide_from_bottom" }}
      />
      <Stack.Screen
        name="queue"
        options={{ presentation: "modal", headerShown: false, animation: "slide_from_bottom" }}
      />
      <Stack.Screen name="settings" options={{ headerShown: false, animation: "slide_from_right" }} />
      <Stack.Screen name="appearance" options={{ headerShown: false, animation: "slide_from_right" }} />
      <Stack.Screen name="license" options={{ headerShown: false, animation: "slide_from_right" }} />
      <Stack.Screen name="privacy" options={{ headerShown: false, animation: "slide_from_right" }} />
      <Stack.Screen name="terms" options={{ headerShown: false, animation: "slide_from_right" }} />
      <Stack.Screen name="oss" options={{ headerShown: false, animation: "slide_from_right" }} />
      <Stack.Screen name="about" options={{ headerShown: false, animation: "slide_from_right" }} />
      <Stack.Screen name="playlist/[id]" options={{ headerShown: false, animation: "slide_from_right" }} />
      <Stack.Screen
        name="playlist/create"
        options={{ presentation: "modal", headerShown: false, animation: "slide_from_bottom" }}
      />
    </Stack>
  );
}

function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AppearanceProvider>
      <StatsProvider>
        <PlayerProvider>
          <LibraryProvider>
            <PlaylistProvider>
              <DownloadProvider>{children}</DownloadProvider>
            </PlaylistProvider>
          </LibraryProvider>
        </PlayerProvider>
      </StatsProvider>
    </AppearanceProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, backgroundColor: "#02040C", alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      </SafeAreaProvider>
    );
  }

  const inner = (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#02040C" }}>
      <KeyboardProvider>
        <AppProviders>
          <RootLayoutNav />
        </AppProviders>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <LocalAuthProvider>
            {hasClerk ? (
              <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache} proxyUrl={proxyUrl}>
                <ClerkLoaded>{inner}</ClerkLoaded>
              </ClerkProvider>
            ) : (
              inner
            )}
          </LocalAuthProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
