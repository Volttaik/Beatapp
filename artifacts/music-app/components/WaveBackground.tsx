import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  interpolate,
} from "react-native-reanimated";

const { width: W, height: H } = Dimensions.get("window");

const GENRE_PALETTES: Record<string, [string, string, string]> = {
  "hip-hop": ["#4C1D95", "#1E1B4B", "#0F172A"],
  "rap": ["#3B0764", "#1E1B4B", "#0F0A1A"],
  "electronic": ["#0C4A6E", "#1E3A5F", "#020617"],
  "edm": ["#0D47A1", "#1A237E", "#000D1A"],
  "rock": ["#450A0A", "#431407", "#0F0A0A"],
  "pop": ["#500724", "#4A044E", "#0F0314"],
  "jazz": ["#451A03", "#422006", "#0F0A00"],
  "classical": ["#1E1B4B", "#0F172A", "#000510"],
  "funk": ["#451A03", "#3B0764", "#0F0A00"],
  "soul": ["#3B0764", "#450A0A", "#0A0010"],
  "r&b": ["#3B0764", "#450A0A", "#0A0010"],
  "default": ["#1E1B4B", "#0C2340", "#000000"],
};

function getGenrePalette(genre?: string): [string, string, string] {
  if (!genre) return GENRE_PALETTES.default;
  const key = genre.toLowerCase();
  for (const [k, v] of Object.entries(GENRE_PALETTES)) {
    if (key.includes(k)) return v;
  }
  return GENRE_PALETTES.default;
}

interface BlobProps {
  color: string;
  size: number;
  initialX: number;
  initialY: number;
  duration: number;
  delay: number;
  opacity: number;
}

function AnimatedBlob({ color, size, initialX, initialY, duration, delay, opacity }: BlobProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withSequence(
        withTiming(1, { duration, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );
  }, []);

  const style = useAnimatedStyle(() => {
    const tx = interpolate(progress.value, [0, 1], [-30, 30]);
    const ty = interpolate(progress.value, [0, 1], [-25, 25]);
    const sc = interpolate(progress.value, [0, 1], [0.85, 1.15]);
    return {
      transform: [{ translateX: tx }, { translateY: ty }, { scale: sc }],
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: initialX - size / 2,
          top: initialY - size / 2,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          opacity,
        },
        style,
      ]}
    />
  );
}

interface WaveBackgroundProps {
  genre?: string;
  intensity?: number;
}

export default function WaveBackground({ genre, intensity = 1 }: WaveBackgroundProps) {
  const [c1, c2, c3] = getGenrePalette(genre);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[StyleSheet.absoluteFill, { backgroundColor: "#000000" }]} />

      <AnimatedBlob
        color={c1}
        size={W * 1.1}
        initialX={W * 0.2}
        initialY={H * 0.15}
        duration={7000}
        delay={0}
        opacity={0.35 * intensity}
      />
      <AnimatedBlob
        color={c2}
        size={W * 0.9}
        initialX={W * 0.8}
        initialY={H * 0.4}
        duration={9000}
        delay={0}
        opacity={0.28 * intensity}
      />
      <AnimatedBlob
        color={c3.length > 4 ? c1 : c1}
        size={W * 0.7}
        initialX={W * 0.5}
        initialY={H * 0.7}
        duration={11000}
        delay={0}
        opacity={0.22 * intensity}
      />
      <AnimatedBlob
        color={c2}
        size={W * 0.55}
        initialX={W * 0.1}
        initialY={H * 0.55}
        duration={8500}
        delay={0}
        opacity={0.18 * intensity}
      />

      <LinearGradient
        colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.55)", "rgba(0,0,0,0.88)", "#000000"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.75 }}
      />
    </View>
  );
}
