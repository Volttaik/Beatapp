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

const ACCENT = "#A78BFA";

export default function GlassIcon({
  name,
  size = 20,
  color = "#B3B3B3",
  onPress,
  hitSlop = 8,
  containerSize = 42,
  borderRadius,
  active = false,
}: GlassIconProps) {
  const radius = borderRadius ?? containerSize / 2;

  const container = (
    <View
      style={[
        styles.container,
        {
          width: containerSize,
          height: containerSize,
          borderRadius: radius,
          backgroundColor: active ? "rgba(167,139,250,0.15)" : "#282828",
        },
      ]}
    >
      <Feather name={name} size={size} color={active ? ACCENT : color} />
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        hitSlop={hitSlop}
        style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
      >
        {container}
      </Pressable>
    );
  }

  return container;
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: { elevation: 3 },
    }),
  },
});
