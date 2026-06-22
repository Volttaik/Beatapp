import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Platform, StyleSheet, View, ViewStyle } from "react-native";

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  intensity?: number;
  shine?: boolean;
}

export default function GlassCard({
  children,
  style,
  intensity = 70,
  shine = true,
}: GlassCardProps) {
  const flatStyle = StyleSheet.flatten(style ?? {}) as ViewStyle;
  const radius = (flatStyle?.borderRadius as number) ?? 20;

  const shineLayer = shine ? (
    <LinearGradient
      colors={[
        "rgba(255,255,255,0.13)",
        "rgba(255,255,255,0.03)",
        "transparent",
      ]}
      locations={[0, 0.3, 1]}
      style={[StyleSheet.absoluteFill, { borderRadius: radius }]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.6, y: 0.7 }}
      pointerEvents="none"
    />
  ) : null;

  if (Platform.OS === "web") {
    return (
      <View style={[styles.webGlass, { borderRadius: radius }, style]}>
        {shineLayer}
        {children}
      </View>
    );
  }

  return (
    <BlurView intensity={intensity} tint="dark" style={[styles.base, { borderRadius: radius }, style]}>
      <View style={[styles.overlay, { borderRadius: radius }]}>
        {shineLayer}
        {children}
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: "hidden",
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: "rgba(255,255,255,0.22)",
    borderLeftColor: "rgba(255,255,255,0.12)",
    borderRightColor: "rgba(255,255,255,0.05)",
    borderBottomColor: "rgba(255,255,255,0.04)",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(6,6,14,0.46)",
  },
  webGlass: {
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: "rgba(255,255,255,0.22)",
    borderLeftColor: "rgba(255,255,255,0.12)",
    borderRightColor: "rgba(255,255,255,0.05)",
    borderBottomColor: "rgba(255,255,255,0.04)",
    backgroundColor: "rgba(8,8,16,0.68)",
    backdropFilter: "blur(16px) saturate(140%)" as any,
    overflow: "hidden",
  } as any,
});
