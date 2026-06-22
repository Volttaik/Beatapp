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
import GlassIcon from "@/components/GlassIcon";
import ScreenBackground from "@/components/ScreenBackground";
import { useDownloads } from "@/contexts/DownloadContext";
import { useLibrary } from "@/contexts/LibraryContext";
import { usePlaylists } from "@/contexts/PlaylistContext";
import { usePlayer } from "@/contexts/PlayerContext";
import { formatDuration } from "@/data/tracks";

type Tab = "playlists" | "recent" | "liked" | "downloads";

function EmptyState({ icon, title, subtitle }: { icon: React.ComponentProps<typeof Feather>["name"]; title: string; subtitle: string }) {
  return (
    <View style={styles.emptyState}>
      <GlassIcon name={icon} size={28} containerSize={72} borderRadius={36} />
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
  const { downloads, deleteDownload, getLocalUri } = useDownloads();
  const [activeTab, setActiveTab] = useState<Tab>("playlists");
  const topPad = Platform.OS === "web" ? 60 : insets.top;

  const tabs: { key: Tab; label: string; icon: React.ComponentProps<typeof Feather>["name"] }[] = [
    { key: "playlists", label: "Playlists", icon: "list" },
    { key: "recent", label: "Recent", icon: "clock" },
    { key: "liked", label: "Liked", icon: "heart" },
    { key: "downloads", label: "Downloads", icon: "download" },
  ];

  const handleDeletePlaylist = (id: string, name: string) => {
    Alert.alert("Delete Playlist", `Delete "${name}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deletePlaylist(id) },
    ]);
  };

  const handleDeleteDownload = (id: string, title: string) => {
    Alert.alert("Remove Download", `Remove "${title}" from downloads?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => deleteDownload(id) },
    ]);
  };

  return (
    <ScreenBackground>
      <ScrollView
        contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Your Library</Text>
          {activeTab === "playlists" && (
            <GlassIcon
              name="plus"
              size={20}
              containerSize={40}
              onPress={() => router.push("/playlist/create")}
            />
          )}
        </View>

        {/* Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsRow}
          style={{ marginBottom: 22 }}
        >
          {tabs.map((tab) => (
            <Pressable
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
            >
              <GlassCard
                style={[styles.tab, ...(activeTab === tab.key ? [styles.tabActive] : [])]}
                intensity={activeTab === tab.key ? 80 : 55}
                shine={activeTab === tab.key}
              >
                <Feather
                  name={tab.icon}
                  size={13}
                  color={activeTab === tab.key ? "#fff" : "rgba(255,255,255,0.45)"}
                />
                <Text style={[styles.tabText, activeTab === tab.key && { color: "#fff" }]}>
                  {tab.label}
                </Text>
                {tab.key === "downloads" && downloads.length > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{downloads.length}</Text>
                  </View>
                )}
              </GlassCard>
            </Pressable>
          ))}
        </ScrollView>

        {/* Playlists */}
        {activeTab === "playlists" && (
          <View style={styles.content}>
            {playlists.length === 0 ? (
              <EmptyState icon="list" title="No playlists yet" subtitle="Create your first playlist to organize your music" />
            ) : (
              <GlassCard style={{ borderRadius: 16, paddingHorizontal: 14, paddingBottom: 4 }} intensity={60} shine>
                {playlists.map((p) => (
                  <Pressable
                    key={p.id}
                    style={({ pressed }) => [styles.row, pressed && { opacity: 0.65 }]}
                    onPress={() => router.push(`/playlist/${p.id}` as any)}
                    onLongPress={() => handleDeletePlaylist(p.id, p.name)}
                  >
                    {p.tracks[0]?.artwork ? (
                      <Image source={p.tracks[0].artwork} style={styles.art} contentFit="cover" />
                    ) : (
                      <View style={styles.artPlaceholder}>
                        <Feather name="music" size={18} color="rgba(255,255,255,0.3)" />
                      </View>
                    )}
                    <View style={styles.rowInfo}>
                      <Text style={styles.rowTitle} numberOfLines={1}>{p.name}</Text>
                      <Text style={styles.rowMeta}>{p.tracks.length} {p.tracks.length === 1 ? "song" : "songs"}</Text>
                    </View>
                    <Feather name="chevron-right" size={16} color="rgba(255,255,255,0.2)" />
                  </Pressable>
                ))}
              </GlassCard>
            )}
            <Pressable style={styles.createBtn} onPress={() => router.push("/playlist/create")}>
              <GlassIcon name="plus-circle" size={18} containerSize={36} />
              <Text style={styles.createText}>Create Playlist</Text>
            </Pressable>
          </View>
        )}

        {/* Recent */}
        {activeTab === "recent" && (
          <View style={styles.content}>
            {recentlyPlayed.length === 0 ? (
              <EmptyState icon="clock" title="Nothing played yet" subtitle="Start listening and your history will appear here" />
            ) : (
              <GlassCard style={{ borderRadius: 16, paddingHorizontal: 14, paddingBottom: 4 }} intensity={60} shine>
                {recentlyPlayed.map((t, i) => (
                  <Pressable
                    key={`${t.id}-${i}`}
                    style={({ pressed }) => [styles.row, pressed && { opacity: 0.65 }]}
                    onPress={() => playTrack(t, recentlyPlayed)}
                  >
                    <Image source={t.artwork} style={styles.art} contentFit="cover" />
                    <View style={styles.rowInfo}>
                      <Text style={styles.rowTitle} numberOfLines={1}>{t.title}</Text>
                      <Text style={styles.rowMeta} numberOfLines={1}>{t.artist}</Text>
                    </View>
                    <Text style={styles.duration}>{formatDuration(t.duration)}</Text>
                  </Pressable>
                ))}
              </GlassCard>
            )}
          </View>
        )}

        {/* Liked */}
        {activeTab === "liked" && (
          <View style={styles.content}>
            {favorites.length === 0 ? (
              <EmptyState icon="heart" title="No liked songs" subtitle="Tap the heart on any track to save it here" />
            ) : (
              <GlassCard style={{ borderRadius: 16, paddingHorizontal: 14, paddingBottom: 4 }} intensity={60} shine>
                {favorites.map((t) => (
                  <Pressable
                    key={t.id}
                    style={({ pressed }) => [styles.row, pressed && { opacity: 0.65 }]}
                    onPress={() => playTrack(t, favorites)}
                  >
                    <Image source={t.artwork} style={styles.art} contentFit="cover" />
                    <View style={styles.rowInfo}>
                      <Text style={styles.rowTitle} numberOfLines={1}>{t.title}</Text>
                      <Text style={styles.rowMeta} numberOfLines={1}>{t.artist}</Text>
                    </View>
                    <Text style={styles.duration}>{formatDuration(t.duration)}</Text>
                  </Pressable>
                ))}
              </GlassCard>
            )}
          </View>
        )}

        {/* Downloads */}
        {activeTab === "downloads" && (
          <View style={styles.content}>
            {downloads.length === 0 ? (
              <EmptyState icon="download" title="No downloads yet" subtitle="Tap the download icon on any track to save for offline playback" />
            ) : (
              <>
                <Text style={styles.downloadsNote}>
                  {downloads.length} song{downloads.length !== 1 ? "s" : ""} · available offline
                </Text>
                <GlassCard style={{ borderRadius: 16, paddingHorizontal: 14, paddingBottom: 4 }} intensity={60} shine>
                  {downloads.map((t) => (
                    <Pressable
                      key={t.id}
                      style={({ pressed }) => [styles.row, pressed && { opacity: 0.65 }]}
                      onPress={() => {
                        const localUri = getLocalUri(t.id) ?? undefined;
                        playTrack(t, downloads, localUri);
                      }}
                      onLongPress={() => handleDeleteDownload(t.id, t.title)}
                    >
                      <View>
                        <Image source={t.artwork} style={styles.art} contentFit="cover" />
                        <View style={styles.offlineDot}>
                          <Feather name="download" size={7} color="#fff" />
                        </View>
                      </View>
                      <View style={styles.rowInfo}>
                        <Text style={styles.rowTitle} numberOfLines={1}>{t.title}</Text>
                        <Text style={styles.rowMeta} numberOfLines={1}>{t.artist}</Text>
                      </View>
                      <GlassIcon
                        name="trash-2"
                        size={14}
                        containerSize={30}
                        onPress={() => handleDeleteDownload(t.id, t.title)}
                      />
                    </Pressable>
                  ))}
                </GlassCard>
              </>
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
    marginBottom: 18,
  },
  pageTitle: { fontSize: 30, fontFamily: "Inter_700Bold", color: "#fff" },
  tabsRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16 },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
  },
  tabActive: { borderTopColor: "rgba(255,255,255,0.28)" },
  tabText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "rgba(255,255,255,0.4)" },
  badge: {
    backgroundColor: "rgba(167,139,250,0.3)",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: { fontSize: 10, color: "#fff", fontFamily: "Inter_700Bold" },
  content: { paddingHorizontal: 16 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 11,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  art: { width: 50, height: 50, borderRadius: 10, backgroundColor: "#0a0a18" },
  artPlaceholder: {
    width: 50, height: 50, borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.04)",
    alignItems: "center", justifyContent: "center",
  },
  rowInfo: { flex: 1 },
  rowTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#fff" },
  rowMeta: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.4)", marginTop: 2 },
  duration: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.3)" },
  createBtn: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 18, marginTop: 4 },
  createText: { fontSize: 15, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.6)" },
  downloadsNote: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.35)", marginBottom: 12 },
  offlineDot: {
    position: "absolute", bottom: 2, right: 2,
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: "rgba(124,58,237,0.9)",
    alignItems: "center", justifyContent: "center",
  },
  emptyState: { alignItems: "center", paddingVertical: 60, gap: 16 },
  emptyTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#fff" },
  emptyText: {
    fontSize: 14, fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.4)", textAlign: "center",
    lineHeight: 22, paddingHorizontal: 24,
  },
});
