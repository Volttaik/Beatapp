import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Tabs, Redirect } from "expo-router";
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
import { useLocalAuth } from "@/contexts/LocalAuthContext";
import { usePlayer } from "@/contexts/PlayerContext";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
const hasClerk = publishableKey.startsWith("pk_");

const TAB_CONFIG: {
  name: string;
  icon: React.ComponentProps<typeof Feather>["name"];
}[] = [
  { name: "index", icon: "home" },
  { name: "search", icon: "search" },
  { name: "library", icon: "book-open" },
  { name: "favorites", icon: "heart" },
  { name: "profile", icon: "user" },
];

function GlassTabButton({
  icon,
  focused,
  onPress,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  focused: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [tab.btn, pressed && { opacity: 0.55 }]}
    >
      <Feather
        name={icon}
        size={24}
        color={focused ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.30)"}
      />
    </Pressable>
  );
}

function FloatingTabBar({ state, navigation }: any) {
  const { currentTrack } = usePlayer();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[bar.wrapper, { paddingBottom: insets.bottom }]}
      pointerEvents="box-none"
    >
      {currentTrack ? <MiniPlayer /> : null}
      <BlurView intensity={90} tint="dark" style={bar.blurBar}>
        <LinearGradient
          colors={["rgba(255,255,255,0.07)", "rgba(255,255,255,0.01)", "transparent"]}
          locations={[0, 0.4, 1]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          pointerEvents="none"
        />
        <View style={bar.row}>
          {state.routes.map((route: any, index: number) => {
            const focused = state.index === index;
            const cfg = TAB_CONFIG.find((c) => c.name === route.name);
            return (
              <GlassTabButton
                key={route.key}
                icon={cfg?.icon ?? "circle"}
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
      </BlurView>
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

function TabLayoutLocal() {
  const { isLoaded, isSignedIn } = useLocalAuth();

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
  if (hasClerk) return <TabLayoutWithClerk />;
  return <TabLayoutLocal />;
}

const tab = StyleSheet.create({
  btn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
  },
});

const bar = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  blurBar: {
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
  },
});
