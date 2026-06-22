import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import GlassCard from "@/components/GlassCard";
import GlassIcon from "@/components/GlassIcon";
import ScreenBackground from "@/components/ScreenBackground";
import TrackCard from "@/components/TrackCard";
import {
  searchYTMusicTracks,
  fetchFreetouseCategoryTracks,
  Track,
  FEATURED_GENRES,
  GENRE_CATEGORY_ICONS,
} from "@/data/tracks";

const HISTORY_KEY = "beatstream_search_history";
const MAX_HISTORY = 10;

function GenreGrid({ onSelect }: { onSelect: (id: string, label: string) => void }) {
  const [previews, setPreviews] = useState<Record<string, Track>>({});

  useEffect(() => {
    FEATURED_GENRES.forEach((g) => {
      fetchFreetouseCategoryTracks(g.id, { limit: "1" }).then((tracks) => {
        if (tracks.length > 0) {
          setPreviews((prev) => ({ ...prev, [g.id]: tracks[0] }));
        }
      });
    });
  }, []);

  return (
    <View style={gg.grid}>
      {FEATURED_GENRES.map((g) => {
        const preview = previews[g.id];
        return (
          <Pressable
            key={g.id}
            onPress={() => onSelect(g.id, g.label)}
            style={({ pressed }) => [gg.item, pressed && { opacity: 0.75 }]}
          >
            <View style={gg.card}>
              {preview?.artwork ? (
                <Image
                  source={preview.artwork}
                  style={[StyleSheet.absoluteFill, { borderRadius: 16 }]}
                  contentFit="cover"
                />
              ) : null}
              <View style={gg.overlay} />
              <GlassIcon
                name={(GENRE_CATEGORY_ICONS[g.id] ?? "music") as any}
                size={18}
                containerSize={38}
                color="rgba(255,255,255,0.9)"
              />
              <View style={gg.info}>
                <Text style={gg.label}>{g.label}</Text>
                {preview ? (
                  <Text style={gg.trackName} numberOfLines={1}>
                    {preview.title}
                  </Text>
                ) : null}
              </View>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const gg = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  item: { width: "47%" },
  card: {
    height: 88,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    overflow: "hidden",
    backgroundColor: "rgba(8,8,18,0.70)",
    borderWidth: 1,
    borderTopColor: "rgba(255,255,255,0.18)",
    borderLeftColor: "rgba(255,255,255,0.10)",
    borderRightColor: "rgba(255,255,255,0.04)",
    borderBottomColor: "rgba(255,255,255,0.04)",
  } as any,
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(2,4,14,0.62)",
    borderRadius: 16,
  },
  info: { flex: 1 },
  label: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#fff" },
  trackName: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.50)",
    marginTop: 3,
  },
});

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const { genre: genreParam } = useLocalSearchParams<{ genre?: string }>();
  const inputRef = useRef<TextInput>(null);
  const [query, setQuery] = useState(genreParam ?? "");
  const [results, setResults] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const topPad = insets.top > 0 ? insets.top : 16;

  useEffect(() => {
    AsyncStorage.getItem(HISTORY_KEY).then((data) => {
      if (data) setHistory(JSON.parse(data));
    });
  }, []);

  useEffect(() => {
    if (genreParam) handleTextSearch(genreParam);
  }, [genreParam]);

  const saveHistory = async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    const updated = [trimmed, ...history.filter((h) => h !== trimmed)].slice(0, MAX_HISTORY);
    setHistory(updated);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated)).catch(() => {});
  };

  const handleTextSearch = useCallback(
    async (q: string) => {
      if (!q.trim()) {
        setResults([]);
        setSearched(false);
        return;
      }
      setLoading(true);
      setSearched(true);
      try {
        const res = await searchYTMusicTracks(q.trim());
        setResults(res);
        await saveHistory(q.trim());
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [history]
  );

  const handleCategorySearch = useCallback(async (id: string, label: string) => {
    setQuery(label);
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetchFreetouseCategoryTracks(id, { limit: "30" });
      setResults(res);
      await saveHistory(label);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChangeText = (text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => handleTextSearch(text), 600);
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setSearched(false);
    inputRef.current?.focus();
  };

  const clearHistory = async () => {
    setHistory([]);
    await AsyncStorage.removeItem(HISTORY_KEY);
  };

  const removeHistoryItem = async (item: string) => {
    const updated = history.filter((h) => h !== item);
    setHistory(updated);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  };

  return (
    <ScreenBackground>
      <View style={[st.header, { paddingTop: topPad + 16 }]}>
        <Text style={st.pageTitle}>Search</Text>
        <GlassCard style={st.searchBar} intensity={65} shine>
          <Feather name="search" size={17} color="rgba(255,255,255,0.4)" style={{ marginLeft: 14 }} />
          <TextInput
            ref={inputRef}
            style={st.input}
            placeholder="Search YouTube Music..."
            placeholderTextColor="rgba(255,255,255,0.25)"
            value={query}
            onChangeText={handleChangeText}
            returnKeyType="search"
            onSubmitEditing={() => handleTextSearch(query)}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <View style={{ marginRight: 10 }}>
              <GlassIcon name="x" size={14} containerSize={28} onPress={clearSearch} />
            </View>
          )}
        </GlassCard>
      </View>

      {loading ? (
        <View style={st.centered}>
          <ActivityIndicator color="rgba(255,255,255,0.6)" size="large" />
          <Text style={st.loadingText}>Searching...</Text>
        </View>
      ) : searched ? (
        <FlatList
          data={results}
          keyExtractor={(t) => t.id}
          renderItem={({ item }) => <TrackCard track={item} queue={results} />}
          ListHeaderComponent={
            <Text style={[st.resultLabel, { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 8 }]}>
              {results.length > 0
                ? `${results.length} results for "${query}"`
                : "No results found"}
            </Text>
          }
          ListEmptyComponent={
            <View style={st.emptyState}>
              <GlassIcon name="search" size={28} containerSize={72} borderRadius={36} />
              <Text style={st.emptyTitle}>No results found</Text>
              <Text style={st.emptyText}>Try a different search term or browse genres below</Text>
              <View style={{ marginTop: 24, width: "100%", paddingHorizontal: 16 }}>
                <GenreGrid onSelect={handleCategorySearch} />
              </View>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 140, paddingTop: 4 }}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 140, paddingTop: 8 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {history.length > 0 && (
            <View style={{ marginBottom: 28 }}>
              <View style={st.rowBetween}>
                <Text style={st.sectionTitle}>Recent Searches</Text>
                <Pressable onPress={clearHistory} hitSlop={8}>
                  <Text style={st.clearAll}>Clear all</Text>
                </Pressable>
              </View>
              <GlassCard style={{ borderRadius: 16, paddingHorizontal: 14, paddingBottom: 4 }} intensity={60} shine>
                {history.map((item) => (
                  <Pressable
                    key={item}
                    style={({ pressed }) => [st.historyRow, pressed && { opacity: 0.65 }]}
                    onPress={() => {
                      setQuery(item);
                      handleTextSearch(item);
                    }}
                  >
                    <GlassIcon name="clock" size={14} containerSize={28} />
                    <Text style={st.historyText}>{item}</Text>
                    <GlassIcon name="x" size={12} containerSize={24} onPress={() => removeHistoryItem(item)} />
                  </Pressable>
                ))}
              </GlassCard>
            </View>
          )}

          <Text style={[st.sectionTitle, { marginBottom: 14 }]}>Browse Genres</Text>
          <GenreGrid onSelect={handleCategorySearch} />
        </ScrollView>
      )}
    </ScreenBackground>
  );
}

const st = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingBottom: 14, gap: 14 },
  pageTitle: { fontSize: 30, fontFamily: "Inter_700Bold", color: "#fff" },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    height: 52,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "#fff",
    padding: 0,
  },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14 },
  loadingText: { fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.4)" },
  resultLabel: { fontSize: 13, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.45)" },
  sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#fff" },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  clearAll: { fontSize: 13, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.45)" },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 11,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  historyText: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", color: "#fff" },
  emptyState: { alignItems: "center", paddingVertical: 40, gap: 14 },
  emptyTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#fff" },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.4)",
    textAlign: "center",
    paddingHorizontal: 40,
    lineHeight: 22,
  },
});
