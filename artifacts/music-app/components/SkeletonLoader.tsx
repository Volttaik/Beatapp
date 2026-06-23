import React, { useEffect } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  interpolate,
} from "react-native-reanimated";

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function SkeletonItem({ width = "100%", height = 16, borderRadius = 6, style }: SkeletonProps) {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmer.value, [0, 1], [0.25, 0.5]),
  }));

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: "rgba(255,255,255,0.12)",
        },
        animStyle,
        style,
      ]}
    />
  );
}

export function TrackCardSkeleton() {
  return (
    <View style={sk.row}>
      <SkeletonItem width={48} height={48} borderRadius={6} />
      <View style={sk.info}>
        <SkeletonItem width="70%" height={14} borderRadius={4} />
        <SkeletonItem width="45%" height={11} borderRadius={4} style={{ marginTop: 6 }} />
      </View>
      <SkeletonItem width={36} height={36} borderRadius={18} />
    </View>
  );
}

export function TrackListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <View>
      {Array.from({ length: count }).map((_, i) => (
        <TrackCardSkeleton key={i} />
      ))}
    </View>
  );
}

const sk = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
  },
  info: { flex: 1, gap: 4 },
});
