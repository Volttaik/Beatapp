import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import GlassCard from "@/components/GlassCard";
import { usePlayer } from "@/contexts/PlayerContext";
import { usePlaylists } from "@/contexts/PlaylistContext";
import { formatDuration } from "@/data/tracks";

export default function PlaylistDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { getPlaylist, deletePlaylist, removeTrackFromPlaylist } = usePlaylists();
  const { playTrack, currentTrack, isPlaying } = usePlayer();
  const [menuVisible, setMenuVisible] = useState(false);

  const playlist = getPlaylist(id);

  if (!playlist) {
    return (
      <View style={[styles.container, { alignItems: "center", justifyContent: "center" }]}>
        <Text style={{ color: "#fff" }}>Playlist not found</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: "#A78BFA" }}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const coverArt = playlist.tracks[0]?.artwork;
  const totalDuration = playlist.tracks.reduce((acc, t) => acc + t.duration, 0);
  const totalMins = Math.round(totalDuration / 60);

  const handlePlayAll = () => {
    if (playlist.tracks.length === 0) return;
    playTrack(playlist.tracks[0], playlist.tracks);
  };

  const handleDeletePlaylist = () => {
    Alert.alert("Delete Playlist", `Delete "${playlist.name}"? This cannot be undone.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deletePlaylist(id);
          router.back();
        },
      },
    ]);
  };

  const handleRemoveTrack = (trackId: string) => {
    Alert.alert("Remove Track", "Remove this song from the playlist?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => removeTrackFromPlaylist(id, trackId),
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#1C0A3A", "#08080F", "#08080F"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.45 }}
      />

      <FlatList
        data={playlist.tracks}
        keyExtractor={(t) => t.id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {/* Top bar */}
            <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
              <Pressable onPress={() => router.back()} hitSlop={12}>
                <Feather name="arrow-left" size={24} color="#fff" />
              </Pressable>
              <Pressable onPress={() => setMenuVisible((v) => !v)} hitSlop={12}>
                <Feather name="more-horizontal" size={24} color="#fff" />
              </Pressable>
            </View>

            {/* Inline menu */}
            {menuVisible && (
              <GlassCard style={styles.menu} intensity={60}>
                <Pressable
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuVisible(false);
                    handleDeletePlaylist();
                  }}
                >
                  <Feather name="trash-2" size={16} color="#EF4444" />
                  <Text style={[styles.menuItemText, { color: "#EF4444" }]}>Delete Playlist</Text>
                </Pressable>
              </GlassCard>
            )}

            {/* Cover art */}
            <View style={styles.coverContainer}>
              {coverArt ? (
                <Image source={coverArt} style={styles.coverArt} contentFit="cover" />
              ) : (
                <View style={styles.coverPlaceholder}>
                  <Feather name="music" size={56} color="rgba(167,139,250,0.4)" />
                </View>
              )}
            </View>

            {/* Info */}
            <View style={styles.info}>
              <Text style={styles.playlistName}>{playlist.name}</Text>
              {playlist.description ? (
                <Text style={styles.description}>{playlist.description}</Text>
              ) : null}
              <Text style={styles.meta}>
                {playlist.tracks.length} {playlist.tracks.length === 1 ? "song" : "songs"}
                {totalMins > 0 ? ` · ${totalMins} min` : ""}
              </Text>
            </View>

            {/* Controls */}
            <View style={styles.controls}>
              <Pressable
                style={[styles.playAllBtn, playlist.tracks.length === 0 && { opacity: 0.4 }]}
                onPress={handlePlayAll}
                disabled={playlist.tracks.length === 0}
              >
                <Feather name="play" size={20} color="#fff" />
                <Text style={styles.playAllText}>Play All</Text>
              </Pressable>
            </View>

            {playlist.tracks.length === 0 && (
              <View style={styles.emptyState}>
                <Feather name="plus-circle" size={48} color="rgba(167,139,250,0.3)" />
                <Text style={styles.emptyTitle}>No songs yet</Text>
                <Text style={styles.emptyText}>
                  Add songs by tapping ··· on any track
                </Text>
              </View>
            )}

            {playlist.tracks.length > 0 && (
              <Text style={styles.tracksLabel}>SONGS</Text>
            )}
          </>
        }
        renderItem={({ item }) => {
          const isActive = currentTrack?.id === item.id;
          return (
            <Pressable
              style={({ pressed }) => [styles.trackRow, pressed && { opacity: 0.65 }]}
              onPress={() => playTrack(item, playlist.tracks)}
            >
              <Image source={item.artwork} style={styles.artwork} contentFit="cover" />
              <View style={styles.trackInfo}>
                <Text
                  style={[styles.trackTitle, isActive && { color: "#A78BFA" }]}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                <Text style={styles.trackArtist} numberOfLines={1}>
                  {item.artist}
                </Text>
              </View>
              <Text style={styles.trackDuration}>{formatDuration(item.duration)}</Text>
              <Pressable onPress={() => handleRemoveTrack(item.id)} hitSlop={8}>
                <Feather name="x" size={18} color="rgba(255,255,255,0.35)" />
              </Pressable>
            </Pressable>
          );
        }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#08080F" },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  menu: {
    position: "absolute",
    right: 20,
    top: 60,
    zIndex: 100,
    borderRadius: 14,
    minWidth: 180,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
  },
  menuItemText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  coverContainer: { alignItems: "center", paddingHorizontal: 40, marginBottom: 24 },
  coverArt: {
    width: 220,
    height: 220,
    borderRadius: 16,
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
  },
  coverPlaceholder: {
    width: 220,
    height: 220,
    borderRadius: 16,
    backgroundColor: "#1C1C2A",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  info: { paddingHorizontal: 20, marginBottom: 20, gap: 6 },
  playlistName: { fontSize: 26, fontFamily: "Inter_700Bold", color: "#fff" },
  description: { fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.55)", lineHeight: 20 },
  meta: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.4)" },
  controls: { paddingHorizontal: 20, marginBottom: 24 },
  playAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#7C3AED",
    borderRadius: 30,
    paddingVertical: 14,
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  playAllText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
  tracksLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: "rgba(255,255,255,0.4)",
    letterSpacing: 1.2,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  emptyState: { alignItems: "center", paddingVertical: 60, gap: 12 },
  emptyTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#fff" },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.45)",
    textAlign: "center",
    paddingHorizontal: 40,
    lineHeight: 22,
  },
  trackRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 12,
  },
  artwork: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: "#1C1C2A",
  },
  trackInfo: { flex: 1 },
  trackTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#fff", marginBottom: 3 },
  trackArtist: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.5)" },
  trackDuration: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.4)" },
});
