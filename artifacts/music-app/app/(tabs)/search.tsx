import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import GlassCard from "@/components/GlassCard";
import ScreenBackground from "@/components/ScreenBackground";
import TrackCard from "@/components/TrackCard";
import { fetchJamendoTracks, searchJamendoTracks, Track, FEATURED_GENRES } from "@/data/tracks";

const HISTORY_KEY = "beatstream_search_history";
const MAX_HISTORY = 10;

const GENRE_COLORS: Record<string, string> = {
  electronic: "#7C3AED",
  rock: "#E8632A",
  jazz: "#0EA5E9",
  ambient: "#10B981",
  classical: "#F59E0B",
  hiphop: "#EF4444",
  pop: "#EC4899",
  folk: "#84CC16",
};

const GENRE_ICONS: Record<string, string> = {
  electronic: "zap",
  rock: "radio",
  jazz: "music",
  ambient: "wind",
  classical: "award",
  hiphop: "mic",
  pop: "star",
  folk: "feather",
};

function GenreGrid({ onSelect }: { onSelect: (genre: string) => void }) {
  return (
    <View style={ggSt.grid}>
      {FEATURED_GENRES.map((g) => (
        <Pressable
          key={g.id}
          onPress={() => onSelect(g.label)}
          style={[ggSt.card, { backgroundColor: GENRE_COLORS[g.id] ?? "#7C3AED" }]}
        >
          <LinearGradient
            colors={["rgba(255,255,255,0.15)", "transparent"]}
            style={StyleSheet.absoluteFill}
          />
          <Feather name={(GENRE_ICONS[g.id] as any) ?? "music"} size={22} color="rgba(255,255,255,0.9)" />
          <Text style={ggSt.label}>{g.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}
const ggSt = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  card: {
    width: "47%",
    height: 76,
    borderRadius: 12,
    padding: 14,
    justifyContent: "space-between",
    overflow: "hidden",
  },
  label: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },
});

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const { genre: genreParam } = useLocalSearchParams<{ genre?: string }>();
  const inputRef = useRef<TextInput>(null);
  const [query, setQuery] = useState(genreParam ?? "");
  const [results, setResults] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(!!genreParam);
  const [history, setHistory] = useState<string[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const topPad = Platform.OS === "web" ? 60 : insets.top;

  useEffect(() => {
    AsyncStorage.getItem(HISTORY_KEY).then((data) => {
      if (data) setHistory(JSON.parse(data));
    });
  }, []);

  useEffect(() => {
    if (genreParam) {
      handleSearch(genreParam);
    }
  }, [genreParam]);

  const saveHistory = async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    const updated = [trimmed, ...history.filter((h) => h !== trimmed)].slice(0, MAX_HISTORY);
    setHistory(updated);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated)).catch(() => {});
  };

  const handleSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); setSearched(false); return; }
    setLoading(true); setSearched(true);
    try {
      setResults(await searchJamendoTracks(q.trim()));
      await saveHistory(q.trim());
    } catch { setResults([]); }
    finally { setLoading(false); }
  }, [history]);

  const handleChangeText = (text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => handleSearch(text), 600);
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
    <ScreenBackground accent="#1A0A4A">
      {/* Fixed search header */}
      <View style={[st.header, { paddingTop: topPad + 16 }]}>
        <Text style={st.pageTitle}>Search</Text>
        <GlassCard style={st.searchBar} intensity={40}>
          <Feather name="search" size={18} color="rgba(255,255,255,0.5)" style={{ marginLeft: 14 }} />
          <TextInput
            ref={inputRef}
            style={st.input}
            placeholder="Artists, songs, genres..."
            placeholderTextColor="rgba(255,255,255,0.35)"
            value={query}
            onChangeText={handleChangeText}
            returnKeyType="search"
            onSubmitEditing={() => handleSearch(query)}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <Pressable onPress={clearSearch} hitSlop={8} style={{ marginRight: 14 }}>
              <Feather name="x" size={18} color="rgba(255,255,255,0.5)" />
            </Pressable>
          )}
        </GlassCard>
      </View>

      {loading ? (
        <View style={st.centered}>
          <ActivityIndicator color="#A78BFA" size="large" />
          <Text style={st.loadingText}>Searching...</Text>
        </View>
      ) : searched ? (
        <FlatList
          data={results}
          keyExtractor={(t) => t.id}
          renderItem={({ item }) => <TrackCard track={item} queue={results} />}
          ListHeaderComponent={
            <Text style={[st.sectionLabel, { paddingHorizontal: 16, paddingTop: 4 }]}>
              {results.length > 0 ? `${results.length} results for "${query}"` : "No results found"}
            </Text>
          }
          ListEmptyComponent={
            <View style={st.emptyState}>
              <Feather name="search" size={48} color="rgba(255,255,255,0.15)" />
              <Text style={st.emptyTitle}>No results found</Text>
              <Text style={st.emptyText}>Try a different search term or explore a genre</Text>
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
          {/* Search history */}
          {history.length > 0 && (
            <View style={{ marginBottom: 24 }}>
              <View style={st.historyHeader}>
                <Text style={st.sectionTitle}>Recent Searches</Text>
                <Pressable onPress={clearHistory} hitSlop={8}>
                  <Text style={st.clearAll}>Clear all</Text>
                </Pressable>
              </View>
              {history.map((item) => (
                <Pressable
                  key={item}
                  style={({ pressed }) => [st.historyRow, pressed && { opacity: 0.65 }]}
                  onPress={() => { setQuery(item); handleSearch(item); }}
                >
                  <Feather name="clock" size={16} color="rgba(255,255,255,0.4)" />
                  <Text style={st.historyText}>{item}</Text>
                  <Pressable onPress={() => removeHistoryItem(item)} hitSlop={8}>
                    <Feather name="x" size={16} color="rgba(255,255,255,0.3)" />
                  </Pressable>
                </Pressable>
              ))}
            </View>
          )}

          {/* Browse genres */}
          <Text style={st.sectionTitle}>Browse Genres</Text>
          <View style={{ marginTop: 12 }}>
            <GenreGrid onSelect={(g) => { setQuery(g); handleSearch(g); }} />
          </View>
        </ScrollView>
      )}
    </ScreenBackground>
  );
}

const st = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingBottom: 12, gap: 14 },
  pageTitle: { fontSize: 30, fontFamily: "Inter_700Bold", color: "#fff" },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    height: 50,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "#fff",
    padding: 0,
  },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  loadingText: { fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.4)" },
  sectionLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.5)",
    marginBottom: 8,
  },
  sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#fff" },
  historyHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  clearAll: { fontSize: 13, fontFamily: "Inter_500Medium", color: "#A78BFA" },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 11,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  historyText: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular", color: "#fff" },
  emptyState: { alignItems: "center", paddingVertical: 60, gap: 12 },
  emptyTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#fff" },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.45)",
    textAlign: "center",
    paddingHorizontal: 40,
    lineHeight: 22,
  },
});
