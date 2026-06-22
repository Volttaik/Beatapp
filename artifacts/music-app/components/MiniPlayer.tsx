import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { memo } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { usePlayer } from "@/contexts/PlayerContext";
import { useColors } from "@/hooks/useColors";

const MiniPlayer = memo(function MiniPlayer() {
  const colors = useColors();
  const { currentTrack, isPlaying, togglePlayPause, playNext, isLoading } = usePlayer();

  if (!currentTrack) return null;

  const progress = 0;

  return (
    <Animated.View entering={FadeInDown.duration(300)} style={styles.wrapper}>
      <Pressable
        style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => router.push("/player")}
      >
        <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.progressFill,
              { backgroundColor: colors.primary, width: `${progress}%` as any },
            ]}
          />
        </View>

        <View style={styles.content}>
          <Image
            source={currentTrack.artwork}
            style={styles.artwork}
            contentFit="cover"
          />
          <View style={styles.info}>
            <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={1}>
              {currentTrack.title}
            </Text>
            <Text style={[styles.artist, { color: colors.mutedForeground }]} numberOfLines={1}>
              {currentTrack.artist}
            </Text>
          </View>
          <View style={styles.controls}>
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                togglePlayPause();
              }}
              hitSlop={8}
              style={({ pressed }) => [pressed && { opacity: 0.6 }]}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Feather
                  name={isPlaying ? "pause" : "play"}
                  size={24}
                  color={colors.foreground}
                />
              )}
            </Pressable>
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                playNext();
              }}
              hitSlop={8}
              style={({ pressed }) => [pressed && { opacity: 0.6 }]}
            >
              <Feather name="skip-forward" size={22} color={colors.foreground} />
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
});

export default MiniPlayer;

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  container: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  progressBar: {
    height: 2,
  },
  progressFill: {
    height: 2,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    gap: 12,
  },
  artwork: {
    width: 46,
    height: 46,
    borderRadius: 8,
    backgroundColor: "#1C1C2A",
  },
  info: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "Inter_600SemiBold" : undefined,
  },
  artist: {
    fontSize: 12,
    fontFamily: Platform.OS === "ios" ? "Inter_400Regular" : undefined,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
});
