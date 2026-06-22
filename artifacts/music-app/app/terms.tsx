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

export default function TermsScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 60 : insets.top;

  return (
    <ScreenBackground>
      <View style={[styles.header, { paddingTop: topPad + 16 }]}>
        <GlassIcon name="arrow-left" size={20} containerSize={42} onPress={() => router.back()} />
        <Text style={styles.title}>Terms of Service</Text>
        <View style={{ width: 42 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 160 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.lastUpdated}>Last updated: June 2026</Text>

        <Section title="Acceptance of terms">
          {"By using BeatStream, you agree to these Terms of Service. If you do not agree, please uninstall the application and discontinue use."}
        </Section>

        <View style={{ height: 12 }} />

        <Section title="Use of the service">
          {"BeatStream is provided for personal, non-commercial listening purposes only. You may not use the app to reproduce, distribute, or publicly perform the music content without the appropriate license from the rights holders."}
        </Section>

        <View style={{ height: 12 }} />

        <Section title="Music content">
          {"All music is sourced from Free To Use (freetouse.com). BeatStream acts solely as a front-end client. The music is subject to the Free To Use License and you are responsible for complying with those terms."}
        </Section>

        <View style={{ height: 12 }} />

        <Section title="User accounts">
          {"If you create an account, you are responsible for maintaining the confidentiality of your credentials. You agree not to use another user's account without permission."}
        </Section>

        <View style={{ height: 12 }} />

        <Section title="Prohibited activities">
          {"You may not: reverse engineer the application, use it to infringe any intellectual property rights, attempt to gain unauthorized access to any service or system, or use it in any way that violates applicable laws."}
        </Section>

        <View style={{ height: 12 }} />

        <Section title="Disclaimer">
          {"BeatStream is provided \"as is\" without warranties of any kind. We do not guarantee uninterrupted access to music or any specific features. Music availability depends on the Free To Use API."}
        </Section>

        <View style={{ height: 12 }} />

        <Section title="Changes to terms">
          {"We reserve the right to modify these terms at any time. Continued use of the app after changes constitutes acceptance of the new terms."}
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
