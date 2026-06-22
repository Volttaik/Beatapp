import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import GlassCard from "@/components/GlassCard";
import ScreenBackground from "@/components/ScreenBackground";
import TrackCard from "@/components/TrackCard";
import { usePlayer } from "@/contexts/PlayerContext";
import { fetchJamendoTracks, fetchTracksByTag, Track, FEATURED_GENRES } from "@/data/tracks";
import { useColors } from "@/hooks/useColors";
import { useUserSafe } from "@/hooks/useClerkSafe";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 18) return "Good Afternoon";
  return "Good Evening";
}

function UserAvatar() {
  const { user } = useUserSafe();
  const initials = user?.firstName?.[0] ?? user?.emailAddresses?.[0]?.emailAddress?.[0] ?? "U";
  const palette = ["#E8632A", "#7C3AED", "#1DB954", "#E91E8C", "#F59E0B"];
  const bg = palette[initials.charCodeAt(0) % palette.length];
  return (
    <View style={[avSt.circle, { backgroundColor: bg }]}>
      <Text style={avSt.text}>{initials.toUpperCase()}</Text>
    </View>
  );
}
const avSt = StyleSheet.create({
  circle: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  text: { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },
});

function SectionTitle({ title, onSeeAll }: { title: string; onSeeAll?: () => void }) {
  return (
    <View style={seSt.row}>
      <Text style={seSt.title}>{title}</Text>
      {onSeeAll && (
        <Pressable onPress={onSeeAll} hitSlop={8}>
          <Text style={seSt.seeAll}>See all</Text>
        </Pressable>
      )}
    </View>
  );
}
const seSt = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  title: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#fff" },
  seeAll: { fontSize: 13, fontFamily: "Inter_500Medium", color: "#A78BFA" },
});

function HorizontalTrackCard({ track, queue }: { track: Track; queue: Track[] }) {
  const { playTrack, currentTrack } = usePlayer();
  const isActive = currentTrack?.id === track.id;
  return (
    <Pressable onPress={() => playTrack(track, queue)} style={htSt.card}>
      <Image source={track.artwork} style={htSt.art} contentFit="cover" />
      {isActive && (
        <View style={htSt.activeOverlay}>
          <View style={htSt.activeDot} />
        </View>
      )}
      <Text style={[htSt.title, isActive && { color: "#A78BFA" }]} numberOfLines={2}>{track.title}</Text>
      <Text style={htSt.artist} numberOfLines={1}>{track.artist}</Text>
    </Pressable>
  );
}
const htSt = StyleSheet.create({
  card: { width: 140, marginRight: 12 },
  art: { width: 140, height: 140, borderRadius: 12, backgroundColor: "#1C1C2A", marginBottom: 8 },
  activeOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
    backgroundColor: "rgba(124,58,237,0.3)",
    alignItems: "flex-end",
    justifyContent: "flex-start",
    padding: 8,
    height: 140,
  },
  activeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#A78BFA" },
  title: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#fff", lineHeight: 18 },
  artist: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.5)", marginTop: 2 },
});

function QuickGrid({ items }: { items: Track[] }) {
  const { playTrack } = usePlayer();
  const pairs: Track[][] = [];
  for (let i = 0; i < Math.min(items.length, 8); i += 2) {
    pairs.push(items.slice(i, i + 2));
  }
  return (
    <View style={{ gap: 8 }}>
      {pairs.map((pair, pi) => (
        <View key={pi} style={{ flexDirection: "row", gap: 8 }}>
          {pair.map((t) => (
            <Pressable key={t.id} onPress={() => playTrack(t, items)} style={{ flex: 1 }}>
              <GlassCard style={qSt.cell} intensity={35}>
                <Image source={t.artwork} style={qSt.art} contentFit="cover" />
                <Text style={qSt.title} numberOfLines={2}>{t.title}</Text>
              </GlassCard>
            </Pressable>
          ))}
          {pair.length === 1 && <View style={{ flex: 1 }} />}
        </View>
      ))}
    </View>
  );
}
const qSt = StyleSheet.create({
  cell: { flexDirection: "row", alignItems: "center", borderRadius: 8, overflow: "hidden" },
  art: { width: 56, height: 56 },
  title: { flex: 1, color: "#fff", fontSize: 13, fontFamily: "Inter_600SemiBold", paddingHorizontal: 10 },
});

function GenreChip({ genre, onPress }: { genre: { id: string; label: string; color: string }; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[gcSt.chip, { backgroundColor: genre.color }]}>
      <Text style={gcSt.label}>{genre.label}</Text>
    </Pressable>
  );
}
const gcSt = StyleSheet.create({
  chip: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20, marginRight: 10 },
  label: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#fff" },
});

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

export default function HomeScreen() {
  const { user } = useUserSafe();
  const insets = useSafeAreaInsets();
  const { recentlyPlayed, playTrack } = usePlayer();
  const [trending, setTrending] = useState<Track[]>([]);
  const [newReleases, setNewReleases] = useState<Track[]>([]);
  const [topPicks, setTopPicks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const firstName = user?.firstName ?? user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] ?? "there";

  const load = async () => {
    try {
      const [t, n, p] = await Promise.all([
        fetchJamendoTracks({ order: "popularity_month", limit: "20" }),
        fetchJamendoTracks({ order: "releasedate", limit: "12" }),
        fetchJamendoTracks({ order: "popularity_total", limit: "12" }),
      ]);
      setTrending(t);
      setNewReleases(n);
      setTopPicks(p);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };
  const topPad = Platform.OS === "web" ? 60 : insets.top;
  const quickItems = recentlyPlayed.length >= 2 ? recentlyPlayed.slice(0, 8) : trending.slice(0, 8);

  return (
    <ScreenBackground accent="#2D0A6B">
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: topPad + 8, paddingBottom: 140 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#A78BFA" />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={st.headerRow}>
          <Pressable onPress={() => router.push("/(tabs)/profile" as any)}>
            <UserAvatar />
          </Pressable>
          <View style={{ flex: 1, paddingHorizontal: 12 }}>
            <Text style={st.greeting}>{getGreeting()}</Text>
            <Text style={st.username} numberOfLines={1}>{firstName} 👋</Text>
          </View>
          <Pressable onPress={() => router.push("/settings" as any)} hitSlop={8}>
            <GlassCard style={st.iconBtn} intensity={30}>
              <Feather name="settings" size={18} color="rgba(255,255,255,0.7)" />
            </GlassCard>
          </Pressable>
        </View>

        {/* Quick grid — recently played or trending */}
        {quickItems.length > 0 && (
          <View style={[st.section, { paddingHorizontal: 12 }]}>
            <QuickGrid items={quickItems} />
          </View>
        )}

        {/* Continue listening */}
        {recentlyPlayed.length > 0 && (
          <View style={st.section}>
            <View style={{ paddingHorizontal: 16 }}>
              <SectionTitle title="Continue Listening" />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16 }}
            >
              {recentlyPlayed.slice(0, 10).map((t) => (
                <HorizontalTrackCard key={t.id} track={t} queue={recentlyPlayed} />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Genre explorer */}
        <View style={st.section}>
          <View style={{ paddingHorizontal: 16 }}>
            <SectionTitle title="Explore Genres" />
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          >
            {FEATURED_GENRES.map((g) => (
              <GenreChip
                key={g.id}
                genre={{ ...g, color: GENRE_COLORS[g.id] ?? "#7C3AED" }}
                onPress={() => router.push(`/(tabs)/search?genre=${g.id}` as any)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Trending now */}
        {!loading && trending.length > 0 && (
          <View style={st.section}>
            <View style={{ paddingHorizontal: 16 }}>
              <SectionTitle
                title="Trending Now 🔥"
                onSeeAll={() => router.push("/(tabs)/search" as any)}
              />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16 }}
            >
              {trending.slice(0, 10).map((t) => (
                <HorizontalTrackCard key={t.id} track={t} queue={trending} />
              ))}
            </ScrollView>
          </View>
        )}

        {/* New releases */}
        {!loading && newReleases.length > 0 && (
          <View style={st.section}>
            <View style={{ paddingHorizontal: 16 }}>
              <SectionTitle title="New Releases ✨" />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16 }}
            >
              {newReleases.slice(0, 10).map((t) => (
                <HorizontalTrackCard key={t.id} track={t} queue={newReleases} />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Top tracks list */}
        {loading ? (
          <View style={{ alignItems: "center", paddingVertical: 40 }}>
            <ActivityIndicator color="#A78BFA" size="large" />
            <Text style={{ color: "rgba(255,255,255,0.4)", marginTop: 12, fontFamily: "Inter_400Regular" }}>
              Loading music...
            </Text>
          </View>
        ) : topPicks.length > 0 ? (
          <View style={[st.section, { paddingHorizontal: 16 }]}>
            <SectionTitle title="Top Picks For You 🎵" />
            <GlassCard style={{ borderRadius: 16, overflow: "hidden" }} intensity={30}>
              {topPicks.slice(0, 8).map((t, i) => (
                <TrackCard key={t.id} track={t} queue={topPicks} showIndex={i} />
              ))}
            </GlassCard>
          </View>
        ) : null}

        {/* Promoted banner */}
        <View style={[st.section, { paddingHorizontal: 16 }]}>
          <Pressable onPress={() => router.push("/(tabs)/search" as any)}>
            <GlassCard style={st.banner} intensity={40}>
              <LinearGradient
                colors={["rgba(124,58,237,0.5)", "rgba(236,72,153,0.3)"]}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
              />
              <Feather name="headphones" size={32} color="#fff" />
              <View style={{ flex: 1 }}>
                <Text style={st.bannerTitle}>Discover New Music</Text>
                <Text style={st.bannerSub}>Search millions of tracks, free</Text>
              </View>
              <Feather name="arrow-right" size={20} color="rgba(255,255,255,0.7)" />
            </GlassCard>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

const st = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  greeting: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.5)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  username: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#fff", marginTop: 1 },
  iconBtn: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  section: { marginBottom: 28 },
  banner: {
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    overflow: "hidden",
  },
  bannerTitle: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
  bannerSub: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.65)", marginTop: 3 },
});
