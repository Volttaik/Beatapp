import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";

interface GlassIconProps {
  name: React.ComponentProps<typeof Feather>["name"];
  size?: number;
  color?: string;
  onPress?: () => void;
  hitSlop?: number;
  containerSize?: number;
  borderRadius?: number;
  active?: boolean;
}

export default function GlassIcon({
  name,
  size = 20,
  color = "rgba(255,255,255,0.85)",
  onPress,
  hitSlop = 8,
  containerSize = 42,
  borderRadius,
  active = false,
}: GlassIconProps) {
  const radius = borderRadius ?? containerSize / 2;

  const inner = (
    <>
      <LinearGradient
        colors={[
          active ? "rgba(124,58,237,0.25)" : "rgba(255,255,255,0.12)",
          "rgba(255,255,255,0.02)",
          "transparent",
        ]}
        locations={[0, 0.4, 1]}
        style={[StyleSheet.absoluteFill, { borderRadius: radius }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.6, y: 1 }}
        pointerEvents="none"
      />
      <Feather name={name} size={size} color={active ? "#A78BFA" : color} />
    </>
  );

  const container = Platform.OS === "web" ? (
    <View
      style={[
        styles.webContainer,
        {
          width: containerSize,
          height: containerSize,
          borderRadius: radius,
          borderColor: active ? "rgba(167,139,250,0.3)" : "rgba(255,255,255,0.14)",
        },
      ]}
    >
      {inner}
    </View>
  ) : (
    <BlurView
      intensity={65}
      tint="dark"
      style={[
        styles.blurContainer,
        {
          width: containerSize,
          height: containerSize,
          borderRadius: radius,
          borderColor: active ? "rgba(167,139,250,0.3)" : "rgba(255,255,255,0.14)",
        },
      ]}
    >
      <View style={[styles.overlay, { borderRadius: radius }]}>{inner}</View>
    </BlurView>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        hitSlop={hitSlop}
        style={({ pressed }) => [{ opacity: pressed ? 0.65 : 1 }]}
      >
        {container}
      </Pressable>
    );
  }

  return container;
}

const styles = StyleSheet.create({
  blurContainer: {
    overflow: "hidden",
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
    justifyContent: "center",
  },
  overlay: {
    flex: 1,
    width: "100%",
    backgroundColor: "rgba(8,8,16,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  webContainer: {
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.04)",
    backgroundColor: "rgba(12,12,20,0.65)",
    backdropFilter: "blur(20px)" as any,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
});
