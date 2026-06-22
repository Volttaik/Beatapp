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

const OSS_LIBS = [
  { name: "React Native", license: "MIT", author: "Meta Platforms, Inc." },
  { name: "Expo SDK", license: "MIT", author: "Expo Inc." },
  { name: "Expo Router", license: "MIT", author: "Expo Inc." },
  { name: "Expo AV", license: "MIT", author: "Expo Inc." },
  { name: "Expo Blur", license: "MIT", author: "Expo Inc." },
  { name: "Expo Image", license: "MIT", author: "Expo Inc." },
  { name: "Expo Image Picker", license: "MIT", author: "Expo Inc." },
  { name: "Expo File System", license: "MIT", author: "Expo Inc." },
  { name: "Expo Linear Gradient", license: "MIT", author: "Expo Inc." },
  { name: "Expo Haptics", license: "MIT", author: "Expo Inc." },
  { name: "@expo/vector-icons", license: "MIT", author: "Expo Inc." },
  { name: "@clerk/expo", license: "MIT", author: "Clerk Inc." },
  { name: "@tanstack/react-query", license: "MIT", author: "Tanner Linsley" },
  { name: "@react-native-async-storage/async-storage", license: "MIT", author: "React Native Community" },
  { name: "react-native-gesture-handler", license: "MIT", author: "Software Mansion" },
  { name: "react-native-reanimated", license: "MIT", author: "Software Mansion" },
  { name: "react-native-safe-area-context", license: "MIT", author: "th3rdwave" },
  { name: "react-native-screens", license: "MIT", author: "Software Mansion" },
  { name: "@expo-google-fonts/inter", license: "OFL-1.1", author: "Google Fonts / Rasmus Andersson" },
];

export default function OSSScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 60 : insets.top;

  return (
    <ScreenBackground>
      <View style={[styles.header, { paddingTop: topPad + 16 }]}>
        <GlassIcon name="arrow-left" size={20} containerSize={42} onPress={() => router.back()} />
        <Text style={styles.title}>Open Source</Text>
        <View style={{ width: 42 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 160 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.intro}>
          BeatStream is built on top of excellent open source libraries. We're grateful to all contributors.
        </Text>

        <GlassCard style={styles.card} intensity={60} shine>
          {OSS_LIBS.map((lib, i) => (
            <View key={lib.name} style={[styles.row, i === OSS_LIBS.length - 1 && { borderBottomWidth: 0 }]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.libName}>{lib.name}</Text>
                <Text style={styles.libAuthor}>{lib.author}</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{lib.license}</Text>
              </View>
            </View>
          ))}
        </GlassCard>
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
  content: { paddingHorizontal: 16, paddingTop: 8 },
  intro: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.5)",
    lineHeight: 22,
    marginBottom: 20,
    textAlign: "center",
    paddingHorizontal: 8,
  },
  card: { borderRadius: 18, paddingHorizontal: 14, paddingBottom: 4, overflow: "hidden" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.06)",
    gap: 12,
  },
  libName: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#fff", marginBottom: 2 },
  libAuthor: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.4)" },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: "rgba(124,58,237,0.2)",
    borderWidth: 1,
    borderColor: "rgba(167,139,250,0.25)",
  },
  badgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: "#A78BFA" },
});
