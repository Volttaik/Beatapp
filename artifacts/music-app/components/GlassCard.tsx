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

  const content = (
    <>
      {shine && (
        <LinearGradient
          colors={["rgba(255,255,255,0.13)", "rgba(255,255,255,0.02)", "transparent"]}
          locations={[0, 0.3, 1]}
          style={[StyleSheet.absoluteFill, { borderRadius: radius }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.5, y: 0.6 }}
          pointerEvents="none"
        />
      )}
      {children}
    </>
  );

  if (Platform.OS === "web") {
    return (
      <View style={[styles.webGlass, { borderRadius: radius }, style]}>
        {content}
      </View>
    );
  }

  return (
    <BlurView intensity={intensity} tint="dark" style={[styles.base, { borderRadius: radius }, style]}>
      <View style={[styles.overlay, { borderRadius: radius }]}>
        {content}
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
    backgroundColor: "rgba(8,8,16,0.52)",
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
    backgroundColor: "rgba(12,12,20,0.65)",
    backdropFilter: "blur(22px)" as any,
    overflow: "hidden",
  },
});
