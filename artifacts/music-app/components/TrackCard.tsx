import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import React, { memo, useState } from "react";
import {
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
  FadeIn,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";

import AddToPlaylistModal from "@/components/AddToPlaylistModal";
import BufferingSpinner from "@/components/BufferingSpinner";
import { useDownloads } from "@/contexts/DownloadContext";
import { useLibrary } from "@/contexts/LibraryContext";
import { usePlayer } from "@/contexts/PlayerContext";
import { formatDuration, Track } from "@/data/tracks";

interface TrackCardProps {
  track: Track;
  queue?: Track[];
  showIndex?: number;
}

function CircularProgress({ progress, size = 32 }: { progress: number; size?: number }) {
  const r = (size - 4) / 2;
  const circumference = 2 * Math.PI * r;
  const filled = circumference * progress;
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(196,181,253,0.15)" strokeWidth={2} fill="none" />
      <Circle
        cx={size / 2} cy={size / 2} r={r}
        stroke="#C4B5FD" strokeWidth={2} fill="none"
        strokeDasharray={`${filled} ${circumference - filled}`}
        strokeDashoffset={0}
        strokeLinecap="round"
        rotation={-90}
        origin={`${size / 2}, ${size / 2}`}
      />
    </Svg>
  );
}

function DownloadButton({ track }: { track: Track }) {
  const { isDownloaded, downloadTrack, downloadProgress, deleteDownload } = useDownloads();
  const downloaded = isDownloaded(track.id);
  const progress = downloadProgress[track.id];
  const isDownloading = progress?.status === "downloading";
  const isError = progress?.status === "error";
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.8, { damping: 8, stiffness: 400 }, () => {
      scale.value = withSpring(1, { damping: 10, stiffness: 300 });
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (downloaded) deleteDownload(track.id);
    else if (!isDownloading) downloadTrack(track);
  };

  if (isDownloading) {
    const pct = progress.progress ?? 0;
    return (
      <Pressable onPress={handlePress} hitSlop={8}>
        <Animated.View style={animStyle}>
          <CircularProgress progress={pct} size={30} />
        </Animated.View>
      </Pressable>
    );
  }

  return (
    <Animated.View style={animStyle}>
      <Pressable onPress={handlePress} hitSlop={8}>
        <Feather
          name={downloaded ? "check-circle" : isError ? "alert-circle" : "download"}
          size={18}
          color={downloaded ? "#C4B5FD" : isError ? "#EF4444" : "rgba(255,255,255,0.35)"}
        />
      </Pressable>
    </Animated.View>
  );
}

const TrackCard = memo(function TrackCard({ track, queue, showIndex }: TrackCardProps) {
  const { playTrack, currentTrack, isPlaying, isLoading } = usePlayer();
  const { isFavorite, toggleFavorite } = useLibrary();
  const [showModal, setShowModal] = useState(false);

  const isActive = currentTrack?.id === track.id;
  const isThisLoading = isActive && isLoading;
  const liked = isFavorite(track.id);

  const scale = useSharedValue(1);
  const heartScale = useSharedValue(1);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const handlePress = () => playTrack(track, queue ?? [track]);
  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowModal(true);
  };

  return (
    <>
      <Animated.View style={cardStyle} entering={FadeIn.duration(200)}>
        <Pressable
          style={[styles.container, isActive && styles.containerActive]}
          onPress={handlePress}
          onLongPress={handleLongPress}
          onPressIn={() => { scale.value = withSpring(0.975, { damping: 14, stiffness: 300 }); }}
          onPressOut={() => { scale.value = withSpring(1, { damping: 12, stiffness: 260 }); }}
        >
          <View style={styles.left}>
            {showIndex !== undefined && !isActive && (
              <Text style={styles.index}>{showIndex + 1}</Text>
            )}
            <View style={styles.artWrapper}>
              <Image source={track.artwork} style={styles.artwork} contentFit="cover" />
              {isActive && (
                <View style={styles.activeOverlay}>
                  {isThisLoading
                    ? <BufferingSpinner size={22} color="#fff" strokeWidth={2} />
                    : <Feather name={isPlaying ? "pause" : "play"} size={14} color="#fff" />}
                </View>
              )}
            </View>
            <View style={styles.info}>
              <Text style={[styles.title, isActive && { color: "#C4B5FD" }]} numberOfLines={1}>
                {track.title}
              </Text>
              <Text style={styles.artist} numberOfLines={1}>{track.artist}</Text>
            </View>
          </View>

          <View style={styles.right}>
            <Text style={styles.duration}>{formatDuration(track.duration)}</Text>
            <Animated.View style={heartStyle}>
              <Pressable
                onPress={() => {
                  heartScale.value = withSpring(0.65, { damping: 8, stiffness: 400 }, () => {
                    heartScale.value = withSpring(1.1, { damping: 10, stiffness: 300 }, () => {
                      heartScale.value = withSpring(1, { damping: 12, stiffness: 250 });
                    });
                  });
                  toggleFavorite(track);
                }}
                hitSlop={8}
              >
                <Feather name="heart" size={18} color={liked ? "#C4B5FD" : "rgba(255,255,255,0.28)"} />
              </Pressable>
            </Animated.View>
            <DownloadButton track={track} />
            <Pressable onPress={() => setShowModal(true)} hitSlop={8} style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1 }]}>
              <Feather name="more-vertical" size={18} color="rgba(255,255,255,0.28)" />
            </Pressable>
          </View>
        </Pressable>
      </Animated.View>

      <AddToPlaylistModal visible={showModal} track={track} onClose={() => setShowModal(false)} />
    </>
  );
});

export default TrackCard;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 9,
    justifyContent: "space-between",
  },
  containerActive: {
    backgroundColor: "rgba(196,181,253,0.07)",
    borderRadius: 10,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
    minWidth: 0,
  },
  index: {
    width: 18,
    fontSize: 13,
    textAlign: "center",
    color: "rgba(255,255,255,0.3)",
    fontFamily: Platform.OS === "ios" ? "Inter_400Regular" : undefined,
  },
  artWrapper: { position: "relative" },
  artwork: {
    width: 48,
    height: 48,
    borderRadius: 6,
    backgroundColor: "#111",
  },
  activeOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 6,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  info: { flex: 1, gap: 3, minWidth: 0 },
  title: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
  },
  artist: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.45)",
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexShrink: 0,
  },
  duration: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.28)",
  },
});
