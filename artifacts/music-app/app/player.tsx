import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
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

import AddToPlaylistModal from "@/components/AddToPlaylistModal";
import { useLibrary } from "@/contexts/LibraryContext";
import { usePlayer } from "@/contexts/PlayerContext";
import { useStats } from "@/contexts/StatsContext";
import { formatDuration } from "@/data/tracks";
import { useColors } from "@/hooks/useColors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const ARTWORK_SIZE = Math.min(SCREEN_WIDTH - 64, 340);

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
    queue,
  } = usePlayer();
  const { isFavorite, toggleFavorite } = useLibrary();
  const { recordPlay } = useStats();

  const [isSeeking, setIsSeeking] = useState(false);
  const [seekPosition, setSeekPosition] = useState(0);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);

  const artworkScale = useSharedValue(1);

  useEffect(() => {
    artworkScale.value = withSpring(isPlaying ? 1 : 0.88, {
      damping: 15,
      stiffness: 100,
    });
  }, [isPlaying]);

  useEffect(() => {
    if (currentTrack && !isPlaying && duration > 0 && position > 10000) {
      recordPlay(Math.floor(position / 1000), currentTrack.genre);
    }
  }, [currentTrack?.id]);

  const artworkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: artworkScale.value }],
  }));

  if (!currentTrack) {
    router.back();
    return null;
  }

  const progressRatio = duration > 0 ? position / duration : 0;
  const liked = isFavorite(currentTrack.id);

  const repeatColor =
    repeatMode !== "none" ? "#A78BFA" : colors.mutedForeground;

  return (
    <View style={[styles.container, { backgroundColor: "#08080F" }]}>
      {/* Background blur from artwork */}
      <Image
        source={currentTrack.artwork}
        style={styles.bgArt}
        contentFit="cover"
        blurRadius={40}
      />
      <LinearGradient
        colors={["rgba(8,8,15,0.55)", "rgba(8,8,15,0.88)", "#08080F"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.65 }}
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={({ pressed }) => [styles.headerBtn, pressed && { opacity: 0.6 }]}
        >
          <Feather name="chevron-down" size={28} color="#fff" />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerLabel}>NOW PLAYING</Text>
          {currentTrack.album ? (
            <Text style={styles.headerAlbum} numberOfLines={1}>{currentTrack.album}</Text>
          ) : null}
        </View>
        <Pressable
          hitSlop={12}
          onPress={() => setShowPlaylistModal(true)}
          style={({ pressed }) => [styles.headerBtn, pressed && { opacity: 0.6 }]}
        >
          <Feather name="more-horizontal" size={24} color="#fff" />
        </Pressable>
      </View>

      {/* Artwork */}
      <View style={styles.artworkContainer}>
        <Animated.View style={[artworkStyle, styles.artworkShadow]}>
          <Image
            source={currentTrack.artwork}
            style={[styles.artwork, { width: ARTWORK_SIZE, height: ARTWORK_SIZE }]}
            contentFit="cover"
          />
        </Animated.View>
      </View>

      {/* Body */}
      <View style={styles.body}>
        {/* Track info + like */}
        <View style={styles.trackInfo}>
          <View style={styles.trackInfoText}>
            <Text style={styles.trackTitle} numberOfLines={1}>{currentTrack.title}</Text>
            <Text style={styles.trackArtist} numberOfLines={1}>{currentTrack.artist}</Text>
          </View>
          <Pressable
            onPress={() => toggleFavorite(currentTrack)}
            hitSlop={10}
            style={({ pressed }) => [pressed && { opacity: 0.6 }]}
          >
            <Feather name="heart" size={26} color={liked ? "#A78BFA" : "rgba(255,255,255,0.4)"} />
          </Pressable>
        </View>

        {/* Seek bar */}
        <View style={styles.seekerContainer}>
          <View
            style={[styles.seekBarTrack, { backgroundColor: "rgba(255,255,255,0.15)" }]}
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
                  backgroundColor: "#A78BFA",
                  width: `${(isSeeking ? seekPosition : progressRatio) * 100}%`,
                },
              ]}
            />
            <View
              style={[
                styles.seekHandle,
                {
                  backgroundColor: "#fff",
                  left: `${(isSeeking ? seekPosition : progressRatio) * 100}%`,
                },
              ]}
            />
          </View>
          <View style={styles.seekTimes}>
            <Text style={styles.seekTime}>{formatDuration(position / 1000)}</Text>
            <Text style={styles.seekTime}>{formatDuration(duration / 1000)}</Text>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <Pressable
            onPress={toggleShuffle}
            hitSlop={10}
            style={({ pressed }) => [pressed && { opacity: 0.6 }]}
          >
            <Feather
              name="shuffle"
              size={22}
              color={isShuffled ? "#A78BFA" : "rgba(255,255,255,0.45)"}
            />
          </Pressable>

          <Pressable
            onPress={playPrev}
            hitSlop={10}
            style={({ pressed }) => [pressed && { opacity: 0.6 }]}
          >
            <Feather name="skip-back" size={34} color="#fff" />
          </Pressable>

          <Pressable
            style={styles.playButton}
            onPress={togglePlayPause}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Feather name={isPlaying ? "pause" : "play"} size={30} color="#fff" style={{ paddingLeft: isPlaying ? 0 : 2 }} />
            )}
          </Pressable>

          <Pressable
            onPress={playNext}
            hitSlop={10}
            style={({ pressed }) => [pressed && { opacity: 0.6 }]}
          >
            <Feather name="skip-forward" size={34} color="#fff" />
          </Pressable>

          <Pressable
            onPress={cycleRepeat}
            hitSlop={10}
            style={({ pressed }) => [pressed && { opacity: 0.6 }]}
          >
            <View>
              <Feather
                name={repeatMode === "one" ? "repeat" : "repeat"}
                size={22}
                color={repeatColor}
              />
              {repeatMode === "one" && (
                <View style={styles.repeatOneDot} />
              )}
            </View>
          </Pressable>
        </View>

        {/* Bottom actions */}
        <View style={[styles.bottomActions, { paddingBottom: insets.bottom + 20 }]}>
          <Pressable
            onPress={() => setShowPlaylistModal(true)}
            style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.65 }]}
          >
            <Feather name="plus-circle" size={20} color="rgba(255,255,255,0.55)" />
            <Text style={styles.actionLabel}>Add to Playlist</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/queue")}
            style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.65 }]}
          >
            <Feather name="list" size={20} color="rgba(255,255,255,0.55)" />
            <Text style={styles.actionLabel}>Queue {queue.length > 0 ? `(${queue.length})` : ""}</Text>
          </Pressable>
        </View>
      </View>

      <AddToPlaylistModal
        visible={showPlaylistModal}
        track={currentTrack}
        onClose={() => setShowPlaylistModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bgArt: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerBtn: { width: 40, alignItems: "center" },
  headerCenter: { flex: 1, alignItems: "center" },
  headerLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: "rgba(255,255,255,0.5)",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  headerAlbum: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.7)",
    marginTop: 3,
    maxWidth: 200,
  },
  artworkContainer: {
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 8,
  },
  artworkShadow: {
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 16,
  },
  artwork: {
    borderRadius: 20,
    backgroundColor: "#1C1C2A",
  },
  body: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 12,
    gap: 24,
  },
  trackInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  trackInfoText: { flex: 1, gap: 5 },
  trackTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  trackArtist: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.6)",
  },
  seekerContainer: { gap: 10 },
  seekBarTrack: {
    height: 5,
    borderRadius: 3,
    position: "relative",
  },
  seekBarFill: {
    height: 5,
    borderRadius: 3,
    position: "absolute",
    left: 0,
    top: 0,
  },
  seekHandle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    position: "absolute",
    top: -5.5,
    marginLeft: -8,
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  seekTimes: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  seekTime: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.45)",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#7C3AED",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55,
    shadowRadius: 16,
    elevation: 10,
  },
  repeatOneDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#A78BFA",
    position: "absolute",
    bottom: -5,
    alignSelf: "center",
  },
  bottomActions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 32,
  },
  actionBtn: {
    alignItems: "center",
    gap: 6,
  },
  actionLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.45)",
  },
});
