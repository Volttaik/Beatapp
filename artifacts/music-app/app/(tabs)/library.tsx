import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";

import TrackCard from "@/components/TrackCard";
import { useLibrary } from "@/contexts/LibraryContext";
import { usePlayer } from "@/contexts/PlayerContext";
import { useColors } from "@/hooks/useColors";

export default function LibraryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { favorites } = useLibrary();
  const { recentlyPlayed } = usePlayer();

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPadding + 16 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Library</Text>
      </View>

      <FlatList
        data={favorites}
        keyExtractor={(t) => t.id}
        renderItem={({ item, index }) => (
          <TrackCard track={item} queue={favorites} showIndex={index} />
        )}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <View style={styles.sectionHeader}>
              <Feather name="heart" size={18} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                Liked Songs
              </Text>
              <Text style={[styles.count, { color: colors.mutedForeground }]}>
                {favorites.length}
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.secondary }]}>
              <Feather name="heart" size={32} color={colors.mutedForeground} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              No liked songs yet
            </Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Tap the heart icon on any track to save it here
            </Text>
          </View>
        }
        contentContainerStyle={[
          styles.list,
          { paddingBottom: Platform.OS === "web" ? 34 : 16 },
        ]}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "Inter_700Bold" : undefined,
  },
  list: {
    paddingHorizontal: 16,
  },
  listHeader: {
    gap: 8,
    paddingBottom: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "Inter_700Bold" : undefined,
    flex: 1,
  },
  count: {
    fontSize: 15,
    fontFamily: Platform.OS === "ios" ? "Inter_400Regular" : undefined,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 16,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "Inter_700Bold" : undefined,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
    fontFamily: Platform.OS === "ios" ? "Inter_400Regular" : undefined,
  },
});
