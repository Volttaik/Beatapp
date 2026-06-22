import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import AlbumCard from "@/components/AlbumCard";
import TrackCard from "@/components/TrackCard";
import { usePlayer } from "@/contexts/PlayerContext";
import {
  FEATURED_GENRES,
  fetchJamendoTracks,
  fetchTracksByTag,
  Track,
} from "@/data/tracks";
import { useColors } from "@/hooks/useColors";

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { recentlyPlayed, playTrack } = usePlayer();

  const [trending, setTrending] = useState<Track[]>([]);
  const [genreTracks, setGenreTracks] = useState<Track[]>([]);
  const [selectedGenre, setSelectedGenre] = useState("electronic");
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [loadingGenre, setLoadingGenre] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadTrending = async () => {
    try {
      const tracks = await fetchJamendoTracks({ order: "popularity_month" });
      setTrending(tracks);
    } catch {
    } finally {
      setLoadingTrending(false);
    }
  };

  const loadGenreTracks = async (genre: string) => {
    setLoadingGenre(true);
    try {
      const tracks = await fetchTracksByTag(genre);
      setGenreTracks(tracks);
    } catch {
      setGenreTracks([]);
    } finally {
      setLoadingGenre(false);
    }
  };

  useEffect(() => {
    loadTrending();
    loadGenreTracks(selectedGenre);
  }, []);

  const handleGenreSelect = (genre: string) => {
    setSelectedGenre(genre);
    loadGenreTracks(genre);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadTrending(), loadGenreTracks(selectedGenre)]);
    setRefreshing(false);
  };

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topPadding + 16 },
      ]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
            Good listening
          </Text>
          <Text style={[styles.title, { color: colors.foreground }]}>
            Discover
          </Text>
        </View>
        <Pressable
          onPress={() => router.push("/player")}
          style={[styles.searchBtn, { backgroundColor: colors.secondary }]}
          hitSlop={8}
        >
          <Feather name="music" size={20} color={colors.primary} />
        </Pressable>
      </View>

      {recentlyPlayed.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Recently Played
          </Text>
          <FlatList
            data={recentlyPlayed.slice(0, 8)}
            horizontal
            keyExtractor={(t) => t.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            renderItem={({ item }) => (
              <AlbumCard
                title={item.title}
                subtitle={item.artist}
                imageUrl={item.artwork}
                onPress={() => playTrack(item, recentlyPlayed)}
                width={130}
              />
            )}
          />
        </View>
      )}

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Trending
        </Text>
        {loadingTrending ? (
          <ActivityIndicator
            color={colors.primary}
            style={{ marginTop: 20 }}
          />
        ) : (
          <FlatList
            data={trending.slice(0, 8)}
            horizontal
            keyExtractor={(t) => t.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            renderItem={({ item }) => (
              <AlbumCard
                title={item.title}
                subtitle={item.artist}
                imageUrl={item.artwork}
                onPress={() => playTrack(item, trending)}
                width={140}
              />
            )}
          />
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Browse by Genre
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.genreList}
        >
          {FEATURED_GENRES.map((g) => (
            <Pressable
              key={g.id}
              onPress={() => handleGenreSelect(g.id)}
              style={[
                styles.genreChip,
                {
                  backgroundColor:
                    selectedGenre === g.id ? colors.primary : colors.secondary,
                },
              ]}
            >
              <Text
                style={[
                  styles.genreLabel,
                  {
                    color:
                      selectedGenre === g.id
                        ? "#FFF"
                        : colors.mutedForeground,
                  },
                ]}
              >
                {g.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {loadingGenre ? (
          <ActivityIndicator
            color={colors.primary}
            style={{ marginTop: 20 }}
          />
        ) : genreTracks.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="music" size={32} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              No tracks found
            </Text>
          </View>
        ) : (
          genreTracks.slice(0, 10).map((track, i) => (
            <TrackCard
              key={track.id}
              track={track}
              queue={genreTracks}
              showIndex={i}
            />
          ))
        )}
      </View>

      <View style={{ height: Platform.OS === "web" ? 34 : 16 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    gap: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  greeting: {
    fontSize: 13,
    fontFamily: Platform.OS === "ios" ? "Inter_400Regular" : undefined,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "Inter_700Bold" : undefined,
  },
  searchBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  section: {
    gap: 12,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "Inter_700Bold" : undefined,
  },
  horizontalList: {
    gap: 12,
  },
  genreList: {
    gap: 8,
    flexDirection: "row",
  },
  genreChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  genreLabel: {
    fontSize: 14,
    fontWeight: "500",
    fontFamily: Platform.OS === "ios" ? "Inter_500Medium" : undefined,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: Platform.OS === "ios" ? "Inter_400Regular" : undefined,
  },
});
