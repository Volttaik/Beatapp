import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import MiniPlayer from "@/components/MiniPlayer";
import { usePlayer } from "@/contexts/PlayerContext";

const earthBg = require("@/assets/images/earth-bg.jpg");
const ONBOARDING_KEY = "beatstream_onboarding_done";

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

function GlassTabButton({
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
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [tab.btn, pressed && { opacity: 0.65 }]}
    >
      <View style={tab.col}>
        <BlurView
          intensity={focused ? 80 : 50}
          tint="dark"
          style={[tab.blur, focused && tab.blurActive]}
        >
          <LinearGradient
            colors={
              focused
                ? ["rgba(255,255,255,0.22)", "rgba(255,255,255,0.05)", "transparent"]
                : ["rgba(255,255,255,0.07)", "transparent"]
            }
            locations={focused ? [0, 0.4, 1] : [0, 1]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            pointerEvents="none"
          />
          <View style={tab.iconWrap}>
            <Feather
              name={icon}
              size={19}
              color={focused ? "#ffffff" : "rgba(255,255,255,0.35)"}
            />
          </View>
        </BlurView>
        <Text
          style={[tab.label, focused ? tab.labelActive : tab.labelInactive]}
          numberOfLines={1}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

function FloatingTabBar({ state, navigation }: any) {
  const { currentTrack } = usePlayer();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[bar.wrapper, { paddingBottom: insets.bottom + 4 }]}
      pointerEvents="box-none"
    >
      {currentTrack ? <MiniPlayer /> : null}
      <View style={bar.row}>
        {state.routes.map((route: any, index: number) => {
          const focused = state.index === index;
          const cfg = TAB_CONFIG.find((c) => c.name === route.name);
          return (
            <GlassTabButton
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

function WelcomeScreen({ onGetStarted }: { onGetStarted: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={wl.screen}>
      <ImageBackground source={earthBg} style={StyleSheet.absoluteFill} resizeMode="cover" />
      <View style={wl.overlay} />
      <View style={[wl.content, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 32 }]}>
        <View style={wl.top}>
          <View style={wl.logoBg}>
            <Image
              source={require("@/assets/images/beatstream-logo.png")}
              style={wl.logo}
              contentFit="contain"
            />
          </View>
          <Text style={wl.appName}>BeatStream</Text>
          <Text style={wl.tagline}>Your music, everywhere</Text>
        </View>

        <View style={wl.midSection}>
          {[
            { icon: "music", text: "Millions of free-to-use tracks" },
            { icon: "download", text: "Download and listen offline" },
            { icon: "list", text: "Build and share playlists" },
          ].map((item) => (
            <View key={item.icon} style={wl.featureRow}>
              <View style={wl.featureIcon}>
                <Feather name={item.icon as any} size={16} color="#A78BFA" />
              </View>
              <Text style={wl.featureText}>{item.text}</Text>
            </View>
          ))}
        </View>

        <View style={wl.actions}>
          <Pressable
            style={({ pressed }) => [wl.btn, pressed && { opacity: 0.8 }]}
            onPress={onGetStarted}
          >
            <LinearGradient
              colors={["rgba(124,58,237,0.65)", "rgba(109,40,217,0.50)"]}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <View style={wl.btnBorder} />
            <Text style={wl.btnText}>Get Started</Text>
            <Feather name="arrow-right" size={18} color="#fff" />
          </Pressable>
          <Text style={wl.notice}>Free music, no account required</Text>
        </View>
      </View>
    </View>
  );
}

function TabsWithOnboarding() {
  const [ready, setReady] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY).then((val) => {
      setReady(val === "done");
    });
  }, []);

  if (ready === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#02040C" }}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  if (!ready) {
    return (
      <WelcomeScreen
        onGetStarted={() => {
          AsyncStorage.setItem(ONBOARDING_KEY, "done");
          setReady(true);
        }}
      />
    );
  }

  return <TabsContent />;
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
    const { Redirect } = require("expo-router");
    return <Redirect href="/(auth)/sign-in" />;
  }

  return <TabsContent />;
}

export default function TabLayout() {
  if (!hasClerk) return <TabsWithOnboarding />;
  return <TabLayoutWithClerk />;
}

const tab = StyleSheet.create({
  btn: {
    flex: 1,
    alignItems: "center",
  },
  col: {
    alignItems: "center",
    gap: 5,
  },
  blur: {
    borderRadius: 16,
    overflow: "hidden",
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: "rgba(255,255,255,0.16)",
    borderLeftColor: "rgba(255,255,255,0.09)",
    borderRightColor: "rgba(255,255,255,0.05)",
    borderBottomColor: "rgba(255,255,255,0.03)",
  },
  blurActive: {
    borderTopColor: "rgba(255,255,255,0.30)",
    borderLeftColor: "rgba(255,255,255,0.16)",
    borderRightColor: "rgba(255,255,255,0.08)",
  },
  iconWrap: {
    width: 52,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(8,8,18,0.44)",
  },
  label: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.2,
  },
  labelActive: {
    color: "#ffffff",
  },
  labelInactive: {
    color: "rgba(255,255,255,0.32)",
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
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 6,
  },
});

const wl = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#02040C" },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(2,4,12,0.72)" },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: "space-between",
  },
  top: { alignItems: "center" },
  logoBg: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: "rgba(124,58,237,0.18)",
    borderWidth: 1,
    borderColor: "rgba(167,139,250,0.30)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  logo: { width: 62, height: 62 },
  appName: { color: "#fff", fontSize: 32, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  tagline: { color: "rgba(255,255,255,0.45)", fontSize: 15, fontFamily: "Inter_400Regular", marginTop: 6 },
  midSection: { gap: 18 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(124,58,237,0.18)",
    borderWidth: 1,
    borderColor: "rgba(167,139,250,0.20)",
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: { color: "rgba(255,255,255,0.75)", fontSize: 15, fontFamily: "Inter_400Regular" },
  actions: { gap: 14 },
  btn: {
    borderRadius: 16,
    paddingVertical: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    overflow: "hidden",
  },
  btnBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    borderWidth: 1,
    borderTopColor: "rgba(255,255,255,0.25)",
    borderLeftColor: "rgba(255,255,255,0.15)",
    borderRightColor: "rgba(255,255,255,0.06)",
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  btnText: { color: "#fff", fontSize: 17, fontFamily: "Inter_600SemiBold" },
  notice: { color: "rgba(255,255,255,0.30)", fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "center" },
});
