import { Feather } from "@expo/vector-icons";
import { useUser } from "@clerk/expo";
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
import ScreenBackground from "@/components/ScreenBackground";
import TrackCard from "@/components/TrackCard";
import { usePlayer } from "@/contexts/PlayerContext";
import { fetchJamendoTracks, Track } from "@/data/tracks";
import { useColors } from "@/hooks/useColors";

type Filter = "All" | "Music" | "Podcasts";

function UserAvatar() {
  const { user } = useUser();
  const initials =
    user?.firstName?.[0] ??
    user?.emailAddresses?.[0]?.emailAddress?.[0] ??
    "U";
  const palette = ["#E8632A", "#7C3AED", "#1DB954", "#E91E8C", "#F59E0B"];
  const bg = palette[initials.charCodeAt(0) % palette.length];
  return (
    <View style={[avatarSt.circle, { backgroundColor: bg }]}>
      <Text style={avatarSt.text}>{initials.toUpperCase()}</Text>
    </View>
  );
}
const avatarSt = StyleSheet.create({
  circle: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  text: { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },
});

function QuickGrid({ items, onPress }: { items: Track[]; onPress: (t: Track, q: Track[]) => void }) {
  const pairs: Track[][] = [];
  for (let i = 0; i < Math.min(items.length, 8); i += 2) {
    pairs.push(items.slice(i, i + 2));
  }
  return (
    <View style={{ gap: 8 }}>
      {pairs.map((pair, pi) => (
        <View key={pi} style={{ flexDirection: "row", gap: 8 }}>
          {pair.map((t) => (
            <Pressable key={t.id} onPress={() => onPress(t, items)} style={{ flex: 1 }}>
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

function RotationRow({ track, queue }: { track: Track; queue: Track[] }) {
  const colors = useColors();
  const { playTrack, currentTrack } = usePlayer();
  const isActive = currentTrack?.id === track.id;
  return (
    <Pressable style={rSt.row} onPress={() => playTrack(track, queue)}>
      <Image source={track.artwork} style={rSt.art} contentFit="cover" />
      <View style={rSt.info}>
        <Text style={[rSt.title, { color: isActive ? "#A78BFA" : "#fff" }]} numberOfLines={1}>{track.title}</Text>
        <Text style={[rSt.artist, { color: colors.mutedForeground }]} numberOfLines={1}>{track.artist}</Text>
      </View>
      <Pressable hitSlop={12} onPress={() => {}}>
        <Feather name="more-vertical" size={20} color="rgba(255,255,255,0.4)" />
      </Pressable>
    </Pressable>
  );
}
const rSt = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 8, gap: 12 },
  art: { width: 54, height: 54, borderRadius: 4 },
  info: { flex: 1, gap: 3 },
  title: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  artist: { fontSize: 13, fontFamily: "Inter_400Regular" },
});

function JumpCard({ track, queue }: { track: Track; queue: Track[] }) {
  const { playTrack } = usePlayer();
  return (
    <Pressable onPress={() => playTrack(track, queue)} style={{ width: 148, marginRight: 12 }}>
      <Image source={track.artwork} style={jSt.art} contentFit="cover" />
      <GlassCard style={jSt.badge} intensity={60}>
        <Text style={jSt.badgeText}>RADIO</Text>
      </GlassCard>
      <Text style={jSt.title} numberOfLines={2}>{track.title}</Text>
      <Text style={jSt.artist} numberOfLines={1}>{track.artist}</Text>
    </Pressable>
  );
}
const jSt = StyleSheet.create({
  art: { width: 148, height: 148, borderRadius: 8 },
  badge: { position: "absolute", top: 8, right: 8, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  badgeText: { color: "#1DB954", fontSize: 10, fontFamily: "Inter_700Bold" },
  title: { color: "#fff", fontSize: 13, fontFamily: "Inter_600SemiBold", marginTop: 8 },
  artist: { color: "rgba(255,255,255,0.55)", fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
});

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { recentlyPlayed, playTrack } = usePlayer();
  const [filter, setFilter] = useState<Filter>("All");
  const [trending, setTrending] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const t = await fetchJamendoTracks({ order: "popularity_month" });
      setTrending(t);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const topPad = Platform.OS === "web" ? 60 : insets.top;
  const FILTERS: Filter[] = ["All", "Music", "Podcasts"];
  const quickItems = recentlyPlayed.length >= 2 ? recentlyPlayed : trending.slice(0, 8);

  return (
    <ScreenBackground accent="#2D0A6B">
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: topPad + 8, paddingBottom: 140 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#A78BFA" />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[st.headerRow, { paddingHorizontal: 16 }]}>
          <UserAvatar />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.chips}>
            {FILTERS.map((f) => (
              <Pressable key={f} onPress={() => setFilter(f)}>
                <GlassCard
                  style={[st.chip, filter === f && st.chipActive]}
                  intensity={filter === f ? 0 : 30}
                >
                  <Text style={[st.chipText, { color: filter === f ? "#fff" : "rgba(255,255,255,0.65)" }]}>{f}</Text>
                </GlassCard>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Quick 2-col grid */}
        {quickItems.length > 0 && (
          <View style={[st.section, { paddingHorizontal: 12 }]}>
            <QuickGrid items={quickItems} onPress={playTrack} />
          </View>
        )}

        {/* Recent rotation */}
        {recentlyPlayed.length > 0 && (
          <View style={[st.section, { paddingHorizontal: 16 }]}>
            <Text style={st.sectionTitle}>Your recent rotation</Text>
            <GlassCard style={{ padding: 12 }} intensity={30}>
              {recentlyPlayed.slice(0, 5).map((t) => (
                <RotationRow key={t.id} track={t} queue={recentlyPlayed} />
              ))}
            </GlassCard>
          </View>
        )}

        {/* Jump back in */}
        <View style={[st.section, { paddingHorizontal: 16 }]}>
          <Text style={st.sectionTitle}>{loading ? "Loading..." : "Jump back in"}</Text>
          {loading ? (
            <ActivityIndicator color="#A78BFA" style={{ marginTop: 12 }} />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginLeft: -16, paddingLeft: 16 }}>
              {trending.slice(0, 8).map((t) => (
                <JumpCard key={t.id} track={t} queue={trending} />
              ))}
            </ScrollView>
          )}
        </View>

        {/* Trending */}
        {trending.length > 0 && (
          <View style={[st.section, { paddingHorizontal: 16 }]}>
            <Text style={st.sectionTitle}>Trending now</Text>
            <GlassCard style={{ borderRadius: 16, overflow: "hidden" }} intensity={30}>
              {trending.slice(0, 6).map((t, i) => (
                <TrackCard key={t.id} track={t} queue={trending} showIndex={i} />
              ))}
            </GlassCard>
          </View>
        )}
      </ScrollView>
    </ScreenBackground>
  );
}

const st = StyleSheet.create({
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
  chips: { flexDirection: "row", gap: 8, paddingVertical: 2 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  chipActive: { backgroundColor: "#7C3AED", borderColor: "#7C3AED" },
  chipText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  section: { marginBottom: 28 },
  sectionTitle: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#fff", marginBottom: 12 },
});
