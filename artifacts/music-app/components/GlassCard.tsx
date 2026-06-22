import { BlurView } from "expo-blur";
import React from "react";
import { Platform, StyleSheet, View, ViewStyle } from "react-native";

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  intensity?: number;
  tint?: "light" | "dark" | "default" | "extraLight" | "regular" | "prominent" | "systemChromeMaterial" | "systemMaterial" | "systemThickMaterial" | "systemThinMaterial" | "systemUltraThinMaterial";
}

export default function GlassCard({ children, style, intensity = 40, tint = "dark" }: GlassCardProps) {
  if (Platform.OS === "web") {
    return (
      <View
        style={[
          styles.webGlass,
          style,
        ]}
      >
        {children}
      </View>
    );
  }

  return (
    <BlurView intensity={intensity} tint={tint} style={[styles.base, style]}>
      <View style={styles.overlay}>
        {children}
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: "hidden",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  webGlass: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  } as any,
});
