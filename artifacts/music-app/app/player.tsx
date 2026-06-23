import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import AddToPlaylistModal from "@/components/AddToPlaylistModal";
import BufferingSpinner from "@/components/BufferingSpinner";
import GlassCard from "@/components/GlassCard";
import GlassIcon from "@/components/GlassIcon";
import WaveBackground from "@/components/WaveBackground";
import { useLibrary } from "@/contexts/LibraryContext";
import { usePlayer } from "@/contexts/PlayerContext";
import { useStats } from "@/contexts/StatsContext";
import { formatDuration } from "@/data/tracks";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const ARTWORK_SIZE = Math.min(SCREEN_WIDTH - 64, 320);

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
  const vinylRotation = useSharedValue(0);
  const vinylRotationRef = useRef(0);
  const playBtnScale = useSharedValue(1);
  const heartScale = useSharedValue(1);

  useEffect(() => {
    artworkScale.value = withSpring(isPlaying ? 1 : 0.88, { damping: 15, stiffness: 100 });
    if (isPlaying) {
      vinylRotation.value = withRepeat(
        withTiming(vinylRotationRef.current + 360, { duration: 8000, easing: Easing.linear }),
        -1,
        false
      );
    } else {
      vinylRotation.value = withTiming(vinylRotation.value, { duration: 600, easing: Easing.out(Easing.ease) });
    }
  }, [isPlaying]);

  const artworkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: artworkScale.value }],
  }));

  const vinylStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${vinylRotation.value}deg` }],
  }));

  const playBtnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: playBtnScale.value }],
  }));

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  useEffect(() => {
    if (currentTrack && !isPlaying && duration > 0 && position > 10000) {
      recordPlay(Math.floor(position / 1000), currentTrack.genre);
    }
  }, [currentTrack?.id]);

  if (!currentTrack) {
    router.back();
    return null;
  }

  const progressRatio = duration > 0 ? Math.min(1, position / duration) : 0;
  const liked = isFavorite(currentTrack.id);

  return (
    <View style={styles.container}>
      <WaveBackground genre={currentTrack.genre} intensity={0.9} />

      <Image
        source={currentTrack.artwork}
        style={[StyleSheet.absoluteFill, { opacity: 0.12 }]}
        contentFit="cover"
        blurRadius={40}
      />
      <LinearGradient
        colors={["rgba(0,0,0,0.2)", "rgba(0,0,0,0.6)", "rgba(0,0,0,0.96)"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.72 }}
      />

      {/* Header */}
      <Animated.View entering={FadeInDown.duration(350).delay(50)} style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <GlassIcon name="chevron-down" size={22} containerSize={44} onPress={() => router.back()} />
        <View style={styles.headerCenter}>
          <Text style={styles.headerLabel}>NOW PLAYING</Text>
          {currentTrack.album ? (
            <Text style={styles.headerAlbum} numberOfLines={1}>{currentTrack.album}</Text>
          ) : null}
        </View>
        <GlassIcon name="more-horizontal" size={20} containerSize={44} onPress={() => setShowPlaylistModal(true)} />
      </Animated.View>

      {/* Artwork */}
      <Animated.View entering={FadeIn.duration(400).delay(100)} style={styles.artworkContainer}>
        <Animated.View style={[artworkStyle, styles.artworkShadow]}>
          <GlassCard style={styles.artworkFrame} intensity={0} shine>
            {/* Vinyl ring behind art */}
            <Animated.View style={[vinylStyle, styles.vinylRing]} />
            <Image
              source={currentTrack.artwork}
              style={{ width: ARTWORK_SIZE, height: ARTWORK_SIZE, borderRadius: 22 }}
              contentFit="cover"
            />
            {isLoading && (
              <View style={styles.artLoadingOverlay}>
                <BufferingSpinner size={42} color="rgba(255,255,255,0.9)" strokeWidth={2.5} />
              </View>
            )}
          </GlassCard>
        </Animated.View>
      </Animated.View>

      {/* Body */}
      <Animated.View entering={FadeInDown.duration(380).delay(150)} style={styles.body}>
        {/* Track info */}
        <View style={styles.trackInfo}>
          <View style={styles.trackInfoText}>
            <Text style={styles.trackTitle} numberOfLines={1}>{currentTrack.title}</Text>
            <Text style={styles.trackArtist} numberOfLines={1}>{currentTrack.artist}</Text>
          </View>
          <Animated.View style={heartStyle}>
            <GlassIcon
              name="heart"
              size={22}
              containerSize={46}
              active={liked}
              color={liked ? "#C4B5FD" : "rgba(255,255,255,0.55)"}
              onPress={() => {
                heartScale.value = withSpring(0.7, { damping: 8, stiffness: 400 }, () => {
                  heartScale.value = withSpring(1.1, { damping: 10, stiffness: 300 }, () => {
                    heartScale.value = withSpring(1, { damping: 12, stiffness: 250 });
                  });
                });
                toggleFavorite(currentTrack);
              }}
            />
          </Animated.View>
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
            <View style={[styles.seekBarFill, { width: `${(isSeeking ? seekPosition : progressRatio) * 100}%` }]} />
            <View style={[styles.seekHandle, { left: `${(isSeeking ? seekPosition : progressRatio) * 100}%` }]} />
          </View>
          <View style={styles.seekTimes}>
            <Text style={styles.seekTime}>{formatDuration(position / 1000)}</Text>
            <Text style={styles.seekTime}>{formatDuration(duration / 1000)}</Text>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <GlassIcon name="shuffle" size={20} containerSize={44} active={isShuffled} onPress={toggleShuffle} />
          <GlassIcon name="skip-back" size={26} containerSize={52} onPress={playPrev} />

          <Animated.View style={playBtnStyle}>
            <Pressable
              style={styles.playButton}
              onPress={() => {
                playBtnScale.value = withSpring(0.88, { damping: 8, stiffness: 400 }, () => {
                  playBtnScale.value = withSpring(1, { damping: 12, stiffness: 260 });
                });
                togglePlayPause();
              }}
            >
              {Platform.OS === "ios" ? (
                <BlurView intensity={22} tint="dark" style={StyleSheet.absoluteFill} />
              ) : null}
              <LinearGradient
                colors={["rgba(255,255,255,0.20)", "rgba(255,255,255,0.05)", "rgba(255,255,255,0.01)"]}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 0.5, y: 1 }}
              />
              <View style={styles.playBorderHighlight} />
              {isLoading ? (
                <BufferingSpinner size={30} color="#fff" strokeWidth={2.5} />
              ) : (
                <Feather
                  name={isPlaying ? "pause" : "play"}
                  size={30}
                  color="#fff"
                  style={{ marginLeft: isPlaying ? 0 : 3 }}
                />
              )}
            </Pressable>
          </Animated.View>

          <GlassIcon name="skip-forward" size={26} containerSize={52} onPress={playNext} />
          <GlassIcon name="repeat" size={20} containerSize={44} active={repeatMode !== "none"} onPress={cycleRepeat} />
        </View>

        {/* Bottom actions */}
        <View style={[styles.bottomActions, { paddingBottom: insets.bottom + 16 }]}>
          <Pressable
            onPress={() => setShowPlaylistModal(true)}
            style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.6 }]}
          >
            <GlassIcon name="plus-circle" size={18} containerSize={38} />
            <Text style={styles.actionLabel}>Add to Playlist</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push("/queue")}
            style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.6 }]}
          >
            <GlassIcon name="list" size={18} containerSize={38} />
            <Text style={styles.actionLabel}>
              Queue {queue.length > 0 ? `(${queue.length})` : ""}
            </Text>
          </Pressable>
        </View>
      </Animated.View>

      <AddToPlaylistModal
        visible={showPlaylistModal}
        track={currentTrack}
        onClose={() => setShowPlaylistModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
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
    color: "rgba(255,255,255,0.4)",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  headerAlbum: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.6)",
    marginTop: 3,
    maxWidth: 200,
  },
  artworkContainer: { alignItems: "center", paddingHorizontal: 32, paddingVertical: 12 },
  artworkShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.8,
    shadowRadius: 36,
    elevation: 24,
  },
  artworkFrame: {
    borderRadius: 24,
    overflow: "hidden",
    width: ARTWORK_SIZE,
    height: ARTWORK_SIZE,
  },
  vinylRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: ARTWORK_SIZE / 2,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.04)",
  },
  artLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
  },
  body: { flex: 1, paddingHorizontal: 32, paddingTop: 8, gap: 22 },
  trackInfo: { flexDirection: "row", alignItems: "center", gap: 14 },
  trackInfoText: { flex: 1, gap: 5 },
  trackTitle: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#fff" },
  trackArtist: { fontSize: 15, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.5)" },
  seekerContainer: { gap: 10 },
  seekBarTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.1)",
    position: "relative",
  },
  seekBarFill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.88)",
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
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 4,
  },
  seekTimes: { flexDirection: "row", justifyContent: "space-between" },
  seekTime: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.38)" },
  controls: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(20,20,35,0.55)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    ...Platform.select({
      ios: { shadowColor: "#fff", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.18, shadowRadius: 24 },
      android: { elevation: 10 },
    }),
  },
  playBorderHighlight: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 36,
    borderWidth: 1,
    borderTopColor: "rgba(255,255,255,0.28)",
    borderLeftColor: "rgba(255,255,255,0.16)",
    borderRightColor: "rgba(255,255,255,0.06)",
    borderBottomColor: "rgba(255,255,255,0.04)",
  },
  bottomActions: { flexDirection: "row", justifyContent: "center", gap: 36 },
  actionBtn: { alignItems: "center", gap: 8 },
  actionLabel: { fontSize: 11, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.4)" },
});
