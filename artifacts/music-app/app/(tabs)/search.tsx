import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import GlassCard from "@/components/GlassCard";
import ScreenBackground from "@/components/ScreenBackground";
import TrackCard from "@/components/TrackCard";
import { fetchJamendoTracks, searchJamendoTracks, Track } from "@/data/tracks";

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Track[]>([]);
  const [defaultTracks, setDefaultTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchJamendoTracks({ order: "popularity_week", limit: "30" as any })
      .then(setDefaultTracks)
      .catch(() => {});
  }, []);

  const handleSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); setSearched(false); return; }
    setLoading(true); setSearched(true);
    try { setResults(await searchJamendoTracks(q.trim())); }
    catch { setResults([]); }
    finally { setLoading(false); }
  }, []);

  const handleChangeText = (text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => handleSearch(text), 600);
  };

  const clearSearch = () => { setQuery(""); setResults([]); setSearched(false); inputRef.current?.focus(); };
  const tracks = searched ? results : defaultTracks;
  const topPad = Platform.OS === "web" ? 60 : insets.top;

  return (
    <ScreenBackground accent="#1A0A4A">
      {/* Fixed header */}
      <View style={[st.header, { paddingTop: topPad + 16 }]}>
        <Text style={st.pageTitle}>Search</Text>
        <GlassCard style={st.searchBar} intensity={40}>
          <Feather name="search" size={18} color="rgba(255,255,255,0.5)" style={{ marginLeft: 14 }} />
          <TextInput
            ref={inputRef}
            style={st.input}
            placeholder="Artists, songs, podcasts..."
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
        </View>
      ) : (
        <FlatList
          data={tracks}
          keyExtractor={(t) => t.id}
          renderItem={({ item }) => <TrackCard track={item} queue={tracks} />}
          ListHeaderComponent={
            <Text style={st.sectionLabel}>
              {searched ? (results.length > 0 ? `${results.length} results` : "No results") : "Popular right now"}
            </Text>
          }
          ListEmptyComponent={
            searched ? (
              <View style={st.emptyState}>
                <Feather name="search" size={40} color="rgba(255,255,255,0.25)" />
                <Text style={st.emptyTitle}>No results found</Text>
                <Text style={st.emptyText}>Try searching for something else</Text>
              </View>
            ) : null
          }
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 140, paddingTop: 4 }}
          showsVerticalScrollIndicator={false}
        />
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
    height: 48,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "#fff",
    padding: 0,
  },
  sectionLabel: { fontSize: 13, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.5)", marginBottom: 8 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyState: { alignItems: "center", justifyContent: "center", paddingVertical: 60, gap: 12 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold", color: "#fff" },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.45)" },
});
