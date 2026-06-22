import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
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
import GlassIcon from "@/components/GlassIcon";
import ScreenBackground from "@/components/ScreenBackground";
import TrackCard from "@/components/TrackCard";
import { usePlayer } from "@/contexts/PlayerContext";
import { fetchFreetouseTracks, Track } from "@/data/tracks";
import { useUserSafe } from "@/hooks/useClerkSafe";

type Filter = "All" | "Trending" | "New";
const FILTERS: Filter[] = ["All", "Trending", "New"];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 18) return "Good Afternoon";
  return "Good Evening";
}

function UserAvatar({ initial }: { initial: string }) {
  return (
    <GlassCard style={st.avatar} intensity={60}>
      <Text style={st.avatarText}>{initial.toUpperCase()}</Text>
    </GlassCard>
  );
}

function QuickCard({ track, queue }: { track: Track; queue: Track[] }) {
  const { playTrack, currentTrack } = usePlayer();
  const isActive = currentTrack?.id === track.id;
  return (
    <Pressable
      style={({ pressed }) => [qc.card, isActive && qc.cardActive, pressed && { opacity: 0.7 }]}
      onPress={() => playTrack(track, queue)}
    >
      <Image source={track.artwork} style={qc.art} contentFit="cover" />
      <Text style={[qc.title, isActive && { color: "#A78BFA" }]} numberOfLines={2}>
        {track.title}
      </Text>
      {isActive && <View style={qc.activeDot} />}
    </Pressable>
  );
}

const qc = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
  },
  cardActive: {
    borderColor: "rgba(167,139,250,0.35)",
    backgroundColor: "rgba(124,58,237,0.12)",
  },
  art: { width: 54, height: 54 },
  title: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
    paddingHorizontal: 10,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#A78BFA",
    marginRight: 10,
  },
});

function RotationRow({ track, queue }: { track: Track; queue: Track[] }) {
  const { playTrack, currentTrack } = usePlayer();
  const isActive = currentTrack?.id === track.id;
  return (
    <Pressable
      style={({ pressed }) => [rr.row, pressed && { opacity: 0.7 }]}
      onPress={() => playTrack(track, queue)}
    >
      <Image source={track.artwork} style={rr.art} contentFit="cover" />
      <View style={rr.info}>
        <Text style={[rr.title, isActive && { color: "#A78BFA" }]} numberOfLines={1}>
          {track.title}
        </Text>
        <Text style={rr.artist} numberOfLines={1}>{track.artist}</Text>
      </View>
      <Pressable hitSlop={12} onPress={() => router.push("/player" as any)}>
        <Feather name="more-vertical" size={18} color="rgba(255,255,255,0.3)" />
      </Pressable>
    </Pressable>
  );
}

const rr = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  art: { width: 52, height: 52, borderRadius: 26, backgroundColor: "#1a1a2e" },
  info: { flex: 1 },
  title: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#fff" },
  artist: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.5)", marginTop: 2 },
});

function RecoCard({ track, queue }: { track: Track; queue: Track[] }) {
  const { playTrack, currentTrack } = usePlayer();
  const isActive = currentTrack?.id === track.id;
  return (
    <Pressable
      style={({ pressed }) => [rc.card, pressed && { opacity: 0.7 }]}
      onPress={() => playTrack(track, queue)}
    >
      <Image source={track.artwork} style={rc.art} contentFit="cover" />
      {isActive && <View style={rc.overlay}><Feather name="pause" size={20} color="#fff" /></View>}
      <Text style={[rc.title, isActive && { color: "#A78BFA" }]} numberOfLines={2}>
        {track.title}
      </Text>
      <Text style={rc.artist} numberOfLines={1}>{track.artist}</Text>
    </Pressable>
  );
}

const rc = StyleSheet.create({
  card: { width: 138, marginRight: 14 },
  art: { width: 138, height: 138, borderRadius: 12, backgroundColor: "#1a1a2e", marginBottom: 8 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    height: 138,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#fff", lineHeight: 18 },
  artist: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.5)", marginTop: 2 },
});

export default function HomeScreen() {
  const { user } = useUserSafe();
  const insets = useSafeAreaInsets();
  const { recentlyPlayed, playTrack } = usePlayer();
  const [filter, setFilter] = useState<Filter>("All");
  const [trending, setTrending] = useState<Track[]>([]);
  const [newReleases, setNewReleases] = useState<Track[]>([]);
  const [topPicks, setTopPicks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const initial =
    user?.firstName?.[0] ??
    user?.emailAddresses?.[0]?.emailAddress?.[0] ??
    "B";

  const firstName =
    user?.firstName ??
    user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] ??
    "there";

  const load = async () => {
    try {
      const [t, n, p] = await Promise.all([
        fetchFreetouseTracks({ limit: "20", page: "1" }),
        fetchFreetouseTracks({ limit: "20", page: "2" }),
        fetchFreetouseTracks({ limit: "20", page: "3" }),
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

  const quickItems = filter === "New"
    ? newReleases.slice(0, 8)
    : filter === "Trending"
    ? trending.slice(0, 8)
    : recentlyPlayed.length >= 4
    ? recentlyPlayed.slice(0, 8)
    : trending.slice(0, 8);

  const rotationItems = filter === "New"
    ? newReleases.slice(8, 16)
    : recentlyPlayed.length > 0
    ? recentlyPlayed.slice(0, 10)
    : trending.slice(8, 16);

  const recoItems = filter === "Trending"
    ? topPicks
    : filter === "New"
    ? newReleases.slice(0, 12)
    : topPicks;

  const pairs: Track[][] = [];
  for (let i = 0; i < quickItems.length; i += 2) {
    pairs.push(quickItems.slice(i, i + 2));
  }

  return (
    <ScreenBackground>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: topPad + 8, paddingBottom: 140 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="rgba(255,255,255,0.5)" />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={st.headerRow}>
          <Pressable onPress={() => router.push("/(tabs)/profile" as any)}>
            <UserAvatar initial={initial} />
          </Pressable>
          <View style={{ flex: 1, paddingHorizontal: 12 }}>
            <Text style={st.greeting}>{getGreeting()}</Text>
            <Text style={st.username} numberOfLines={1}>{firstName}</Text>
          </View>
          <Pressable onPress={() => router.push("/settings" as any)} hitSlop={8}>
            <GlassCard style={st.iconBtn} intensity={50}>
              <Feather name="settings" size={17} color="rgba(255,255,255,0.6)" />
            </GlassCard>
          </Pressable>
        </View>

        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={st.chipsRow}
          style={{ marginBottom: 20 }}
        >
          {FILTERS.map((f) => (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              style={[st.chip, f === filter && st.chipActive]}
            >
              <Text style={[st.chipText, f === filter && st.chipTextActive]}>{f}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Quick access grid */}
        {loading ? (
          <View style={{ alignItems: "center", paddingVertical: 40 }}>
            <ActivityIndicator color="rgba(255,255,255,0.5)" size="large" />
          </View>
        ) : pairs.length > 0 ? (
          <View style={[st.section, { paddingHorizontal: 14, gap: 8 }]}>
            {pairs.map((pair, pi) => (
              <View key={pi} style={{ flexDirection: "row", gap: 8 }}>
                {pair.map((t) => (
                  <QuickCard key={t.id} track={t} queue={quickItems} />
                ))}
                {pair.length === 1 && <View style={{ flex: 1 }} />}
              </View>
            ))}
          </View>
        ) : null}

        {/* Recent rotation / history */}
        {rotationItems.length > 0 && (
          <View style={[st.section, { paddingHorizontal: 16 }]}>
            <Text style={st.sectionTitle}>
              {recentlyPlayed.length > 0 && filter === "All" ? "Your recent rotation" : "Popular tracks"}
            </Text>
            <GlassCard style={st.listCard} intensity={40}>
              {rotationItems.slice(0, 6).map((t) => (
                <RotationRow key={t.id} track={t} queue={rotationItems} />
              ))}
            </GlassCard>
          </View>
        )}

        {/* Recommended horizontal scroll */}
        {recoItems.length > 0 && (
          <View style={st.section}>
            <Text style={[st.sectionTitle, { paddingHorizontal: 16 }]}>Recommended for today</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12 }}
            >
              {recoItems.slice(0, 12).map((t) => (
                <RecoCard key={t.id} track={t} queue={recoItems} />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Top picks list */}
        {topPicks.length > 0 && (
          <View style={[st.section, { paddingHorizontal: 16 }]}>
            <Text style={st.sectionTitle}>Top Picks</Text>
            <GlassCard style={{ borderRadius: 14, overflow: "hidden" }} intensity={40}>
              {topPicks.slice(0, 6).map((t, i) => (
                <TrackCard key={t.id} track={t} queue={topPicks} showIndex={i} />
              ))}
            </GlassCard>
          </View>
        )}
      </ScrollView>
    </ScreenBackground>
  );
}

const st = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 18,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },
  greeting: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.45)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  username: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#fff", marginTop: 1 },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  chipsRow: { paddingHorizontal: 16, gap: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  chipActive: {
    backgroundColor: "#fff",
    borderColor: "transparent",
  },
  chipText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: "rgba(255,255,255,0.7)",
  },
  chipTextActive: { color: "#000" },
  section: { marginBottom: 28 },
  sectionTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    marginBottom: 14,
  },
  listCard: {
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingBottom: 4,
    overflow: "hidden",
  },
});
