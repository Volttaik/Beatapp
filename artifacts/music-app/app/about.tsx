import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React from "react";
import {
  Linking,
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

const logo = require("../assets/images/beatstream-logo.png");

export default function AboutScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 60 : insets.top;

  return (
    <ScreenBackground>
      <View style={[styles.header, { paddingTop: topPad + 16 }]}>
        <GlassIcon name="arrow-left" size={20} containerSize={42} onPress={() => router.back()} />
        <Text style={styles.title}>About BeatStream</Text>
        <View style={{ width: 42 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 160 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Image source={logo} style={styles.logo} contentFit="contain" />
          <Text style={styles.appName}>BeatStream</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>

        <GlassCard style={styles.card} intensity={60} shine>
          <Text style={styles.body}>
            BeatStream is a free music streaming app powered by the Free To Use API — a library of royalty-free music made by real independent artists. Stream, search, download, and enjoy music completely free.
          </Text>
        </GlassCard>

        <View style={{ height: 14 }} />

        <GlassCard style={styles.card} intensity={60} shine>
          <InfoRow icon="music" label="Music Source" value="Free To Use (freetouse.com)" />
          <InfoRow icon="users" label="Artists" value="1,000+ independent creators" />
          <InfoRow icon="headphones" label="Tracks" value="1,400+ royalty-free tracks" />
          <InfoRow icon="download" label="Downloads" value="Offline listening supported" />
          <InfoRow icon="lock" label="Privacy" value="Local-first, no data sold" />
        </GlassCard>

        <View style={{ height: 14 }} />

        <GlassCard style={styles.linksCard} intensity={60} shine>
          <LinkRow
            icon="shield"
            label="Privacy Policy"
            onPress={() => router.push("/privacy" as any)}
          />
          <LinkRow
            icon="file-text"
            label="Terms of Service"
            onPress={() => router.push("/terms" as any)}
          />
          <LinkRow
            icon="book"
            label="Music Licenses"
            onPress={() => router.push("/license" as any)}
          />
          <LinkRow
            icon="github"
            label="Open Source Libraries"
            onPress={() => router.push("/oss" as any)}
          />
          <LinkRow
            icon="external-link"
            label="Free To Use Website"
            onPress={() => Linking.openURL("https://freetouse.com").catch(() => {})}
          />
        </GlassCard>

        <Text style={styles.footer}>Made with ♪ · BeatStream v1.0</Text>
      </ScrollView>
    </ScreenBackground>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ComponentProps<typeof Feather>["name"]; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Feather name={icon} size={14} color="rgba(167,139,250,0.8)" />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function LinkRow({ icon, label, onPress }: { icon: React.ComponentProps<typeof Feather>["name"]; label: string; onPress: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.linkRow, pressed && { opacity: 0.65 }]}
      onPress={onPress}
    >
      <Feather name={icon} size={15} color="rgba(255,255,255,0.55)" />
      <Text style={styles.linkLabel}>{label}</Text>
      <Feather name="chevron-right" size={15} color="rgba(255,255,255,0.2)" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  title: { fontSize: 17, fontFamily: "Inter_700Bold", color: "#fff" },
  content: { paddingHorizontal: 16, paddingTop: 8 },
  hero: { alignItems: "center", marginBottom: 28, paddingVertical: 16 },
  logo: { width: 80, height: 80, borderRadius: 20, marginBottom: 14 },
  appName: { fontSize: 28, fontFamily: "Inter_700Bold", color: "#fff", marginBottom: 4 },
  version: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.35)" },
  card: { borderRadius: 18, paddingHorizontal: 16, paddingVertical: 16 },
  body: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.6)",
    lineHeight: 22,
    textAlign: "center",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  infoLabel: { flex: 1, fontSize: 14, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.6)" },
  infoValue: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.4)", maxWidth: "50%", textAlign: "right" },
  linksCard: { borderRadius: 18, paddingHorizontal: 14, paddingBottom: 4, overflow: "hidden" },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  linkLabel: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular", color: "#fff" },
  footer: {
    color: "rgba(255,255,255,0.18)",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginTop: 24,
    marginBottom: 8,
  },
});
