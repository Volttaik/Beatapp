import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { memo, useEffect } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  Easing,
  withRepeat,
} from "react-native-reanimated";

import BufferingSpinner from "@/components/BufferingSpinner";
import { useLibrary } from "@/contexts/LibraryContext";
import { usePlayer } from "@/contexts/PlayerContext";

const MiniPlayer = memo(function MiniPlayer() {
  const { currentTrack, isPlaying, togglePlayPause, isLoading, playNext, position, duration } = usePlayer();
  const { isFavorite, toggleFavorite } = useLibrary();

  const playScale = useSharedValue(1);
  const artScale = useSharedValue(1);
  const heartScale = useSharedValue(1);

  useEffect(() => {
    artScale.value = withSpring(isPlaying ? 1 : 0.93, { damping: 18, stiffness: 160 });
  }, [isPlaying]);

  if (!currentTrack) return null;

  const liked = isFavorite(currentTrack.id);
  const progressRatio = duration > 0 ? Math.min(1, position / duration) : 0;

  const artStyle = useAnimatedStyle(() => ({
    transform: [{ scale: artScale.value }],
  }));

  const playBtnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: playScale.value }],
  }));

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  return (
    <Animated.View entering={FadeInDown.springify().damping(18).stiffness(120)} style={st.wrapper}>
      {Platform.OS === "ios" ? (
        <BlurView intensity={55} tint="dark" style={StyleSheet.absoluteFill} />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: "#0A0A0A" }]} />
      )}

      <View style={[StyleSheet.absoluteFill, st.bg]} />
      <View style={st.topBorder} />

      <View style={st.progressBarTrack}>
        <Animated.View style={[st.progressBarFill, { width: `${progressRatio * 100}%` }]} />
      </View>

      <Pressable
        style={st.inner}
        onPress={() => router.push("/player")}
        android_ripple={{ color: "rgba(255,255,255,0.05)" }}
      >
        <Animated.View style={[artStyle, st.artWrapper]}>
          <Image source={currentTrack.artwork} style={st.art} contentFit="cover" />
        </Animated.View>

        <View style={st.info}>
          <Text style={st.title} numberOfLines={1}>{currentTrack.title}</Text>
          <Text style={st.artist} numberOfLines={1}>{currentTrack.artist}</Text>
        </View>

        <View style={st.controls}>
          <Animated.View style={heartStyle}>
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                heartScale.value = withSpring(0.7, { damping: 8, stiffness: 400 }, () => {
                  heartScale.value = withSpring(1, { damping: 10, stiffness: 300 });
                });
                toggleFavorite(currentTrack);
              }}
              hitSlop={10}
            >
              <Feather name="heart" size={20} color={liked ? "#C4B5FD" : "rgba(255,255,255,0.5)"} />
            </Pressable>
          </Animated.View>

          <Animated.View style={playBtnStyle}>
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                playScale.value = withSpring(0.85, { damping: 8, stiffness: 400 }, () => {
                  playScale.value = withSpring(1, { damping: 10, stiffness: 260 });
                });
                togglePlayPause();
              }}
              style={st.playBtn}
            >
              {isLoading ? (
                <BufferingSpinner size={22} color="#000" strokeWidth={2.5} />
              ) : isPlaying ? (
                <View style={st.pauseIcon}>
                  <View style={st.pauseBar} />
                  <View style={st.pauseBar} />
                </View>
              ) : (
                <View style={st.playArrow} />
              )}
            </Pressable>
          </Animated.View>

          <Pressable
            onPress={(e) => { e.stopPropagation(); playNext(); }}
            hitSlop={10}
            style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1 }]}
          >
            <Feather name="skip-forward" size={20} color="rgba(255,255,255,0.75)" />
          </Pressable>
        </View>
      </Pressable>
    </Animated.View>
  );
});

export default MiniPlayer;

const st = StyleSheet.create({
  wrapper: {
    overflow: "hidden",
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.6,
        shadowRadius: 18,
      },
      android: { elevation: 16 },
    }),
  },
  bg: {
    backgroundColor: Platform.OS === "ios" ? "rgba(8,8,8,0.55)" : "transparent",
  },
  topBorder: {
    height: 0.7,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  progressBarTrack: {
    height: 2,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  progressBarFill: {
    height: 2,
    backgroundColor: "#C4B5FD",
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 12,
  },
  artWrapper: {
    borderRadius: 6,
    overflow: "hidden",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 6 },
    }),
  },
  art: {
    width: 44,
    height: 44,
    borderRadius: 6,
    backgroundColor: "#111",
  },
  info: { flex: 1 },
  title: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  artist: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  playBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  pauseIcon: { flexDirection: "row", gap: 3, alignItems: "center" },
  pauseBar: { width: 3, height: 13, backgroundColor: "#000", borderRadius: 2 },
  playArrow: {
    width: 0,
    height: 0,
    borderStyle: "solid",
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderLeftWidth: 11,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    borderLeftColor: "#000",
    marginLeft: 2,
  },
});
