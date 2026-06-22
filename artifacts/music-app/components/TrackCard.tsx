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
import { useDownloads } from "@/contexts/DownloadContext";
import { useLibrary } from "@/contexts/LibraryContext";
import { usePlayer } from "@/contexts/PlayerContext";
import { formatDuration, Track } from "@/data/tracks";
import { useColors } from "@/hooks/useColors";

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
    if (downloaded) {
      deleteDownload(track.id);
    } else if (!isDownloading) {
      downloadTrack(track);
    }
  };

  if (isDownloading) {
    const pct = Math.round((progress.progress ?? 0) * 100);
    return (
      <Pressable onPress={handlePress} hitSlop={8} style={styles.downloadBtn}>
        <View style={styles.progressRing}>
          <Text style={styles.progressText}>{pct}%</Text>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={handlePress}
      hitSlop={8}
      style={({ pressed }) => [pressed && { opacity: 0.6 }]}
    >
      <Feather
        name={downloaded ? "check-circle" : "download"}
        size={18}
        color={downloaded ? "#A78BFA" : "rgba(255,255,255,0.3)"}
      />
    </Pressable>
  );
}

const TrackCard = memo(function TrackCard({ track, queue, showIndex }: TrackCardProps) {
  const colors = useColors();
  const { playTrack, currentTrack, isPlaying, isLoading } = usePlayer();
  const { isFavorite, toggleFavorite } = useLibrary();
  const { getLocalUri } = useDownloads();
  const [showModal, setShowModal] = useState(false);

  const isActive = currentTrack?.id === track.id;
  const liked = isFavorite(track.id);

  const handlePress = () => {
    const localUri = getLocalUri(track.id) ?? undefined;
    playTrack(track, queue ?? [track], localUri);
  };

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowModal(true);
  };

  return (
    <>
      <Pressable
        style={({ pressed }) => [
          styles.container,
          { backgroundColor: isActive ? colors.secondary : "transparent" },
          pressed && { opacity: 0.7 },
        ]}
        onPress={handlePress}
        onLongPress={handleLongPress}
      >
        <View style={styles.left}>
          {showIndex !== undefined && !isActive ? (
            <Text style={[styles.index, { color: colors.mutedForeground }]}>
              {showIndex + 1}
            </Text>
          ) : null}
          <View style={styles.artworkContainer}>
            <Image
              source={track.artwork}
              style={styles.artwork}
              contentFit="cover"
            />
            {isActive && (
              <View style={[styles.activeOverlay, { backgroundColor: "rgba(0,0,0,0.5)" }]}>
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Feather
                    name={isPlaying ? "pause" : "play"}
                    size={14}
                    color="#fff"
                  />
                )}
              </View>
            )}
          </View>
          <View style={styles.info}>
            <Text
              style={[
                styles.title,
                { color: isActive ? "#A78BFA" : colors.foreground },
              ]}
              numberOfLines={1}
            >
              {track.title}
            </Text>
            <Text style={[styles.artist, { color: colors.mutedForeground }]} numberOfLines={1}>
              {track.artist}
            </Text>
          </View>
        </View>
        <View style={styles.right}>
          <Text style={[styles.duration, { color: colors.mutedForeground }]}>
            {formatDuration(track.duration)}
          </Text>
          <Pressable
            onPress={() => toggleFavorite(track)}
            hitSlop={8}
            style={({ pressed }) => [pressed && { opacity: 0.6 }]}
          >
            <Feather
              name="heart"
              size={18}
              color={liked ? "#A78BFA" : colors.mutedForeground}
            />
          </Pressable>
          <DownloadButton track={track} />
          <Pressable
            onPress={() => setShowModal(true)}
            hitSlop={8}
            style={({ pressed }) => [pressed && { opacity: 0.6 }]}
          >
            <Feather name="more-vertical" size={18} color="rgba(255,255,255,0.3)" />
          </Pressable>
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
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    justifyContent: "space-between",
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
    minWidth: 0,
  },
  index: {
    width: 20,
    fontSize: 14,
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "Inter_400Regular" : undefined,
  },
  artworkContainer: {
    position: "relative",
  },
  artwork: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: "#1C1C2A",
  },
  activeOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "Inter_600SemiBold" : undefined,
  },
  artist: {
    fontSize: 13,
    fontFamily: Platform.OS === "ios" ? "Inter_400Regular" : undefined,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexShrink: 0,
  },
  duration: {
    fontSize: 13,
    fontFamily: Platform.OS === "ios" ? "Inter_400Regular" : undefined,
  },
  downloadBtn: {
    alignItems: "center",
    justifyContent: "center",
  },
  progressRing: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#A78BFA",
    alignItems: "center",
    justifyContent: "center",
  },
  progressText: {
    fontSize: 6,
    color: "#A78BFA",
    fontFamily: Platform.OS === "ios" ? "Inter_600SemiBold" : undefined,
  },
});
