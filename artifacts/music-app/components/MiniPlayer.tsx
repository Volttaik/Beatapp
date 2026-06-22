import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
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

import { useLibrary } from "@/contexts/LibraryContext";
import { usePlayer } from "@/contexts/PlayerContext";

const MiniPlayer = memo(function MiniPlayer() {
  const { currentTrack, isPlaying, togglePlayPause, isLoading, playNext } = usePlayer();
  const { isFavorite, toggleFavorite } = useLibrary();

  if (!currentTrack) return null;
  const liked = isFavorite(currentTrack.id);

  return (
    <Animated.View entering={FadeInDown.duration(260)} style={st.wrapper}>
      <View style={st.progressBar}>
        <View style={st.progressFill} />
      </View>

      <Pressable
        style={st.inner}
        onPress={() => router.push("/player")}
        android_ripple={{ color: "rgba(255,255,255,0.06)" }}
      >
        <Image source={currentTrack.artwork} style={st.art} contentFit="cover" />

        <View style={st.info}>
          <Text style={st.title} numberOfLines={1}>{currentTrack.title}</Text>
          <Text style={st.artist} numberOfLines={1}>{currentTrack.artist}</Text>
        </View>

        <View style={st.controls}>
          <Pressable
            onPress={(e) => { e.stopPropagation(); toggleFavorite(currentTrack); }}
            hitSlop={8}
            style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
          >
            <Feather
              name="heart"
              size={20}
              color={liked ? "#A78BFA" : "#B3B3B3"}
            />
          </Pressable>

          <Pressable
            onPress={(e) => { e.stopPropagation(); togglePlayPause(); }}
            style={({ pressed }) => [st.playBtn, pressed && { opacity: 0.7 }]}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : isPlaying ? (
              <View style={st.pauseIcon}>
                <View style={st.pauseBar} />
                <View style={st.pauseBar} />
              </View>
            ) : (
              <View style={st.playArrow} />
            )}
          </Pressable>

          <Pressable
            onPress={(e) => { e.stopPropagation(); playNext(); }}
            hitSlop={8}
            style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
          >
            <Feather name="skip-forward" size={20} color="#B3B3B3" />
          </Pressable>
        </View>
      </Pressable>
    </Animated.View>
  );
});

export default MiniPlayer;

const st = StyleSheet.create({
  wrapper: {
    backgroundColor: "#282828",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#3E3E3E",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
      },
      android: { elevation: 12 },
    }),
  },
  progressBar: {
    height: 2,
    backgroundColor: "#3E3E3E",
  },
  progressFill: {
    height: 2,
    width: "35%",
    backgroundColor: "#A78BFA",
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 12,
  },
  art: {
    width: 44,
    height: 44,
    borderRadius: 4,
    backgroundColor: "#3E3E3E",
  },
  info: { flex: 1 },
  title: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  artist: {
    color: "#B3B3B3",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
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
  pauseBar: { width: 3, height: 13, backgroundColor: "#121212", borderRadius: 2 },
  playArrow: {
    width: 0,
    height: 0,
    borderStyle: "solid",
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderLeftWidth: 11,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    borderLeftColor: "#121212",
    marginLeft: 2,
  },
});
