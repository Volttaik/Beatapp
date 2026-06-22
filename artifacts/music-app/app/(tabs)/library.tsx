import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React from "react";
import { FlatList, Platform, StyleSheet, Text, View } from "react-native";

import GlassCard from "@/components/GlassCard";
import ScreenBackground from "@/components/ScreenBackground";
import TrackCard from "@/components/TrackCard";
import { useLibrary } from "@/contexts/LibraryContext";

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const { favorites } = useLibrary();
  const topPad = Platform.OS === "web" ? 60 : insets.top;

  return (
    <ScreenBackground accent="#0A1A4A">
      <FlatList
        data={favorites}
        keyExtractor={(t) => t.id}
        renderItem={({ item, index }) => <TrackCard track={item} queue={favorites} showIndex={index} />}
        ListHeaderComponent={
          <View style={{ paddingTop: topPad + 16, paddingHorizontal: 16, paddingBottom: 12 }}>
            <Text style={st.pageTitle}>Your Library</Text>
            <GlassCard style={st.statsCard} intensity={35}>
              <View style={st.statRow}>
                <Feather name="heart" size={22} color="#A78BFA" />
                <Text style={st.statLabel}>Liked Songs</Text>
                <Text style={st.statCount}>{favorites.length}</Text>
              </View>
            </GlassCard>
          </View>
        }
        ListEmptyComponent={
          <View style={st.emptyState}>
            <GlassCard style={st.emptyIcon} intensity={40}>
              <Feather name="heart" size={32} color="rgba(167,139,250,0.6)" />
            </GlassCard>
            <Text style={st.emptyTitle}>No liked songs yet</Text>
            <Text style={st.emptyText}>Tap the heart icon on any track to save it here</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 140, flexGrow: favorites.length === 0 ? 1 : undefined }}
        showsVerticalScrollIndicator={false}
      />
    </ScreenBackground>
  );
}

const st = StyleSheet.create({
  pageTitle: { fontSize: 30, fontFamily: "Inter_700Bold", color: "#fff", marginBottom: 16 },
  statsCard: { borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14 },
  statRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  statLabel: { flex: 1, fontSize: 16, fontFamily: "Inter_500Medium", color: "#fff" },
  statCount: { fontSize: 16, fontFamily: "Inter_700Bold", color: "rgba(255,255,255,0.6)" },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16, paddingHorizontal: 32, paddingTop: 60 },
  emptyIcon: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#fff" },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.45)", textAlign: "center", lineHeight: 22 },
});
