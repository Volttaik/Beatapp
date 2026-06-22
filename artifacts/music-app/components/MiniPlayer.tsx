import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
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

  const Inner = (
    <Pressable
      style={st.inner}
      onPress={() => router.push("/player")}
      android_ripple={{ color: "rgba(255,255,255,0.08)" }}
    >
      {/* Progress bar at top */}
      <View style={st.progressBar}>
        <View style={st.progressFill} />
      </View>

      <Image source={currentTrack.artwork} style={st.art} contentFit="cover" />
      <View style={st.info}>
        <Text style={st.title} numberOfLines={1}>{currentTrack.title}</Text>
        <Text style={st.artist} numberOfLines={1}>{currentTrack.artist}</Text>
      </View>
      <View style={st.controls}>
        <Pressable
          onPress={(e) => { e.stopPropagation(); toggleFavorite(currentTrack); }}
          hitSlop={10}
        >
          <Feather name="heart" size={20} color={liked ? "#A78BFA" : "rgba(255,255,255,0.45)"} />
        </Pressable>
        <Pressable
          onPress={(e) => { e.stopPropagation(); togglePlayPause(); }}
          hitSlop={10}
        >
          {isLoading
            ? <ActivityIndicator size="small" color="#fff" />
            : <Feather name={isPlaying ? "pause" : "play"} size={26} color="#fff" />}
        </Pressable>
        <Pressable
          onPress={(e) => { e.stopPropagation(); playNext(); }}
          hitSlop={10}
        >
          <Feather name="skip-forward" size={22} color="rgba(255,255,255,0.7)" />
        </Pressable>
      </View>
    </Pressable>
  );

  return (
    <Animated.View entering={FadeInDown.duration(250)} style={st.wrapper}>
      {Platform.OS === "ios" ? (
        <BlurView intensity={70} tint="dark" style={st.blur}>
          <View style={st.blurOverlay}>{Inner}</View>
        </BlurView>
      ) : (
        <View style={[st.blur, st.androidBg]}>{Inner}</View>
      )}
    </Animated.View>
  );
});

export default MiniPlayer;

const st = StyleSheet.create({
  wrapper: {
    marginHorizontal: 8,
    marginBottom: 6,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 12 },
      android: { elevation: 10 },
    }),
  },
  blur: { borderRadius: 16, overflow: "hidden" },
  blurOverlay: { backgroundColor: "rgba(255,255,255,0.05)" },
  androidBg: { backgroundColor: "rgba(18,10,38,0.95)" },
  progressBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  progressFill: {
    height: 2,
    width: "35%",
    backgroundColor: "#7C3AED",
  },
  inner: { flexDirection: "row", alignItems: "center", gap: 10, paddingTop: 2 },
  art: { width: 52, height: 52 },
  info: { flex: 1, gap: 2 },
  title: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  artist: { color: "rgba(255,255,255,0.5)", fontSize: 12, fontFamily: "Inter_400Regular" },
  controls: { flexDirection: "row", alignItems: "center", gap: 14, paddingRight: 14 },
});
