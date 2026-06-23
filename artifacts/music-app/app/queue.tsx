import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { usePlayer } from "@/contexts/PlayerContext";
import { formatDuration } from "@/data/tracks";

export default function QueueScreen() {
  const insets = useSafeAreaInsets();
  const { queue, currentTrack, playTrack, addToQueue, clearQueue } = usePlayer();

  const upcoming = queue.filter((t) => t.id !== currentTrack?.id);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#000","#000"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.5 }}
      />

      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Feather name="chevron-down" size={28} color="#fff" />
        </Pressable>
        <Text style={styles.title}>Queue</Text>
        {upcoming.length > 0 ? (
          <Pressable onPress={clearQueue} hitSlop={8}>
            <Text style={styles.clearText}>Clear</Text>
          </Pressable>
        ) : (
          <View style={{ width: 44 }} />
        )}
      </View>

      {currentTrack && (
        <View style={styles.nowPlayingSection}>
          <Text style={styles.sectionLabel}>NOW PLAYING</Text>
          <View style={styles.nowPlayingRow}>
            <View style={styles.playingDot} />
            <Image source={currentTrack.artwork} style={styles.artwork} contentFit="cover" />
            <View style={styles.trackInfo}>
              <Text style={styles.trackTitle} numberOfLines={1}>{currentTrack.title}</Text>
              <Text style={styles.trackArtist} numberOfLines={1}>{currentTrack.artist}</Text>
            </View>
            <Text style={styles.duration}>{formatDuration(currentTrack.duration)}</Text>
          </View>
        </View>
      )}

      {upcoming.length > 0 ? (
        <>
          <Text style={[styles.sectionLabel, { paddingHorizontal: 20, marginTop: 24, marginBottom: 8 }]}>
            NEXT UP · {upcoming.length} {upcoming.length === 1 ? "SONG" : "SONGS"}
          </Text>
          <FlatList
            data={upcoming}
            keyExtractor={(t) => t.id}
            renderItem={({ item, index }) => (
              <Pressable
                style={({ pressed }) => [styles.queueRow, pressed && { opacity: 0.65 }]}
                onPress={() => playTrack(item, queue)}
              >
                <Text style={styles.queueIndex}>{index + 1}</Text>
                <Image source={item.artwork} style={styles.artwork} contentFit="cover" />
                <View style={styles.trackInfo}>
                  <Text style={styles.trackTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.trackArtist} numberOfLines={1}>{item.artist}</Text>
                </View>
                <Text style={styles.duration}>{formatDuration(item.duration)}</Text>
              </Pressable>
            )}
            contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
            showsVerticalScrollIndicator={false}
          />
        </>
      ) : (
        <View style={styles.emptyState}>
          <Feather name="list" size={48} color="rgba(255,255,255,0.2)" />
          <Text style={styles.emptyTitle}>Queue is empty</Text>
          <Text style={styles.emptyText}>
            Add songs to the queue while browsing
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  title: { fontSize: 17, fontFamily: "Inter_700Bold", color: "#fff" },
  clearText: { fontSize: 14, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.6)" },
  nowPlayingSection: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: "rgba(255,255,255,0.4)",
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  nowPlayingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  playingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  queueRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 12,
  },
  queueIndex: {
    width: 20,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.3)",
    textAlign: "center",
  },
  artwork: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: "#1C1C2A",
  },
  trackInfo: { flex: 1 },
  trackTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
    marginBottom: 3,
  },
  trackArtist: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.5)",
  },
  duration: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.4)",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingBottom: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.45)",
    textAlign: "center",
    paddingHorizontal: 40,
    lineHeight: 22,
  },
});
