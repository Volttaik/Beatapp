import { useAuth, useUser } from "@clerk/expo";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import GlassCard from "@/components/GlassCard";
import ScreenBackground from "@/components/ScreenBackground";
import { useLibrary } from "@/contexts/LibraryContext";
import { usePlayer } from "@/contexts/PlayerContext";

function MenuItem({ icon, label, value, onPress, danger }: {
  icon: string; label: string; value?: string; onPress?: () => void; danger?: boolean;
}) {
  return (
    <Pressable
      style={({ pressed }) => [mSt.row, pressed && { opacity: 0.65 }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={mSt.left}>
        <Feather name={icon as any} size={20} color={danger ? "#EF4444" : "rgba(255,255,255,0.6)"} style={mSt.icon} />
        <Text style={[mSt.label, { color: danger ? "#EF4444" : "#fff" }]}>{label}</Text>
      </View>
      {value ? <Text style={mSt.value}>{value}</Text> : null}
      {onPress && !danger ? <Feather name="chevron-right" size={18} color="rgba(255,255,255,0.3)" /> : null}
    </Pressable>
  );
}
const mSt = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "rgba(255,255,255,0.1)" },
  left: { flexDirection: "row", alignItems: "center" },
  icon: { marginRight: 14 },
  label: { fontSize: 16, fontFamily: "Inter_400Regular" },
  value: { fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.45)" },
});

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { signOut } = useAuth();
  const { user } = useUser();
  const { favorites } = useLibrary();
  const { recentlyPlayed } = usePlayer();

  const email = user?.emailAddresses?.[0]?.emailAddress ?? "";
  const name = user?.fullName ?? user?.firstName ?? email.split("@")[0] ?? "Listener";
  const initial = name[0]?.toUpperCase() ?? "U";
  const palette = ["#E8632A", "#7C3AED", "#1DB954", "#E91E8C", "#F59E0B"];
  const bg = palette[initial.charCodeAt(0) % palette.length];
  const topPad = Platform.OS === "web" ? 60 : insets.top;

  const handleSignOut = async () => {
    await signOut();
    router.replace("/(auth)/sign-in" as any);
  };

  return (
    <ScreenBackground accent="#1E0A4A">
      <ScrollView
        contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: 140, paddingHorizontal: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={st.hero}>
          <View style={[st.avatar, { backgroundColor: bg }]}>
            <Text style={st.avatarText}>{initial}</Text>
          </View>
          <Text style={st.name}>{name}</Text>
          <Text style={st.email}>{email}</Text>

          {/* Stats row */}
          <View style={st.statsRow}>
            <GlassCard style={st.statCard} intensity={40}>
              <Text style={st.statNum}>{favorites.length}</Text>
              <Text style={st.statLabel}>Liked</Text>
            </GlassCard>
            <GlassCard style={st.statCard} intensity={40}>
              <Text style={st.statNum}>{recentlyPlayed.length}</Text>
              <Text style={st.statLabel}>Played</Text>
            </GlassCard>
            <GlassCard style={st.statCard} intensity={40}>
              <Text style={st.statNum}>∞</Text>
              <Text style={st.statLabel}>Free</Text>
            </GlassCard>
          </View>
        </View>

        {/* Account section */}
        <GlassCard style={st.section} intensity={30}>
          <Text style={st.sectionLabel}>ACCOUNT</Text>
          <MenuItem icon="mail" label="Email" value={email.length > 24 ? email.slice(0, 22) + "…" : email} />
          <MenuItem icon="heart" label="Liked Songs" value={`${favorites.length} tracks`} onPress={() => router.push("/(tabs)/library" as any)} />
          <MenuItem icon="clock" label="Recently Played" value={`${recentlyPlayed.length} tracks`} />
        </GlassCard>

        <GlassCard style={[st.section, { marginTop: 14 }]} intensity={30}>
          <Text style={st.sectionLabel}>APP</Text>
          <MenuItem icon="info" label="About Beat Stream" />
          <MenuItem icon="log-out" label="Sign Out" onPress={handleSignOut} danger />
        </GlassCard>

        <Text style={st.version}>Beat Stream v1.0.0 · Open Source</Text>
      </ScrollView>
    </ScreenBackground>
  );
}

const st = StyleSheet.create({
  hero: { alignItems: "center", marginBottom: 28 },
  avatar: { width: 90, height: 90, borderRadius: 45, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  avatarText: { color: "#fff", fontSize: 36, fontFamily: "Inter_700Bold" },
  name: { color: "#fff", fontSize: 22, fontFamily: "Inter_700Bold", marginBottom: 4 },
  email: { color: "rgba(255,255,255,0.5)", fontSize: 14, fontFamily: "Inter_400Regular" },
  statsRow: { flexDirection: "row", gap: 12, marginTop: 20 },
  statCard: { flex: 1, borderRadius: 14, alignItems: "center", paddingVertical: 14 },
  statNum: { color: "#fff", fontSize: 22, fontFamily: "Inter_700Bold" },
  statLabel: { color: "rgba(255,255,255,0.5)", fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  section: { borderRadius: 16, paddingHorizontal: 16, paddingBottom: 4 },
  sectionLabel: { color: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1.2, paddingVertical: 10 },
  version: { color: "rgba(255,255,255,0.25)", fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "center", marginTop: 28 },
});
