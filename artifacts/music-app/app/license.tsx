import { Feather } from "@expo/vector-icons";
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

export default function LicenseScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 60 : insets.top;

  return (
    <ScreenBackground>
      <View style={[styles.header, { paddingTop: topPad + 16 }]}>
        <GlassIcon name="arrow-left" size={20} containerSize={42} onPress={() => router.back()} />
        <Text style={styles.title}>Music Licenses</Text>
        <View style={{ width: 42 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 160 }]}
        showsVerticalScrollIndicator={false}
      >
        <GlassCard style={styles.card} intensity={60} shine>
          <Text style={styles.heading}>Free To Use License</Text>
          <Text style={styles.body}>
            All music streamed through BeatStream is sourced from Free To Use (freetouse.com) and is made available by real independent artists under the Free To Use License.
          </Text>
        </GlassCard>

        <GlassCard style={[styles.card, { marginTop: 16 }]} intensity={60} shine>
          <Text style={styles.subheading}>What you can do</Text>
          <LicenseItem icon="check" text="Listen to music for personal enjoyment" />
          <LicenseItem icon="check" text="Use in non-commercial personal projects" />
          <LicenseItem icon="check" text="Share links to tracks with friends" />
          <LicenseItem icon="check" text="Download tracks for offline listening within the app" />
        </GlassCard>

        <GlassCard style={[styles.card, { marginTop: 16 }]} intensity={60} shine>
          <Text style={styles.subheading}>Restrictions</Text>
          <LicenseItem icon="x" text="Commercial use requires a paid license from freetouse.com" color="#EF4444" />
          <LicenseItem icon="x" text="Redistribution of audio files is not permitted" color="#EF4444" />
          <LicenseItem icon="x" text="Claiming ownership of any track is prohibited" color="#EF4444" />
          <LicenseItem icon="x" text="Removing artist credits is not allowed" color="#EF4444" />
        </GlassCard>

        <GlassCard style={[styles.card, { marginTop: 16 }]} intensity={60} shine>
          <Text style={styles.subheading}>Artist Attribution</Text>
          <Text style={styles.body}>
            All tracks are credited to their respective artists as provided by the Free To Use API. Artists retain full ownership of their work. BeatStream does not claim any rights to the music content.
          </Text>
        </GlassCard>

        <Pressable
          style={({ pressed }) => [styles.linkBtn, pressed && { opacity: 0.7 }]}
          onPress={() => Linking.openURL("https://freetouse.com/music-license").catch(() => {})}
        >
          <Text style={styles.linkText}>View full license on freetouse.com</Text>
          <Feather name="external-link" size={14} color="rgba(255,255,255,0.7)" />
        </Pressable>
      </ScrollView>
    </ScreenBackground>
  );
}

function LicenseItem({ icon, text, color }: {
  icon: React.ComponentProps<typeof Feather>["name"];
  text: string;
  color?: string;
}) {
  return (
    <View style={styles.licenseItem}>
      <Feather name={icon} size={14} color={color ?? "rgba(255,255,255,0.65)"} />
      <Text style={styles.licenseText}>{text}</Text>
    </View>
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
  card: { borderRadius: 18, paddingHorizontal: 16, paddingVertical: 16 },
  heading: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    marginBottom: 10,
  },
  subheading: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    marginBottom: 12,
  },
  body: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.6)",
    lineHeight: 22,
  },
  licenseItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingVertical: 7,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  licenseText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.65)",
    lineHeight: 20,
  },
  linkBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 20,
    padding: 14,
  },
  linkText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.65)",
  },
});
