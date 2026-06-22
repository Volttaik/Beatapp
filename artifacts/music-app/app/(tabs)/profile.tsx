import { Feather } from "@expo/vector-icons";
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
import GlassIcon from "@/components/GlassIcon";
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
  icon: React.ComponentProps<typeof Feather>["name"];
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
        <GlassIcon
          name={icon}
          size={15}
          containerSize={34}
          borderRadius={10}
          active={danger}
          color={danger ? "rgba(239,68,68,0.9)" : "rgba(255,255,255,0.75)"}
        />
        <Text style={[mSt.label, danger && { color: "#EF4444" }]}>{label}</Text>
      </View>
      <View style={mSt.right}>
        {value ? <Text style={mSt.value}>{value}</Text> : null}
        {onPress && !danger && (
          <Feather name="chevron-right" size={16} color="rgba(255,255,255,0.18)" />
        )}
      </View>
    </Pressable>
  );
}

const mSt = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  left: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  right: { flexDirection: "row", alignItems: "center", gap: 6 },
  label: { fontSize: 15, fontFamily: "Inter_400Regular", color: "#fff" },
  value: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.35)" },
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
  const initial = name[0]?.toUpperCase() ?? "B";
  const topPad = Platform.OS === "web" ? 60 : insets.top;
  const hoursListened = Math.floor(stats.totalSeconds / 3600);
  const minutesListened = Math.floor((stats.totalSeconds % 3600) / 60);

  const handleSignOut = async () => {
    await signOut();
    router.replace("/(auth)/sign-in" as any);
  };

  return (
    <ScreenBackground>
      <ScrollView
        contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar hero */}
        <View style={st.hero}>
          <GlassCard style={st.avatarCard} intensity={75} shine>
            <Text style={st.avatarText}>{initial}</Text>
          </GlassCard>
          <Text style={st.name}>{name}</Text>
          {email ? <Text style={st.email}>{email}</Text> : null}

          {/* Stats row */}
          <View style={st.statsRow}>
            {[
              { label: "Liked", value: favorites.length },
              { label: "Playlists", value: playlists.length },
              { label: "Played", value: stats.totalPlays },
            ].map((s) => (
              <GlassCard key={s.label} style={st.statCard} intensity={65} shine>
                <Text style={st.statNum}>{s.value}</Text>
                <Text style={st.statLabel}>{s.label}</Text>
              </GlassCard>
            ))}
          </View>
        </View>

        {/* Activity */}
        <View style={st.section}>
          <Text style={st.sectionTitle}>Listening Activity</Text>
          <GlassCard style={st.activityCard} intensity={65} shine>
            {[
              {
                icon: "headphones" as const,
                value: hoursListened > 0 ? `${hoursListened}h ${minutesListened}m` : `${minutesListened}m`,
                label: "Total listening time",
              },
              { icon: "star" as const, value: stats.topGenre, label: "Favorite genre" },
              { icon: "clock" as const, value: String(recentlyPlayed.length), label: "Recently played" },
            ].map((item, i) => (
              <View key={i}>
                {i > 0 && <View style={st.divider} />}
                <View style={st.activityRow}>
                  <GlassIcon name={item.icon} size={18} containerSize={38} borderRadius={12} />
                  <View style={{ flex: 1 }}>
                    <Text style={st.activityValue}>{item.value}</Text>
                    <Text style={st.activityLabel}>{item.label}</Text>
                  </View>
                </View>
              </View>
            ))}
          </GlassCard>
        </View>

        {/* Account */}
        <View style={st.section}>
          <Text style={st.sectionTitle}>Account</Text>
          <GlassCard style={st.menuCard} intensity={65} shine>
            <MenuItem icon="mail" label="Email" value={email.length > 24 ? `${email.slice(0, 22)}…` : email} />
            <MenuItem icon="heart" label="Liked Songs" value={`${favorites.length} tracks`} onPress={() => router.push("/(tabs)/favorites" as any)} />
            <MenuItem icon="list" label="My Playlists" value={`${playlists.length} playlists`} onPress={() => router.push("/(tabs)/library" as any)} />
            <MenuItem icon="clock" label="Recently Played" value={`${recentlyPlayed.length} tracks`} onPress={() => router.push("/(tabs)/library" as any)} />
          </GlassCard>
        </View>

        {/* App */}
        <View style={st.section}>
          <Text style={st.sectionTitle}>App</Text>
          <GlassCard style={st.menuCard} intensity={65} shine>
            <MenuItem icon="settings" label="Settings" onPress={() => router.push("/settings" as any)} />
            <MenuItem icon="info" label="About BeatStream" onPress={() => router.push("/settings" as any)} />
            <MenuItem icon="log-out" label="Sign Out" onPress={handleSignOut} danger />
          </GlassCard>
        </View>

        <Text style={st.version}>BeatStream v1.0 · Made with ♪</Text>
      </ScrollView>
    </ScreenBackground>
  );
}

const st = StyleSheet.create({
  hero: { alignItems: "center", marginBottom: 28, paddingHorizontal: 20 },
  avatarCard: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  avatarText: { color: "#fff", fontSize: 36, fontFamily: "Inter_700Bold" },
  name: { color: "#fff", fontSize: 22, fontFamily: "Inter_700Bold", marginBottom: 4 },
  email: { color: "rgba(255,255,255,0.4)", fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 20 },
  statsRow: { flexDirection: "row", gap: 10, width: "100%" },
  statCard: { flex: 1, borderRadius: 14, alignItems: "center", paddingVertical: 16 },
  statNum: { color: "#fff", fontSize: 22, fontFamily: "Inter_700Bold" },
  statLabel: { color: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 3 },
  section: { paddingHorizontal: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "rgba(255,255,255,0.4)", marginBottom: 10, letterSpacing: 0.5 },
  activityCard: { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 4, overflow: "hidden" },
  activityRow: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 14 },
  activityValue: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
  activityLabel: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.4)", marginTop: 2 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: "rgba(255,255,255,0.06)" },
  menuCard: { borderRadius: 18, paddingHorizontal: 14, paddingBottom: 4, overflow: "hidden" },
  version: { color: "rgba(255,255,255,0.18)", fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "center", paddingBottom: 8, marginTop: 8 },
});
