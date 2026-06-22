import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import React, { memo } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useLibrary } from "@/contexts/LibraryContext";
import { usePlayer } from "@/contexts/PlayerContext";
import { formatDuration, Track } from "@/data/tracks";
import { useColors } from "@/hooks/useColors";

interface TrackCardProps {
  track: Track;
  queue?: Track[];
  showIndex?: number;
}

const TrackCard = memo(function TrackCard({ track, queue, showIndex }: TrackCardProps) {
  const colors = useColors();
  const { playTrack, currentTrack, isPlaying, isLoading } = usePlayer();
  const { isFavorite, toggleFavorite } = useLibrary();

  const isActive = currentTrack?.id === track.id;
  const liked = isFavorite(track.id);

  const handlePress = () => {
    playTrack(track, queue ?? [track]);
  };

  const handleLike = () => {
    toggleFavorite(track);
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: isActive ? colors.secondary : "transparent" },
        pressed && { opacity: 0.7 },
      ]}
      onPress={handlePress}
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
              { color: isActive ? colors.primary : colors.foreground },
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
          onPress={handleLike}
          hitSlop={8}
          style={({ pressed }) => [pressed && { opacity: 0.6 }]}
        >
          <Feather
            name={liked ? "heart" : "heart"}
            size={18}
            color={liked ? colors.primary : colors.mutedForeground}
          />
        </Pressable>
      </View>
    </Pressable>
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
    gap: 12,
  },
  duration: {
    fontSize: 13,
    fontFamily: Platform.OS === "ios" ? "Inter_400Regular" : undefined,
  },
});
