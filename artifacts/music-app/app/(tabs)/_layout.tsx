import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect, Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import MiniPlayer from "@/components/MiniPlayer";
import { usePlayer } from "@/contexts/PlayerContext";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
const hasClerk = publishableKey.startsWith("pk_");

const TAB_ICONS: Record<string, React.ComponentProps<typeof Feather>["name"]> = {
  index: "home",
  search: "search",
  library: "book-open",
  favorites: "heart",
  profile: "user",
};

function GlassTabIcon({
  name,
  focused,
  onPress,
}: {
  name: React.ComponentProps<typeof Feather>["name"];
  focused: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [tab.btn, pressed && { opacity: 0.65 }]}
    >
      <BlurView
        intensity={focused ? 75 : 55}
        tint="dark"
        style={[
          tab.blur,
          focused && tab.blurActive,
        ]}
      >
        <LinearGradient
          colors={
            focused
              ? ["rgba(255,255,255,0.18)", "rgba(255,255,255,0.04)", "transparent"]
              : ["rgba(255,255,255,0.08)", "transparent"]
          }
          locations={focused ? [0, 0.35, 1] : [0, 1]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          pointerEvents="none"
        />
        <View style={tab.inner}>
          <Feather
            name={name}
            size={22}
            color={focused ? "#ffffff" : "rgba(255,255,255,0.38)"}
          />
        </View>
      </BlurView>
    </Pressable>
  );
}

function FloatingTabBar({ state, navigation }: any) {
  const { currentTrack } = usePlayer();
  const insets = useSafeAreaInsets();

  return (
    <View style={[bar.wrapper, { paddingBottom: insets.bottom + 8 }]} pointerEvents="box-none">
      {currentTrack ? <MiniPlayer /> : null}
      <View style={bar.row}>
        {state.routes.map((route: any, index: number) => {
          const focused = state.index === index;
          const icon = TAB_ICONS[route.name] ?? "circle";
          return (
            <GlassTabIcon
              key={route.key}
              name={icon}
              focused={focused}
              onPress={() => {
                const event = navigation.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!focused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              }}
            />
          );
        })}
      </View>
    </View>
  );
}

function TabsContent() {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="search" />
      <Tabs.Screen name="library" />
      <Tabs.Screen name="favorites" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

function TabLayoutWithClerk() {
  const { useAuth } = require("@clerk/expo");
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#02040C" }}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return <TabsContent />;
}

export default function TabLayout() {
  if (!hasClerk) return <TabsContent />;
  return <TabLayoutWithClerk />;
}

const tab = StyleSheet.create({
  btn: {
    borderRadius: 26,
    overflow: "hidden",
  },
  blur: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: "hidden",
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: "rgba(255,255,255,0.14)",
    borderLeftColor: "rgba(255,255,255,0.08)",
    borderRightColor: "rgba(255,255,255,0.04)",
    borderBottomColor: "rgba(255,255,255,0.03)",
  },
  blurActive: {
    borderTopColor: "rgba(255,255,255,0.26)",
    borderLeftColor: "rgba(255,255,255,0.14)",
  },
  inner: {
    flex: 1,
    backgroundColor: "rgba(8,8,18,0.42)",
    alignItems: "center",
    justifyContent: "center",
  },
});

const bar = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
});
