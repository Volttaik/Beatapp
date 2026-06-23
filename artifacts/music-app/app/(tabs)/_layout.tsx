import { Tabs, Redirect } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  FadeIn,
} from "react-native-reanimated";

import MiniPlayer from "@/components/MiniPlayer";
import { useLocalAuth } from "@/contexts/LocalAuthContext";
import { usePlayer } from "@/contexts/PlayerContext";
import { playPopSound } from "@/services/SoundService";

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
  const scale = useSharedValue(1);
  const iconOpacity = useSharedValue(focused ? 1 : 0.45);

  useEffect(() => {
    iconOpacity.value = withTiming(focused ? 1 : 0.45, { duration: 200 });
  }, [focused]);

  const iconStyle = useAnimatedStyle(() => ({ opacity: iconOpacity.value }));
  const scaleStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const color = focused ? "#FFFFFF" : "rgba(255,255,255,0.45)";

  return (
    <Pressable
      onPress={() => {
        playPopSound();
        onPress();
      }}
      onPressIn={() => { scale.value = withSpring(0.82, { damping: 10, stiffness: 400 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 12, stiffness: 300 }); }}
      style={tab.btn}
    >
      <Animated.View style={[tab.iconWrap, scaleStyle]}>
        <Animated.View style={iconStyle}>
          <Feather name={icon} size={22} color={color} />
        </Animated.View>
      </Animated.View>
      <Animated.Text style={[tab.label, { color }, iconStyle]} numberOfLines={1}>
        {label}
      </Animated.Text>
    </Pressable>
  );
}

function SpotifyTabBar({ state, navigation }: any) {
  const { currentTrack } = usePlayer();
  const insets = useSafeAreaInsets();

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={[bar.wrapper, { paddingBottom: insets.bottom }]}
    >
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.85)", "#000000"]}
        style={StyleSheet.absoluteFill}
        locations={[0, 0.4, 1]}
        pointerEvents="none"
      />

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
    </Animated.View>
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
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" }}>
        <ActivityIndicator size="large" color="#fff" />
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
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" }}>
        <ActivityIndicator size="large" color="#fff" />
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
    gap: 3,
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
    overflow: "hidden",
  },
  tabRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
});
