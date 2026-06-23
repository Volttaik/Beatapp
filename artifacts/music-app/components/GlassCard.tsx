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
  "flexDirection", "alignItems", "justifyContent", "gap", "rowGap",
  "columnGap", "padding", "paddingTop", "paddingBottom", "paddingLeft",
  "paddingRight", "paddingHorizontal", "paddingVertical", "flexWrap",
];

export default function GlassCard({ children, style, intensity = 18, shine = false }: GlassCardProps) {
  const flatStyle = StyleSheet.flatten(style ?? {}) as ViewStyle;
  const radius = (flatStyle?.borderRadius as number) ?? 12;

  const contentStyle: ViewStyle = {};
  for (const key of LAYOUT_KEYS) {
    if (flatStyle[key] !== undefined) (contentStyle as any)[key] = flatStyle[key];
  }

  const inner = (
    <View style={[styles.inner, { borderRadius: radius }, contentStyle]}>
      {shine && (
        <LinearGradient
          colors={["rgba(255,255,255,0.10)", "rgba(255,255,255,0.03)", "transparent"]}
          style={[StyleSheet.absoluteFill, { borderRadius: radius }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.6, y: 1 }}
          pointerEvents="none"
        />
      )}
      {children}
    </View>
  );

  if (Platform.OS === "ios") {
    return (
      <View style={[styles.card, { borderRadius: radius }, style]}>
        <BlurView intensity={intensity * 1.2} tint="dark" style={[StyleSheet.absoluteFill, { borderRadius: radius }]} />
        <View style={[styles.tint, { borderRadius: radius }]} />
        <View style={[styles.border, { borderRadius: radius }]} />
        {inner}
      </View>
    );
  }

  return (
    <View style={[styles.card, styles.cardAndroid, { borderRadius: radius }, style]}>
      <View style={[styles.border, { borderRadius: radius }]} />
      {inner}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.45,
        shadowRadius: 16,
      },
      android: { elevation: 8 },
      web: { boxShadow: "0 6px 24px rgba(0,0,0,0.55)" } as any,
    }),
  },
  cardAndroid: {
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  tint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  border: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 0.7,
    borderColor: "rgba(255,255,255,0.14)",
  },
  inner: {
    flex: 1,
  },
});
