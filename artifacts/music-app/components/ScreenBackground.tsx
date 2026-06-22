import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { ImageBackground, StyleSheet, View } from "react-native";

import { useAppearance } from "@/contexts/AppearanceContext";

const earthBg = require("../assets/images/earth-bg.jpg");

interface ScreenBackgroundProps {
  children: React.ReactNode;
}

export default function ScreenBackground({ children }: ScreenBackgroundProps) {
  const { wallpaper, customWallpaperUri } = useAppearance();

  if (wallpaper.type === "custom" && customWallpaperUri) {
    return (
      <View style={styles.container}>
        <ImageBackground source={{ uri: customWallpaperUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        <View style={[styles.overlay, { backgroundColor: wallpaper.overlay ?? "rgba(0,0,0,0.55)" }]} />
        {children}
      </View>
    );
  }

  if (wallpaper.type === "image") {
    return (
      <View style={styles.container}>
        <ImageBackground source={earthBg} style={StyleSheet.absoluteFill} resizeMode="cover" />
        <View style={[styles.overlay, { backgroundColor: wallpaper.overlay ?? "rgba(2,4,12,0.78)" }]} />
        {children}
      </View>
    );
  }

  const colors = (wallpaper.colors ?? ["#020205", "#06060f"]) as [string, string, ...string[]];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={colors}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 0.7, y: 1 }}
      />
      <View style={[styles.overlay, { backgroundColor: wallpaper.overlay ?? "rgba(0,0,4,0.65)" }]} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject },
});
