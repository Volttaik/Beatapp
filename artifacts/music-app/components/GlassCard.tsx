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
          colors={[
            "rgba(255,255,255,0.16)",
            "rgba(255,255,255,0.04)",
            "transparent",
          ]}
          locations={[0, 0.28, 1]}
          style={[StyleSheet.absoluteFill, { borderRadius: radius }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.6, y: 0.7 }}
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
    borderTopColor: "rgba(255,255,255,0.24)",
    borderLeftColor: "rgba(255,255,255,0.13)",
    borderRightColor: "rgba(255,255,255,0.05)",
    borderBottomColor: "rgba(255,255,255,0.04)",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(6,6,14,0.48)",
  },
  webGlass: {
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: "rgba(255,255,255,0.24)",
    borderLeftColor: "rgba(255,255,255,0.13)",
    borderRightColor: "rgba(255,255,255,0.05)",
    borderBottomColor: "rgba(255,255,255,0.04)",
    backgroundColor: "rgba(10,10,18,0.62)",
    backdropFilter: "blur(24px)" as any,
    overflow: "hidden",
  },
});
