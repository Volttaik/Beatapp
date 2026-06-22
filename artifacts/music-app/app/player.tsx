import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React, { useCallback, useEffect, useState } from "react";
import {
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { useLibrary } from "@/contexts/LibraryContext";
import { usePlayer } from "@/contexts/PlayerContext";
import { formatDuration } from "@/data/tracks";
import { useColors } from "@/hooks/useColors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const ARTWORK_SIZE = SCREEN_WIDTH - 64;

export default function PlayerScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    currentTrack,
    isPlaying,
    position,
    duration,
    isLoading,
    togglePlayPause,
    playNext,
    playPrev,
    seekTo,
    isShuffled,
    toggleShuffle,
    repeatMode,
    cycleRepeat,
  } = usePlayer();
  const { isFavorite, toggleFavorite } = useLibrary();

  const [isSeeking, setIsSeeking] = useState(false);
  const [seekPosition, setSeekPosition] = useState(0);

  const artworkScale = useSharedValue(1);

  useEffect(() => {
    artworkScale.value = withSpring(isPlaying ? 1 : 0.9, {
      damping: 15,
      stiffness: 100,
    });
  }, [isPlaying]);

  const artworkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: artworkScale.value }],
  }));

  if (!currentTrack) {
    router.back();
    return null;
  }

  const progressRatio = duration > 0 ? position / duration : 0;
  const liked = isFavorite(currentTrack.id);

  const repeatIcon =
    repeatMode === "one" ? "repeat" : repeatMode === "all" ? "repeat" : "repeat";
  const repeatColor =
    repeatMode !== "none" ? colors.primary : colors.mutedForeground;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={["#1C0A3A", colors.background]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.6 }}
      />

      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={({ pressed }) => [pressed && { opacity: 0.6 }]}
        >
          <Feather name="chevron-down" size={28} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.mutedForeground }]}>
          Now Playing
        </Text>
        <Pressable
          hitSlop={12}
          style={({ pressed }) => [pressed && { opacity: 0.6 }]}
        >
          <Feather name="more-horizontal" size={24} color={colors.foreground} />
        </Pressable>
      </View>

      <View style={styles.artworkContainer}>
        <Animated.View style={[artworkStyle, styles.artworkShadow]}>
          <Image
            source={currentTrack.artwork}
            style={[styles.artwork, { width: ARTWORK_SIZE, height: ARTWORK_SIZE }]}
            contentFit="cover"
          />
        </Animated.View>
      </View>

      <View style={styles.body}>
        <View style={styles.trackInfo}>
          <View style={styles.trackInfoText}>
            <Text style={[styles.trackTitle, { color: colors.foreground }]} numberOfLines={1}>
              {currentTrack.title}
            </Text>
            <Text style={[styles.trackArtist, { color: colors.mutedForeground }]} numberOfLines={1}>
              {currentTrack.artist}
            </Text>
          </View>
          <Pressable
            onPress={() => toggleFavorite(currentTrack)}
            hitSlop={8}
            style={({ pressed }) => [pressed && { opacity: 0.6 }]}
          >
            <Feather
              name="heart"
              size={24}
              color={liked ? colors.primary : colors.mutedForeground}
            />
          </Pressable>
        </View>

        <View style={styles.seekerContainer}>
          <View
            style={[styles.seekBarTrack, { backgroundColor: colors.border }]}
            onStartShouldSetResponder={() => true}
            onMoveShouldSetResponder={() => true}
            onResponderGrant={(e) => {
              setIsSeeking(true);
              const ratio = e.nativeEvent.locationX / (SCREEN_WIDTH - 64);
              setSeekPosition(Math.max(0, Math.min(1, ratio)));
            }}
            onResponderMove={(e) => {
              const ratio = e.nativeEvent.locationX / (SCREEN_WIDTH - 64);
              setSeekPosition(Math.max(0, Math.min(1, ratio)));
            }}
            onResponderRelease={() => {
              seekTo(seekPosition * duration);
              setIsSeeking(false);
            }}
          >
            <View
              style={[
                styles.seekBarFill,
                {
                  backgroundColor: colors.primary,
                  width: `${(isSeeking ? seekPosition : progressRatio) * 100}%`,
                },
              ]}
            />
            <View
              style={[
                styles.seekHandle,
                {
                  backgroundColor: colors.foreground,
                  left: `${(isSeeking ? seekPosition : progressRatio) * 100}%`,
                },
              ]}
            />
          </View>
          <View style={styles.seekTimes}>
            <Text style={[styles.seekTime, { color: colors.mutedForeground }]}>
              {formatDuration(position / 1000)}
            </Text>
            <Text style={[styles.seekTime, { color: colors.mutedForeground }]}>
              {formatDuration(duration / 1000)}
            </Text>
          </View>
        </View>

        <View style={styles.controls}>
          <Pressable
            onPress={toggleShuffle}
            hitSlop={8}
            style={({ pressed }) => [pressed && { opacity: 0.6 }]}
          >
            <Feather
              name="shuffle"
              size={22}
              color={isShuffled ? colors.primary : colors.mutedForeground}
            />
          </Pressable>

          <Pressable
            onPress={playPrev}
            hitSlop={8}
            style={({ pressed }) => [pressed && { opacity: 0.6 }]}
          >
            <Feather name="skip-back" size={32} color={colors.foreground} />
          </Pressable>

          <Pressable
            style={[styles.playButton, { backgroundColor: colors.primary }]}
            onPress={togglePlayPause}
          >
            <Feather
              name={isPlaying ? "pause" : "play"}
              size={28}
              color="#FFF"
            />
          </Pressable>

          <Pressable
            onPress={playNext}
            hitSlop={8}
            style={({ pressed }) => [pressed && { opacity: 0.6 }]}
          >
            <Feather name="skip-forward" size={32} color={colors.foreground} />
          </Pressable>

          <Pressable
            onPress={cycleRepeat}
            hitSlop={8}
            style={({ pressed }) => [pressed && { opacity: 0.6 }]}
          >
            <View>
              <Feather name="repeat" size={22} color={repeatColor} />
              {repeatMode === "one" && (
                <View
                  style={[
                    styles.repeatOneDot,
                    { backgroundColor: colors.primary },
                  ]}
                />
              )}
            </View>
          </Pressable>
        </View>

        <View style={[styles.bottom, { paddingBottom: insets.bottom + 16 }]}>
          {currentTrack.genre ? (
            <View style={[styles.genreBadge, { backgroundColor: colors.secondary }]}>
              <Text style={[styles.genreText, { color: colors.primary }]}>
                {currentTrack.genre}
              </Text>
            </View>
          ) : null}
          <Text style={[styles.albumText, { color: colors.mutedForeground }]} numberOfLines={1}>
            {currentTrack.album}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
    fontFamily: Platform.OS === "ios" ? "Inter_600SemiBold" : undefined,
  },
  artworkContainer: {
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  artworkShadow: {
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  artwork: {
    borderRadius: 16,
    backgroundColor: "#1C1C2A",
  },
  body: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 16,
    gap: 24,
  },
  trackInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  trackInfoText: {
    flex: 1,
    gap: 4,
  },
  trackTitle: {
    fontSize: 22,
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "Inter_700Bold" : undefined,
  },
  trackArtist: {
    fontSize: 16,
    fontFamily: Platform.OS === "ios" ? "Inter_400Regular" : undefined,
  },
  seekerContainer: {
    gap: 8,
  },
  seekBarTrack: {
    height: 4,
    borderRadius: 2,
    position: "relative",
  },
  seekBarFill: {
    height: 4,
    borderRadius: 2,
    position: "absolute",
    left: 0,
    top: 0,
  },
  seekHandle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    position: "absolute",
    top: -5,
    marginLeft: -7,
  },
  seekTimes: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  seekTime: {
    fontSize: 12,
    fontFamily: Platform.OS === "ios" ? "Inter_400Regular" : undefined,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  playButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
    paddingLeft: 4,
  },
  repeatOneDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    position: "absolute",
    bottom: -4,
    alignSelf: "center",
  },
  bottom: {
    alignItems: "center",
    gap: 8,
  },
  genreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  genreText: {
    fontSize: 12,
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "Inter_600SemiBold" : undefined,
  },
  albumText: {
    fontSize: 13,
    fontFamily: Platform.OS === "ios" ? "Inter_400Regular" : undefined,
  },
});
