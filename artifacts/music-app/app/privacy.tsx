import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import GlassCard from "@/components/GlassCard";
import GlassIcon from "@/components/GlassIcon";
import ScreenBackground from "@/components/ScreenBackground";

function Section({ title, children }: { title: string; children: string }) {
  return (
    <GlassCard style={styles.card} intensity={60} shine>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.body}>{children}</Text>
    </GlassCard>
  );
}

export default function PrivacyScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 60 : insets.top;

  return (
    <ScreenBackground>
      <View style={[styles.header, { paddingTop: topPad + 16 }]}>
        <GlassIcon name="arrow-left" size={20} containerSize={42} onPress={() => router.back()} />
        <Text style={styles.title}>Privacy Policy</Text>
        <View style={{ width: 42 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 160 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.lastUpdated}>Last updated: June 2026</Text>

        <Section title="What we collect">
          {"BeatStream stores your music preferences, playlists, liked songs, and listening history locally on your device using AsyncStorage. No personal data is sent to external servers beyond what is required for authentication (if enabled) and music streaming."}
        </Section>

        <View style={{ height: 12 }} />

        <Section title="Authentication">
          {"If you sign in with Clerk, your email address and account information are managed by Clerk Inc. We only use this to personalize your experience within the app. We do not sell or share your authentication data."}
        </Section>

        <View style={{ height: 12 }} />

        <Section title="Music streaming">
          {"Music is streamed directly from Free To Use (freetouse.com). When you search or play tracks, requests are made to their servers. Please review Free To Use's privacy policy for details on how they handle data."}
        </Section>

        <View style={{ height: 12 }} />

        <Section title="Profile picture">
          {"Your profile picture is stored locally on your device only. It is never uploaded to any server."}
        </Section>

        <View style={{ height: 12 }} />

        <Section title="Downloads">
          {"Downloaded tracks are stored in your device's local storage. They are only accessible within BeatStream and are never shared with third parties."}
        </Section>

        <View style={{ height: 12 }} />

        <Section title="Contact">
          {"If you have questions about your privacy, please reach out through the app's support channel."}
        </Section>
      </ScrollView>
    </ScreenBackground>
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
  content: { paddingHorizontal: 16, paddingTop: 4 },
  lastUpdated: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.3)",
    textAlign: "center",
    marginBottom: 20,
    marginTop: 8,
  },
  card: { borderRadius: 18, paddingHorizontal: 16, paddingVertical: 16 },
  sectionTitle: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    marginBottom: 8,
  },
  body: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.6)",
    lineHeight: 22,
  },
});
