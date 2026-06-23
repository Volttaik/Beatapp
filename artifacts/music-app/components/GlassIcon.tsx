import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

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

const ACCENT = "#C4B5FD";

export default function GlassIcon({
  name,
  size = 20,
  color = "rgba(255,255,255,0.82)",
  onPress,
  hitSlop = 10,
  containerSize = 42,
  borderRadius,
  active = false,
}: GlassIconProps) {
  const radius = borderRadius ?? containerSize / 2;
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const iconColor = active ? ACCENT : color;

  const container = (
    <Animated.View
      style={[
        animStyle,
        styles.container,
        {
          width: containerSize,
          height: containerSize,
          borderRadius: radius,
        },
      ]}
    >
      {Platform.OS === "ios" ? (
        <BlurView
          intensity={active ? 28 : 20}
          tint="dark"
          style={[StyleSheet.absoluteFill, { borderRadius: radius }]}
        />
      ) : null}
      <View
        style={[
          styles.tint,
          {
            borderRadius: radius,
            backgroundColor: active
              ? "rgba(196,181,253,0.15)"
              : "rgba(255,255,255,0.06)",
          },
        ]}
      />
      <View style={[styles.border, { borderRadius: radius }]} />
      <Feather name={name} size={size} color={iconColor} />
    </Animated.View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        hitSlop={hitSlop}
        onPressIn={() => {
          scale.value = withSpring(0.88, { damping: 12, stiffness: 300 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 12, stiffness: 300 });
        }}
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
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
      },
      android: { elevation: 4 },
    }),
  },
  tint: {
    ...StyleSheet.absoluteFillObject,
  },
  border: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 0.7,
    borderColor: "rgba(255,255,255,0.13)",
  },
});
