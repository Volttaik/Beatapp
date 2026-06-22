import { useAuth } from "@clerk/expo";
import { BlurView } from "expo-blur";
import { Redirect, Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, Platform, StyleSheet, View } from "react-native";

import MiniPlayer from "@/components/MiniPlayer";
import { usePlayer } from "@/contexts/PlayerContext";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const BottomTabBar = require("@react-navigation/bottom-tabs").BottomTabBar as React.ComponentType<any>;

function CustomTabBar(props: any) {
  const { currentTrack } = usePlayer();
  return (
    <View>
      {currentTrack ? <MiniPlayer /> : null}
      <BottomTabBar {...props} />
    </View>
  );
}

export default function TabLayout() {
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#08080F" }}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#A78BFA",
        tabBarInactiveTintColor: "rgba(255,255,255,0.4)",
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : "#0E0E1A",
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: "rgba(255,255,255,0.08)",
          elevation: 0,
          ...(isWeb ? { height: 70 } : {}),
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />
          ) : isWeb ? (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: "#0E0E1A" }]} />
          ) : null,
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: "Inter_500Medium",
          marginTop: -2,
          marginBottom: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Feather name={focused ? "home" : "home"} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color }) => (
            <Feather name="search" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: "Library",
          tabBarIcon: ({ color }) => (
            <Feather name="book-open" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Favorites",
          tabBarIcon: ({ color, focused }) => (
            <Feather name={focused ? "heart" : "heart"} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <Feather name="user" size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
