import { Tabs, Redirect } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
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
  label: string;
}[] = [
  { name: "index", icon: "home", label: "Home" },
  { name: "search", icon: "search", label: "Search" },
  { name: "library", icon: "book-open", label: "Library" },
  { name: "favorites", icon: "heart", label: "Likes" },
  { name: "profile", icon: "user", label: "Profile" },
];

const ACTIVE_COLOR = "#FFFFFF";
const INACTIVE_COLOR = "#9B9B9B";

function SpotifyTabButton({
  icon,
  label,
  focused,
  onPress,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  focused: boolean;
  onPress: () => void;
}) {
  const color = focused ? ACTIVE_COLOR : INACTIVE_COLOR;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [tab.btn, pressed && { opacity: 0.6 }]}
    >
      <View style={tab.iconWrap}>
        <Feather name={icon} size={22} color={color} />
      </View>
      <Text style={[tab.label, { color }]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

function SpotifyTabBar({ state, navigation }: any) {
  const { currentTrack } = usePlayer();
  const insets = useSafeAreaInsets();

  return (
    <View style={[bar.wrapper, { paddingBottom: insets.bottom }]}>
      {currentTrack ? <MiniPlayer /> : null}
      <View style={bar.tabRow}>
        {state.routes.map((route: any, index: number) => {
          const focused = state.index === index;
          const cfg = TAB_CONFIG.find((c) => c.name === route.name);
          return (
            <SpotifyTabButton
              key={route.key}
              icon={cfg?.icon ?? "circle"}
              label={cfg?.label ?? route.name}
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
      tabBar={(props) => <SpotifyTabBar {...props} />}
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
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#121212" }}>
        <ActivityIndicator size="large" color="#1DB954" />
      </View>
    );
  }

  if (!isSignedIn) return <Redirect href="/(auth)/sign-in" />;
  return <TabsContent />;
}

function TabLayoutLocal() {
  const { isLoaded, isSignedIn } = useLocalAuth();

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#121212" }}>
        <ActivityIndicator size="large" color="#1DB954" />
      </View>
    );
  }

  if (!isSignedIn) return <Redirect href="/(auth)/sign-in" />;
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
    paddingTop: 10,
    paddingBottom: 4,
    gap: 4,
  },
  iconWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.1,
  },
});

const bar = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "transparent",
  },
  tabRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
});
