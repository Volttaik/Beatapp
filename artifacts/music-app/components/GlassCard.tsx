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
      <View
        style={[
          styles.webOuter,
          {
            borderRadius: radius,
            borderTopColor: "rgba(255,255,255,0.26)",
            borderLeftColor: "rgba(255,255,255,0.14)",
            borderRightColor: "rgba(255,255,255,0.06)",
            borderBottomColor: "rgba(255,255,255,0.04)",
          },
          style,
        ]}
      >
        {/* Blur layer — absolutely positioned so overflow:hidden on parent doesn't block it */}
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backdropFilter: "blur(28px) saturate(180%)",
              WebkitBackdropFilter: "blur(28px) saturate(180%)",
            } as any,
          ]}
          pointerEvents="none"
        />
        {/* Dark tint */}
        <View
          style={[StyleSheet.absoluteFill, styles.webTint]}
          pointerEvents="none"
        />
        {shineLayer}
        <View style={contentStyle}>{children}</View>
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
  webOuter: {
    overflow: "hidden",
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    position: "relative",
  } as any,
  webTint: {
    backgroundColor: "rgba(5,5,15,0.42)",
  },
});
