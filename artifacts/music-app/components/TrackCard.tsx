import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import React, { memo, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import AddToPlaylistModal from "@/components/AddToPlaylistModal";
import GlassIcon from "@/components/GlassIcon";
import { useDownloads } from "@/contexts/DownloadContext";
import { useLibrary } from "@/contexts/LibraryContext";
import { usePlayer } from "@/contexts/PlayerContext";
import { formatDuration, Track } from "@/data/tracks";

interface TrackCardProps {
  track: Track;
  queue?: Track[];
  showIndex?: number;
}

function DownloadButton({ track }: { track: Track }) {
  const { isDownloaded, downloadTrack, downloadProgress, deleteDownload } = useDownloads();
  const downloaded = isDownloaded(track.id);
  const progress = downloadProgress[track.id];
  const isDownloading = progress?.status === "downloading";

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (downloaded) deleteDownload(track.id);
    else if (!isDownloading) downloadTrack(track);
  };

  if (isDownloading) {
    const pct = Math.round((progress.progress ?? 0) * 100);
    return (
      <Pressable onPress={handlePress} hitSlop={8}>
        <View style={styles.progressRing}>
          <Text style={styles.progressText}>{pct}%</Text>
        </View>
      </Pressable>
    );
  }

  return (
    <GlassIcon
      name={downloaded ? "check-circle" : "download"}
      size={16}
      containerSize={32}
      active={downloaded}
      color={downloaded ? "#A78BFA" : "rgba(255,255,255,0.35)"}
      onPress={handlePress}
    />
  );
}

const TrackCard = memo(function TrackCard({ track, queue, showIndex }: TrackCardProps) {
  const { playTrack, currentTrack, isPlaying, isLoading } = usePlayer();
  const { isFavorite, toggleFavorite } = useLibrary();
  const [showModal, setShowModal] = useState(false);

  const isActive = currentTrack?.id === track.id;
  const liked = isFavorite(track.id);

  const handlePress = () => playTrack(track, queue ?? [track]);
  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowModal(true);
  };

  return (
    <>
      <Pressable
        style={({ pressed }) => [
          styles.container,
          isActive && styles.containerActive,
          pressed && { opacity: 0.75 },
        ]}
        onPress={handlePress}
        onLongPress={handleLongPress}
      >
        <View style={styles.left}>
          {showIndex !== undefined && !isActive && (
            <Text style={styles.index}>{showIndex + 1}</Text>
          )}
          <View style={styles.artWrapper}>
            <Image source={track.artwork} style={styles.artwork} contentFit="cover" />
            {isActive && (
              <View style={styles.activeOverlay}>
                {isLoading
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Feather name={isPlaying ? "pause" : "play"} size={14} color="#fff" />}
              </View>
            )}
          </View>
          <View style={styles.info}>
            <Text
              style={[styles.title, isActive && { color: "#A78BFA" }]}
              numberOfLines={1}
            >
              {track.title}
            </Text>
            <Text style={styles.artist} numberOfLines={1}>{track.artist}</Text>
          </View>
        </View>

        <View style={styles.right}>
          <Text style={styles.duration}>{formatDuration(track.duration)}</Text>
          <GlassIcon
            name="heart"
            size={16}
            containerSize={32}
            active={liked}
            color={liked ? "#A78BFA" : "rgba(255,255,255,0.3)"}
            onPress={() => toggleFavorite(track)}
          />
          <DownloadButton track={track} />
          <GlassIcon
            name="more-vertical"
            size={16}
            containerSize={32}
            onPress={() => setShowModal(true)}
          />
        </View>
      </Pressable>

      <AddToPlaylistModal
        visible={showModal}
        track={track}
        onClose={() => setShowModal(false)}
      />
    </>
  );
});

export default TrackCard;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    justifyContent: "space-between",
  },
  containerActive: {
    backgroundColor: "rgba(124,58,237,0.10)",
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
    color: "rgba(255,255,255,0.35)",
    fontFamily: Platform.OS === "ios" ? "Inter_400Regular" : undefined,
  },
  artWrapper: { position: "relative" },
  artwork: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: "#0a0a18",
  },
  activeOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  info: { flex: 1, gap: 3, minWidth: 0 },
  title: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  artist: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.45)",
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 0,
  },
  duration: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.3)",
  },
  progressRing: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "rgba(167,139,250,0.6)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(8,8,16,0.5)",
  },
  progressText: {
    fontSize: 6,
    color: "#A78BFA",
    fontFamily: "Inter_700Bold",
  },
});
