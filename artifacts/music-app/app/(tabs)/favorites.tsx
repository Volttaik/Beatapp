import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import GlassCard from "@/components/GlassCard";
import GlassIcon from "@/components/GlassIcon";
import ScreenBackground from "@/components/ScreenBackground";
import TrackCard from "@/components/TrackCard";
import { useLibrary } from "@/contexts/LibraryContext";
import { usePlayer } from "@/contexts/PlayerContext";

type SortMode = "added" | "title" | "artist";

export default function FavoritesScreen() {
  const insets = useSafeAreaInsets();
  const { favorites } = useLibrary();
  const { playTrack } = usePlayer();
  const [sortMode, setSortMode] = useState<SortMode>("added");
  const topPad = Platform.OS === "web" ? 60 : insets.top;

  const sorted = [...favorites].sort((a, b) => {
    if (sortMode === "title") return a.title.localeCompare(b.title);
    if (sortMode === "artist") return a.artist.localeCompare(b.artist);
    return 0;
  });

  const totalMins = Math.round(favorites.reduce((acc, t) => acc + t.duration, 0) / 60);

  return (
    <ScreenBackground>
      <FlatList
        data={sorted}
        keyExtractor={(t) => t.id}
        renderItem={({ item, index }) => <TrackCard track={item} queue={sorted} showIndex={index} />}
        ListHeaderComponent={
          <View style={{ paddingTop: topPad + 16, paddingHorizontal: 16, paddingBottom: 12 }}>
            <Text style={st.pageTitle}>Liked Songs</Text>

            {/* Hero card */}
            <GlassCard style={st.heroCard} intensity={70} shine>
              <GlassIcon name="heart" size={26} containerSize={54} borderRadius={14} active />
              <View style={{ flex: 1 }}>
                <Text style={st.heroTitle}>Liked Songs</Text>
                <Text style={st.heroMeta}>
                  {favorites.length} {favorites.length === 1 ? "song" : "songs"}
                  {totalMins > 0 ? ` · ${totalMins} min` : ""}
                </Text>
              </View>
              {favorites.length > 0 && (
                <Pressable
                  style={({ pressed }) => [st.playBtn, pressed && { opacity: 0.7 }]}
                  onPress={() => playTrack(sorted[0], sorted)}
                >
                  <Feather name="play" size={20} color="#fff" style={{ marginLeft: 2 }} />
                </Pressable>
              )}
            </GlassCard>

            {/* Sort chips */}
            {favorites.length > 0 && (
              <View style={st.sortRow}>
                <Text style={st.sortLabel}>Sort:</Text>
                {(["added", "title", "artist"] as SortMode[]).map((mode) => (
                  <Pressable key={mode} onPress={() => setSortMode(mode)}>
                    <GlassCard
                      style={st.sortChip}
                      intensity={mode === sortMode ? 75 : 50}
                      shine={mode === sortMode}
                    >
                      <Text style={[st.sortText, mode === sortMode && { color: "#fff" }]}>
                        {mode === "added" ? "Date Added" : mode.charAt(0).toUpperCase() + mode.slice(1)}
                      </Text>
                    </GlassCard>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={st.emptyState}>
            <GlassIcon name="heart" size={30} containerSize={80} borderRadius={40} />
            <Text style={st.emptyTitle}>No favorites yet</Text>
            <Text style={st.emptyText}>Tap the heart on any track to save it here</Text>
          </View>
        }
        contentContainerStyle={{
          paddingBottom: 140,
          flexGrow: favorites.length === 0 ? 1 : undefined,
        }}
        showsVerticalScrollIndicator={false}
      />
    </ScreenBackground>
  );
}

const st = StyleSheet.create({
  pageTitle: { fontSize: 30, fontFamily: "Inter_700Bold", color: "#fff", marginBottom: 16 },
  heroCard: {
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 16,
    overflow: "hidden",
  },
  heroTitle: { fontSize: 17, fontFamily: "Inter_700Bold", color: "#fff" },
  heroMeta: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.45)", marginTop: 3 },
  playBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: "rgba(255,255,255,0.22)",
    borderLeftColor: "rgba(255,255,255,0.12)",
    borderRightColor: "rgba(255,255,255,0.05)",
    borderBottomColor: "rgba(255,255,255,0.04)",
    backgroundColor: "rgba(124,58,237,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  sortRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  sortLabel: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.35)" },
  sortChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
  },
  sortText: { fontSize: 12, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.4)" },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16, paddingHorizontal: 32, paddingTop: 60 },
  emptyTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#fff" },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.4)", textAlign: "center", lineHeight: 22 },
});
