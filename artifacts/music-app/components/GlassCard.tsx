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
  intensity,
  shine,
}: GlassCardProps) {
  const flatStyle = StyleSheet.flatten(style ?? {}) as ViewStyle;
  const radius = (flatStyle?.borderRadius as number) ?? 12;

  const contentStyle: ViewStyle = {};
  for (const key of LAYOUT_KEYS) {
    if (flatStyle[key] !== undefined) {
      (contentStyle as any)[key] = flatStyle[key];
    }
  }

  return (
    <View style={[styles.card, { borderRadius: radius }, style]}>
      <View style={[styles.inner, { borderRadius: radius }, contentStyle]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#282828",
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
      },
      android: { elevation: 6 },
      web: { boxShadow: "0 4px 12px rgba(0,0,0,0.4)" } as any,
    }),
  },
  inner: {
    flex: 1,
  },
});
