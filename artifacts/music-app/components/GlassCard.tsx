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

const LAYOUT_KEYS: (keyof ViewStyle)[] = [
  "flexDirection",
  "alignItems",
  "justifyContent",
  "gap",
  "rowGap",
  "columnGap",
  "padding",
  "paddingTop",
  "paddingBottom",
  "paddingLeft",
  "paddingRight",
  "paddingHorizontal",
  "paddingVertical",
  "flexWrap",
];

export default function GlassCard({
  children,
  style,
  intensity = 70,
  shine = true,
}: GlassCardProps) {
  const flatStyle = StyleSheet.flatten(style ?? {}) as ViewStyle;
  const radius = (flatStyle?.borderRadius as number) ?? 20;

  const contentStyle: ViewStyle = {};
  for (const key of LAYOUT_KEYS) {
    if (flatStyle[key] !== undefined) {
      (contentStyle as any)[key] = flatStyle[key];
    }
  }

  const shineLayer = shine ? (
    <LinearGradient
      colors={[
        "rgba(255,255,255,0.18)",
        "rgba(255,255,255,0.04)",
        "transparent",
      ]}
      locations={[0, 0.35, 1]}
      style={[StyleSheet.absoluteFill, { borderRadius: radius }]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.6, y: 0.8 }}
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
    <BlurView
      intensity={intensity}
      tint="dark"
      style={[styles.base, { borderRadius: radius }, style]}
    >
      <View style={[styles.overlay, { borderRadius: radius }, contentStyle]}>
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
    borderTopColor: "rgba(255,255,255,0.26)",
    borderLeftColor: "rgba(255,255,255,0.14)",
    borderRightColor: "rgba(255,255,255,0.06)",
    borderBottomColor: "rgba(255,255,255,0.04)",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(5,5,12,0.52)",
  },
  webGlass: {
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: "rgba(255,255,255,0.26)",
    borderLeftColor: "rgba(255,255,255,0.14)",
    borderRightColor: "rgba(255,255,255,0.06)",
    borderBottomColor: "rgba(255,255,255,0.04)",
    backgroundColor: "rgba(8,8,16,0.65)",
    backdropFilter: "blur(20px) saturate(150%)" as any,
    overflow: "hidden",
  } as any,
});
