import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { usePlaylists } from "@/contexts/PlaylistContext";
import { Track } from "@/data/tracks";

interface Props {
  visible: boolean;
  track: Track | null;
  onClose: () => void;
}

export default function AddToPlaylistModal({ visible, track, onClose }: Props) {
  const { playlists, addTrackToPlaylist } = usePlaylists();

  const handleAdd = (playlistId: string) => {
    if (!track) return;
    addTrackToPlaylist(playlistId, track);
    onClose();
  };

  const handleCreateNew = () => {
    onClose();
    router.push("/playlist/create");
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          {Platform.OS === "ios" ? (
            <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
          ) : null}
          <View style={styles.sheetInner}>
            <View style={styles.handle} />

            <Text style={styles.title}>Add to Playlist</Text>

            {track && (
              <View style={styles.trackRow}>
                <Image source={track.artwork} style={styles.artwork} contentFit="cover" />
                <View style={styles.trackInfo}>
                  <Text style={styles.trackTitle} numberOfLines={1}>{track.title}</Text>
                  <Text style={styles.trackArtist} numberOfLines={1}>{track.artist}</Text>
                </View>
              </View>
            )}

            <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
              {/* Create New Playlist */}
              <Pressable
                style={({ pressed }) => [styles.playlistRow, pressed && { opacity: 0.65 }]}
                onPress={handleCreateNew}
              >
                <View style={styles.newIcon}>
                  <Feather name="plus" size={20} color="#A78BFA" />
                </View>
                <Text style={styles.playlistName}>Create New Playlist</Text>
              </Pressable>

              {playlists.map((p) => {
                const alreadyAdded = track ? p.tracks.some((t) => t.id === track.id) : false;
                return (
                  <Pressable
                    key={p.id}
                    style={({ pressed }) => [
                      styles.playlistRow,
                      pressed && { opacity: 0.65 },
                      alreadyAdded && { opacity: 0.5 },
                    ]}
                    onPress={() => !alreadyAdded && handleAdd(p.id)}
                    disabled={alreadyAdded}
                  >
                    {p.tracks[0]?.artwork ? (
                      <Image source={p.tracks[0].artwork} style={styles.playlistArt} contentFit="cover" />
                    ) : (
                      <View style={styles.playlistArtPlaceholder}>
                        <Feather name="music" size={16} color="rgba(167,139,250,0.5)" />
                      </View>
                    )}
                    <View style={styles.playlistInfo}>
                      <Text style={styles.playlistName}>{p.name}</Text>
                      <Text style={styles.playlistMeta}>
                        {p.tracks.length} {p.tracks.length === 1 ? "song" : "songs"}
                      </Text>
                    </View>
                    {alreadyAdded && (
                      <Feather name="check" size={18} color="#A78BFA" />
                    )}
                  </Pressable>
                );
              })}

              {playlists.length === 0 && (
                <Text style={styles.noPlaylists}>No playlists yet. Create one!</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
    backgroundColor: Platform.OS === "android" ? "#1A1A2E" : "transparent",
    maxHeight: "75%",
  },
  sheetInner: {
    padding: 20,
    backgroundColor: Platform.OS === "ios" ? "rgba(20,10,40,0.7)" : "transparent",
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignSelf: "center",
    marginBottom: 20,
  },
  title: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#fff", marginBottom: 16 },
  trackRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 },
  artwork: { width: 44, height: 44, borderRadius: 8, backgroundColor: "#1C1C2A" },
  trackInfo: { flex: 1 },
  trackTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#fff" },
  trackArtist: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.5)" },
  list: { maxHeight: 360 },
  playlistRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.07)",
  },
  newIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "rgba(124,58,237,0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(124,58,237,0.4)",
    borderStyle: "dashed",
  },
  playlistArt: { width: 48, height: 48, borderRadius: 8, backgroundColor: "#1C1C2A" },
  playlistArtPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#1C1C2A",
    alignItems: "center",
    justifyContent: "center",
  },
  playlistInfo: { flex: 1 },
  playlistName: { fontSize: 15, fontFamily: "Inter_500Medium", color: "#fff" },
  playlistMeta: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.4)" },
  noPlaylists: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.4)",
    textAlign: "center",
    paddingVertical: 20,
  },
});
