import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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

  const totalDuration = favorites.reduce((acc, t) => acc + t.duration, 0);
  const totalMins = Math.round(totalDuration / 60);

  const handlePlayAll = () => {
    if (sorted.length === 0) return;
    playTrack(sorted[0], sorted);
  };

  return (
    <ScreenBackground accent="#2D0A4A">
      <FlatList
        data={sorted}
        keyExtractor={(t) => t.id}
        renderItem={({ item, index }) => (
          <TrackCard track={item} queue={sorted} showIndex={index} />
        )}
        ListHeaderComponent={
          <View style={{ paddingTop: topPad + 16, paddingHorizontal: 16, paddingBottom: 12 }}>
            {/* Header */}
            <Text style={st.pageTitle}>Favorites</Text>

            {/* Stats card */}
            <GlassCard style={st.heroCard} intensity={40}>
              <LinearGradient
                colors={["rgba(124,58,237,0.3)", "rgba(124,58,237,0.05)"]}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <View style={st.heroIcon}>
                <Feather name="heart" size={28} color="#A78BFA" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={st.heroTitle}>Liked Songs</Text>
                <Text style={st.heroMeta}>
                  {favorites.length} {favorites.length === 1 ? "song" : "songs"}
                  {totalMins > 0 ? ` · ${totalMins} min` : ""}
                </Text>
              </View>
              {favorites.length > 0 && (
                <Pressable style={st.playBtn} onPress={handlePlayAll}>
                  <Feather name="play" size={18} color="#fff" />
                </Pressable>
              )}
            </GlassCard>

            {/* Sort controls */}
            {favorites.length > 0 && (
              <View style={st.sortRow}>
                <Text style={st.sortLabel}>Sort by:</Text>
                {(["added", "title", "artist"] as SortMode[]).map((mode) => (
                  <Pressable
                    key={mode}
                    onPress={() => setSortMode(mode)}
                    style={[st.sortChip, sortMode === mode && st.sortChipActive]}
                  >
                    <Text style={[st.sortChipText, sortMode === mode && { color: "#fff" }]}>
                      {mode === "added" ? "Date Added" : mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={st.emptyState}>
            <GlassCard style={st.emptyIcon} intensity={40}>
              <Feather name="heart" size={32} color="rgba(167,139,250,0.6)" />
            </GlassCard>
            <Text style={st.emptyTitle}>No favorites yet</Text>
            <Text style={st.emptyText}>
              Tap the heart on any track to save it here
            </Text>
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
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 16,
    overflow: "hidden",
  },
  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: "rgba(124,58,237,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: { fontSize: 17, fontFamily: "Inter_700Bold", color: "#fff" },
  heroMeta: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.5)", marginTop: 3 },
  playBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#7C3AED",
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 2,
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  sortRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  sortLabel: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.4)" },
  sortChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  sortChipActive: { backgroundColor: "#7C3AED" },
  sortChipText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.55)",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#fff" },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.45)",
    textAlign: "center",
    lineHeight: 22,
  },
});
