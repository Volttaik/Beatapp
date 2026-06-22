import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import GlassCard from "@/components/GlassCard";
import ScreenBackground from "@/components/ScreenBackground";
import { useLibrary } from "@/contexts/LibraryContext";
import { usePlaylists } from "@/contexts/PlaylistContext";
import { usePlayer } from "@/contexts/PlayerContext";
import { formatDuration } from "@/data/tracks";

type Tab = "playlists" | "recent" | "liked";

function EmptyState({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) {
  return (
    <View style={styles.emptyState}>
      <GlassCard style={styles.emptyIcon} intensity={40}>
        <Feather name={icon as any} size={28} color="rgba(167,139,250,0.6)" />
      </GlassCard>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyText}>{subtitle}</Text>
    </View>
  );
}

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const { favorites } = useLibrary();
  const { playlists, deletePlaylist } = usePlaylists();
  const { recentlyPlayed, playTrack } = usePlayer();
  const [activeTab, setActiveTab] = useState<Tab>("playlists");
  const topPad = Platform.OS === "web" ? 60 : insets.top;

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "playlists", label: "Playlists", icon: "list" },
    { key: "recent", label: "Recent", icon: "clock" },
    { key: "liked", label: "Liked", icon: "heart" },
  ];

  const handleDeletePlaylist = (id: string, name: string) => {
    Alert.alert("Delete Playlist", `Delete "${name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deletePlaylist(id),
      },
    ]);
  };

  return (
    <ScreenBackground accent="#0A1A4A">
      <ScrollView
        contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Your Library</Text>
          {activeTab === "playlists" && (
            <Pressable
              onPress={() => router.push("/playlist/create")}
              style={styles.addBtn}
              hitSlop={8}
            >
              <Feather name="plus" size={22} color="#A78BFA" />
            </Pressable>
          )}
        </View>

        {/* Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsRow}
          style={{ marginBottom: 20 }}
        >
          {tabs.map((tab) => (
            <Pressable
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            >
              <Feather
                name={tab.icon as any}
                size={14}
                color={activeTab === tab.key ? "#fff" : "rgba(255,255,255,0.5)"}
              />
              <Text style={[styles.tabText, activeTab === tab.key && { color: "#fff" }]}>
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Playlists Tab */}
        {activeTab === "playlists" && (
          <View style={styles.content}>
            {playlists.length === 0 ? (
              <EmptyState
                icon="list"
                title="No playlists yet"
                subtitle="Create your first playlist to organize your music"
              />
            ) : (
              playlists.map((p) => (
                <Pressable
                  key={p.id}
                  style={({ pressed }) => [styles.playlistRow, pressed && { opacity: 0.65 }]}
                  onPress={() => router.push(`/playlist/${p.id}` as any)}
                  onLongPress={() => handleDeletePlaylist(p.id, p.name)}
                >
                  {p.tracks[0]?.artwork ? (
                    <Image source={p.tracks[0].artwork} style={styles.playlistArt} contentFit="cover" />
                  ) : (
                    <View style={styles.playlistArtPlaceholder}>
                      <Feather name="music" size={20} color="rgba(167,139,250,0.5)" />
                    </View>
                  )}
                  <View style={styles.playlistInfo}>
                    <Text style={styles.playlistName} numberOfLines={1}>{p.name}</Text>
                    <Text style={styles.playlistMeta}>
                      {p.tracks.length} {p.tracks.length === 1 ? "song" : "songs"}
                    </Text>
                  </View>
                  <Feather name="chevron-right" size={18} color="rgba(255,255,255,0.25)" />
                </Pressable>
              ))
            )}

            <Pressable
              style={styles.createPlaylistBtn}
              onPress={() => router.push("/playlist/create")}
            >
              <Feather name="plus-circle" size={18} color="#A78BFA" />
              <Text style={styles.createPlaylistText}>Create Playlist</Text>
            </Pressable>
          </View>
        )}

        {/* Recent Tab */}
        {activeTab === "recent" && (
          <View style={styles.content}>
            {recentlyPlayed.length === 0 ? (
              <EmptyState
                icon="clock"
                title="Nothing played yet"
                subtitle="Start listening and your history will appear here"
              />
            ) : (
              recentlyPlayed.map((t, i) => (
                <Pressable
                  key={`${t.id}-${i}`}
                  style={({ pressed }) => [styles.trackRow, pressed && { opacity: 0.65 }]}
                  onPress={() => playTrack(t, recentlyPlayed)}
                >
                  <Image source={t.artwork} style={styles.trackArt} contentFit="cover" />
                  <View style={styles.trackInfo}>
                    <Text style={styles.trackTitle} numberOfLines={1}>{t.title}</Text>
                    <Text style={styles.trackMeta} numberOfLines={1}>{t.artist}</Text>
                  </View>
                  <Text style={styles.trackDuration}>{formatDuration(t.duration)}</Text>
                </Pressable>
              ))
            )}
          </View>
        )}

        {/* Liked Tab */}
        {activeTab === "liked" && (
          <View style={styles.content}>
            {favorites.length === 0 ? (
              <EmptyState
                icon="heart"
                title="No liked songs"
                subtitle="Tap the heart on any track to save it here"
              />
            ) : (
              favorites.map((t, i) => (
                <Pressable
                  key={t.id}
                  style={({ pressed }) => [styles.trackRow, pressed && { opacity: 0.65 }]}
                  onPress={() => playTrack(t, favorites)}
                >
                  <Image source={t.artwork} style={styles.trackArt} contentFit="cover" />
                  <View style={styles.trackInfo}>
                    <Text style={styles.trackTitle} numberOfLines={1}>{t.title}</Text>
                    <Text style={styles.trackMeta} numberOfLines={1}>{t.artist}</Text>
                  </View>
                  <Text style={styles.trackDuration}>{formatDuration(t.duration)}</Text>
                </Pressable>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  pageTitle: { fontSize: 30, fontFamily: "Inter_700Bold", color: "#fff" },
  addBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(124,58,237,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  tabsRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16 },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  tabActive: { backgroundColor: "#7C3AED" },
  tabText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: "rgba(255,255,255,0.5)",
  },
  content: { paddingHorizontal: 16 },
  playlistRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.07)",
  },
  playlistArt: { width: 54, height: 54, borderRadius: 8, backgroundColor: "#1C1C2A" },
  playlistArtPlaceholder: {
    width: 54,
    height: 54,
    borderRadius: 8,
    backgroundColor: "#1C1C2A",
    alignItems: "center",
    justifyContent: "center",
  },
  playlistInfo: { flex: 1 },
  playlistName: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#fff" },
  playlistMeta: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.45)", marginTop: 2 },
  createPlaylistBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 16,
    marginTop: 8,
  },
  createPlaylistText: { fontSize: 15, fontFamily: "Inter_500Medium", color: "#A78BFA" },
  trackRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.07)",
  },
  trackArt: { width: 50, height: 50, borderRadius: 8, backgroundColor: "#1C1C2A" },
  trackInfo: { flex: 1 },
  trackTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#fff" },
  trackMeta: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.45)", marginTop: 2 },
  trackDuration: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.35)" },
  emptyState: { alignItems: "center", paddingVertical: 60, gap: 16 },
  emptyIcon: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#fff" },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.45)",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 24,
  },
});
