import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
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

import GlassIcon from "@/components/GlassIcon";
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
      android_ripple={{ color: "rgba(255,255,255,0.05)" }}
    >
      <LinearGradient
        colors={["rgba(255,255,255,0.10)", "rgba(255,255,255,0.01)", "transparent"]}
        locations={[0, 0.25, 1]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.4, y: 1 }}
        pointerEvents="none"
      />

      <View style={st.progressBar}>
        <View style={st.progressFill} />
      </View>

      <Image source={currentTrack.artwork} style={st.art} contentFit="cover" />

      <View style={st.info}>
        <Text style={st.title} numberOfLines={1}>{currentTrack.title}</Text>
        <Text style={st.artist} numberOfLines={1}>{currentTrack.artist}</Text>
      </View>

      <View style={st.controls}>
        <GlassIcon
          name="heart"
          size={18}
          containerSize={36}
          color={liked ? "#A78BFA" : "rgba(255,255,255,0.55)"}
          active={liked}
          onPress={(e?: any) => { if (e?.stopPropagation) e.stopPropagation(); toggleFavorite(currentTrack); }}
        />
        <Pressable
          onPress={(e) => { e.stopPropagation(); togglePlayPause(); }}
          style={({ pressed }) => [st.playBtn, pressed && { opacity: 0.7 }]}
        >
          <LinearGradient
            colors={["rgba(255,255,255,0.18)", "rgba(255,255,255,0.04)"]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
          {isLoading
            ? <ActivityIndicator size="small" color="#fff" />
            : <View style={{ marginLeft: isPlaying ? 0 : 2 }}>
                {isPlaying
                  ? <View style={st.pauseIcon}><View style={st.pauseBar} /><View style={st.pauseBar} /></View>
                  : <View style={st.playArrow} />}
              </View>}
        </Pressable>
        <GlassIcon
          name="skip-forward"
          size={18}
          containerSize={36}
          onPress={(e?: any) => { if (e?.stopPropagation) e.stopPropagation(); playNext(); }}
        />
      </View>
    </Pressable>
  );

  return (
    <Animated.View entering={FadeInDown.duration(280)} style={st.wrapper}>
      {Platform.OS === "ios" ? (
        <BlurView intensity={80} tint="dark" style={st.blur}>
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
    marginHorizontal: 10,
    marginBottom: 8,
    borderRadius: 18,
    overflow: "hidden",
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: "rgba(255,255,255,0.20)",
    borderLeftColor: "rgba(255,255,255,0.10)",
    borderRightColor: "rgba(255,255,255,0.05)",
    borderBottomColor: "rgba(255,255,255,0.03)",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.6, shadowRadius: 16 },
      android: { elevation: 14 },
    }),
  },
  blur: { borderRadius: 18, overflow: "hidden" },
  blurOverlay: { backgroundColor: "rgba(8,8,16,0.50)" },
  androidBg: { backgroundColor: "rgba(10,10,18,0.94)" },
  progressBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  progressFill: {
    height: 2,
    width: "35%",
    backgroundColor: "rgba(167,139,250,0.7)",
  },
  inner: { flexDirection: "row", alignItems: "center", gap: 10, paddingTop: 2, paddingVertical: 10, paddingHorizontal: 12 },
  art: { width: 48, height: 48, borderRadius: 10, backgroundColor: "#0a0a18" },
  info: { flex: 1, gap: 2 },
  title: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  artist: { color: "rgba(255,255,255,0.45)", fontSize: 12, fontFamily: "Inter_400Regular" },
  controls: { flexDirection: "row", alignItems: "center", gap: 8 },
  playBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: "rgba(255,255,255,0.22)",
    borderLeftColor: "rgba(255,255,255,0.12)",
    borderRightColor: "rgba(255,255,255,0.05)",
    borderBottomColor: "rgba(255,255,255,0.04)",
    backgroundColor: "rgba(15,15,25,0.5)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  pauseIcon: { flexDirection: "row", gap: 4, alignItems: "center" },
  pauseBar: { width: 3, height: 14, backgroundColor: "#fff", borderRadius: 2 },
  playArrow: {
    width: 0,
    height: 0,
    borderStyle: "solid",
    borderTopWidth: 7,
    borderBottomWidth: 7,
    borderLeftWidth: 12,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    borderLeftColor: "#fff",
  },
});
