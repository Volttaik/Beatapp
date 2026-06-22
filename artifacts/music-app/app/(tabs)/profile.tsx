import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import GlassCard from "@/components/GlassCard";
import ScreenBackground from "@/components/ScreenBackground";
import { useLibrary } from "@/contexts/LibraryContext";
import { usePlaylists } from "@/contexts/PlaylistContext";
import { usePlayer } from "@/contexts/PlayerContext";
import { useStats } from "@/contexts/StatsContext";
import { useAuthSafe, useUserSafe } from "@/hooks/useClerkSafe";

function MenuItem({
  icon,
  label,
  value,
  onPress,
  danger,
}: {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable
      style={({ pressed }) => [mSt.row, pressed && { opacity: 0.65 }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={mSt.left}>
        <View style={[mSt.iconBox, { backgroundColor: danger ? "rgba(239,68,68,0.12)" : "rgba(124,58,237,0.12)" }]}>
          <Feather name={icon as any} size={16} color={danger ? "#EF4444" : "#A78BFA"} />
        </View>
        <Text style={[mSt.label, { color: danger ? "#EF4444" : "#fff" }]}>{label}</Text>
      </View>
      <View style={mSt.right}>
        {value ? <Text style={mSt.value}>{value}</Text> : null}
        {onPress && !danger ? (
          <Feather name="chevron-right" size={18} color="rgba(255,255,255,0.25)" />
        ) : null}
      </View>
    </Pressable>
  );
}

const mSt = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.07)",
  },
  left: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  iconBox: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  right: { flexDirection: "row", alignItems: "center", gap: 6 },
  label: { fontSize: 15, fontFamily: "Inter_400Regular" },
  value: { fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.4)" },
});

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { signOut } = useAuthSafe();
  const { user } = useUserSafe();
  const { favorites } = useLibrary();
  const { playlists } = usePlaylists();
  const { recentlyPlayed } = usePlayer();
  const { stats } = useStats();

  const email = user?.emailAddresses?.[0]?.emailAddress ?? "";
  const name = user?.fullName ?? user?.firstName ?? email.split("@")[0] ?? "Listener";
  const initial = name[0]?.toUpperCase() ?? "U";
  const palette = ["#E8632A", "#7C3AED", "#1DB954", "#E91E8C", "#F59E0B"];
  const bg = palette[initial.charCodeAt(0) % palette.length];
  const topPad = Platform.OS === "web" ? 60 : insets.top;

  const hoursListened = Math.floor(stats.totalSeconds / 3600);
  const minutesListened = Math.floor((stats.totalSeconds % 3600) / 60);

  const handleSignOut = async () => {
    await signOut();
    router.replace("/(auth)/sign-in" as any);
  };

  return (
    <ScreenBackground accent="#1E0A4A">
      <ScrollView
        contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={st.hero}>
          <View style={st.avatarWrapper}>
            <LinearGradient
              colors={[bg, `${bg}88`]}
              style={st.avatar}
            >
              <Text style={st.avatarText}>{initial}</Text>
            </LinearGradient>
            <View style={st.onlineDot} />
          </View>
          <Text style={st.name}>{name}</Text>
          <Text style={st.email}>{email}</Text>

          {/* Stat cards */}
          <View style={st.statsRow}>
            <GlassCard style={st.statCard} intensity={40}>
              <Text style={st.statNum}>{favorites.length}</Text>
              <Text style={st.statLabel}>Liked</Text>
            </GlassCard>
            <GlassCard style={st.statCard} intensity={40}>
              <Text style={st.statNum}>{playlists.length}</Text>
              <Text style={st.statLabel}>Playlists</Text>
            </GlassCard>
            <GlassCard style={st.statCard} intensity={40}>
              <Text style={st.statNum}>{stats.totalPlays}</Text>
              <Text style={st.statLabel}>Played</Text>
            </GlassCard>
          </View>
        </View>

        {/* Listening stats */}
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <Text style={st.sectionTitle}>Listening Activity</Text>
          <GlassCard style={st.activityCard} intensity={30}>
            <View style={st.activityItem}>
              <Feather name="headphones" size={20} color="#A78BFA" />
              <View style={{ flex: 1 }}>
                <Text style={st.activityValue}>
                  {hoursListened > 0 ? `${hoursListened}h ${minutesListened}m` : `${minutesListened}m`}
                </Text>
                <Text style={st.activityLabel}>Total listening time</Text>
              </View>
            </View>
            <View style={st.divider} />
            <View style={st.activityItem}>
              <Feather name="star" size={20} color="#A78BFA" />
              <View style={{ flex: 1 }}>
                <Text style={st.activityValue}>{stats.topGenre}</Text>
                <Text style={st.activityLabel}>Favorite genre</Text>
              </View>
            </View>
            <View style={st.divider} />
            <View style={st.activityItem}>
              <Feather name="clock" size={20} color="#A78BFA" />
              <View style={{ flex: 1 }}>
                <Text style={st.activityValue}>{recentlyPlayed.length}</Text>
                <Text style={st.activityLabel}>Recently played</Text>
              </View>
            </View>
          </GlassCard>
        </View>

        {/* Account section */}
        <View style={{ paddingHorizontal: 16, marginBottom: 14 }}>
          <Text style={st.sectionTitle}>Account</Text>
          <GlassCard style={st.section} intensity={30}>
            <MenuItem
              icon="mail"
              label="Email"
              value={email.length > 24 ? `${email.slice(0, 22)}…` : email}
            />
            <MenuItem
              icon="heart"
              label="Liked Songs"
              value={`${favorites.length} tracks`}
              onPress={() => router.push("/(tabs)/favorites" as any)}
            />
            <MenuItem
              icon="list"
              label="My Playlists"
              value={`${playlists.length} playlists`}
              onPress={() => router.push("/(tabs)/library" as any)}
            />
            <MenuItem
              icon="clock"
              label="Recently Played"
              value={`${recentlyPlayed.length} tracks`}
              onPress={() => router.push("/(tabs)/library" as any)}
            />
          </GlassCard>
        </View>

        <View style={{ paddingHorizontal: 16, marginBottom: 14 }}>
          <Text style={st.sectionTitle}>App</Text>
          <GlassCard style={st.section} intensity={30}>
            <MenuItem
              icon="settings"
              label="Settings"
              onPress={() => router.push("/settings" as any)}
            />
            <MenuItem
              icon="info"
              label="About Beatstream"
              onPress={() => router.push("/settings" as any)}
            />
            <MenuItem
              icon="log-out"
              label="Sign Out"
              onPress={handleSignOut}
              danger
            />
          </GlassCard>
        </View>

        <Text style={st.version}>Beatstream v1.0.0 · Made with ♪</Text>
      </ScrollView>
    </ScreenBackground>
  );
}

const st = StyleSheet.create({
  hero: { alignItems: "center", marginBottom: 28, paddingHorizontal: 20 },
  avatarWrapper: { position: "relative", marginBottom: 14 },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontSize: 38, fontFamily: "Inter_700Bold" },
  onlineDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#1DB954",
    borderWidth: 3,
    borderColor: "#08080F",
    position: "absolute",
    bottom: 2,
    right: 2,
  },
  name: { color: "#fff", fontSize: 24, fontFamily: "Inter_700Bold", marginBottom: 4 },
  email: { color: "rgba(255,255,255,0.45)", fontSize: 14, fontFamily: "Inter_400Regular", marginBottom: 20 },
  statsRow: { flexDirection: "row", gap: 12, width: "100%" },
  statCard: { flex: 1, borderRadius: 14, alignItems: "center", paddingVertical: 16 },
  statNum: { color: "#fff", fontSize: 22, fontFamily: "Inter_700Bold" },
  statLabel: { color: "rgba(255,255,255,0.45)", fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 3 },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: "rgba(255,255,255,0.45)",
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  activityCard: { borderRadius: 16, paddingHorizontal: 16, paddingVertical: 4, overflow: "hidden" },
  activityItem: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 14 },
  activityValue: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
  activityLabel: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.45)", marginTop: 2 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: "rgba(255,255,255,0.07)" },
  section: { borderRadius: 16, paddingHorizontal: 16, paddingBottom: 4, overflow: "hidden" },
  version: {
    color: "rgba(255,255,255,0.2)",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    paddingHorizontal: 20,
    paddingBottom: 8,
    marginTop: 8,
  },
});
