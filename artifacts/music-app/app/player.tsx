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
  ImageBackground,
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
import GlassCard from "@/components/GlassCard";
import GlassIcon from "@/components/GlassIcon";
import { useLibrary } from "@/contexts/LibraryContext";
import { usePlayer } from "@/contexts/PlayerContext";
import { useStats } from "@/contexts/StatsContext";
import { formatDuration } from "@/data/tracks";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const ARTWORK_SIZE = Math.min(SCREEN_WIDTH - 64, 320);
const earthBg = require("../assets/images/earth-bg.jpg");

export default function PlayerScreen() {
  const insets = useSafeAreaInsets();
  const {
    currentTrack, isPlaying, position, duration, isLoading,
    togglePlayPause, playNext, playPrev, seekTo,
    isShuffled, toggleShuffle, repeatMode, cycleRepeat, queue,
  } = usePlayer();
  const { isFavorite, toggleFavorite } = useLibrary();
  const { recordPlay } = useStats();

  const [isSeeking, setIsSeeking] = useState(false);
  const [seekPosition, setSeekPosition] = useState(0);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);

  const artworkScale = useSharedValue(1);

  useEffect(() => {
    artworkScale.value = withSpring(isPlaying ? 1 : 0.88, { damping: 15, stiffness: 100 });
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

  return (
    <View style={styles.container}>
      {/* Earth bg + artwork blur overlay */}
      <ImageBackground source={earthBg} style={StyleSheet.absoluteFill} resizeMode="cover" />
      <Image
        source={currentTrack.artwork}
        style={[StyleSheet.absoluteFill, { opacity: 0.18 }]}
        contentFit="cover"
        blurRadius={35}
      />
      <LinearGradient
        colors={["rgba(2,4,12,0.55)", "rgba(2,4,12,0.80)", "rgba(2,4,12,0.97)"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.7 }}
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <GlassIcon
          name="chevron-down"
          size={22}
          containerSize={44}
          onPress={() => router.back()}
        />
        <View style={styles.headerCenter}>
          <Text style={styles.headerLabel}>NOW PLAYING</Text>
          {currentTrack.album ? (
            <Text style={styles.headerAlbum} numberOfLines={1}>{currentTrack.album}</Text>
          ) : null}
        </View>
        <GlassIcon
          name="more-horizontal"
          size={20}
          containerSize={44}
          onPress={() => setShowPlaylistModal(true)}
        />
      </View>

      {/* Artwork */}
      <View style={styles.artworkContainer}>
        <Animated.View style={[artworkStyle, styles.artworkShadow]}>
          <GlassCard style={styles.artworkFrame} intensity={0} shine>
            <Image
              source={currentTrack.artwork}
              style={{ width: ARTWORK_SIZE, height: ARTWORK_SIZE, borderRadius: 22 }}
              contentFit="cover"
            />
          </GlassCard>
        </Animated.View>
      </View>

      {/* Body */}
      <View style={styles.body}>
        {/* Track info */}
        <View style={styles.trackInfo}>
          <View style={styles.trackInfoText}>
            <Text style={styles.trackTitle} numberOfLines={1}>{currentTrack.title}</Text>
            <Text style={styles.trackArtist} numberOfLines={1}>{currentTrack.artist}</Text>
          </View>
          <GlassIcon
            name="heart"
            size={22}
            containerSize={46}
            active={liked}
            color={liked ? "#A78BFA" : "rgba(255,255,255,0.5)"}
            onPress={() => toggleFavorite(currentTrack)}
          />
        </View>

        {/* Seek bar */}
        <View style={styles.seekerContainer}>
          <View
            style={styles.seekBarTrack}
            onStartShouldSetResponder={() => true}
            onMoveShouldSetResponder={() => true}
            onResponderGrant={(e) => {
              setIsSeeking(true);
              setSeekPosition(Math.max(0, Math.min(1, e.nativeEvent.locationX / (SCREEN_WIDTH - 64))));
            }}
            onResponderMove={(e) => {
              setSeekPosition(Math.max(0, Math.min(1, e.nativeEvent.locationX / (SCREEN_WIDTH - 64))));
            }}
            onResponderRelease={() => {
              seekTo(seekPosition * duration);
              setIsSeeking(false);
            }}
          >
            <View
              style={[styles.seekBarFill, { width: `${(isSeeking ? seekPosition : progressRatio) * 100}%` }]}
            />
            <View
              style={[styles.seekHandle, { left: `${(isSeeking ? seekPosition : progressRatio) * 100}%` }]}
            />
          </View>
          <View style={styles.seekTimes}>
            <Text style={styles.seekTime}>{formatDuration(position / 1000)}</Text>
            <Text style={styles.seekTime}>{formatDuration(duration / 1000)}</Text>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <GlassIcon
            name="shuffle"
            size={20}
            containerSize={44}
            active={isShuffled}
            onPress={toggleShuffle}
          />
          <GlassIcon
            name="skip-back"
            size={26}
            containerSize={52}
            onPress={playPrev}
          />

          {/* Play button */}
          <Pressable
            style={({ pressed }) => [styles.playButton, pressed && { opacity: 0.8 }]}
            onPress={togglePlayPause}
          >
            <LinearGradient
              colors={["rgba(255,255,255,0.22)", "rgba(255,255,255,0.06)", "rgba(255,255,255,0.02)"]}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 0.5, y: 1 }}
            />
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Feather
                name={isPlaying ? "pause" : "play"}
                size={30}
                color="#fff"
                style={{ marginLeft: isPlaying ? 0 : 3 }}
              />
            )}
          </Pressable>

          <GlassIcon
            name="skip-forward"
            size={26}
            containerSize={52}
            onPress={playNext}
          />
          <GlassIcon
            name="repeat"
            size={20}
            containerSize={44}
            active={repeatMode !== "none"}
            onPress={cycleRepeat}
          />
        </View>

        {/* Bottom actions */}
        <View style={[styles.bottomActions, { paddingBottom: insets.bottom + 16 }]}>
          <Pressable
            onPress={() => setShowPlaylistModal(true)}
            style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.65 }]}
          >
            <GlassIcon name="plus-circle" size={18} containerSize={38} />
            <Text style={styles.actionLabel}>Add to Playlist</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push("/queue")}
            style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.65 }]}
          >
            <GlassIcon name="list" size={18} containerSize={38} />
            <Text style={styles.actionLabel}>
              Queue {queue.length > 0 ? `(${queue.length})` : ""}
            </Text>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  headerCenter: { flex: 1, alignItems: "center" },
  headerLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: "rgba(255,255,255,0.45)",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  headerAlbum: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.65)",
    marginTop: 3,
    maxWidth: 200,
  },
  artworkContainer: { alignItems: "center", paddingHorizontal: 32, paddingVertical: 12 },
  artworkShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.7,
    shadowRadius: 30,
    elevation: 20,
  },
  artworkFrame: {
    borderRadius: 24,
    overflow: "hidden",
    width: ARTWORK_SIZE,
    height: ARTWORK_SIZE,
  },
  body: { flex: 1, paddingHorizontal: 32, paddingTop: 8, gap: 22 },
  trackInfo: { flexDirection: "row", alignItems: "center", gap: 14 },
  trackInfoText: { flex: 1, gap: 5 },
  trackTitle: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#fff" },
  trackArtist: { fontSize: 15, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.55)" },
  seekerContainer: { gap: 10 },
  seekBarTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.12)",
    position: "relative",
  },
  seekBarFill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.85)",
    position: "absolute",
    left: 0,
    top: 0,
  },
  seekHandle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#fff",
    position: "absolute",
    top: -5,
    marginLeft: -7,
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
  },
  seekTimes: { flexDirection: "row", justifyContent: "space-between" },
  seekTime: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.4)" },
  controls: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: "rgba(255,255,255,0.28)",
    borderLeftColor: "rgba(255,255,255,0.16)",
    borderRightColor: "rgba(255,255,255,0.06)",
    borderBottomColor: "rgba(255,255,255,0.04)",
    backgroundColor: "rgba(20,20,35,0.6)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    ...Platform.select({
      ios: { shadowColor: "#fff", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.15, shadowRadius: 20 },
      android: { elevation: 10 },
    }),
  },
  bottomActions: { flexDirection: "row", justifyContent: "center", gap: 36 },
  actionBtn: { alignItems: "center", gap: 8 },
  actionLabel: { fontSize: 11, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.4)" },
});
