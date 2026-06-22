import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

import GlassCard from "@/components/GlassCard";

const SETTINGS_KEY = "beatstream_settings";

interface AppSettings {
  gaplessPlayback: boolean;
  crossfade: boolean;
  highQuality: boolean;
  notifications: boolean;
  autoPlay: boolean;
}

const defaultSettings: AppSettings = {
  gaplessPlayback: false,
  crossfade: false,
  highQuality: true,
  notifications: true,
  autoPlay: true,
};

function SettingRow({
  icon,
  label,
  subtitle,
  value,
  onToggle,
  onPress,
  danger,
  showChevron,
}: {
  icon: string;
  label: string;
  subtitle?: string;
  value?: boolean;
  onToggle?: (v: boolean) => void;
  onPress?: () => void;
  danger?: boolean;
  showChevron?: boolean;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.settingRow, pressed && onPress && { opacity: 0.65 }]}
      onPress={onPress}
      disabled={!onPress && !onToggle}
    >
      <View style={[styles.iconBox, { backgroundColor: danger ? "rgba(239,68,68,0.15)" : "rgba(124,58,237,0.15)" }]}>
        <Feather name={icon as any} size={18} color={danger ? "#EF4444" : "#A78BFA"} />
      </View>
      <View style={styles.settingInfo}>
        <Text style={[styles.settingLabel, { color: danger ? "#EF4444" : "#fff" }]}>{label}</Text>
        {subtitle ? <Text style={styles.settingSubtitle}>{subtitle}</Text> : null}
      </View>
      {onToggle !== undefined && value !== undefined ? (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: "#2A2A3A", true: "#7C3AED" }}
          thumbColor={value ? "#A78BFA" : "#666680"}
        />
      ) : showChevron ? (
        <Feather name="chevron-right" size={18} color="rgba(255,255,255,0.3)" />
      ) : null}
    </Pressable>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  useEffect(() => {
    AsyncStorage.getItem(SETTINGS_KEY).then((data) => {
      if (data) setSettings({ ...defaultSettings, ...JSON.parse(data) });
    });
  }, []);

  const updateSetting = (key: keyof AppSettings, value: boolean) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated)).catch(() => {});
  };

  const clearSearchHistory = () => {
    Alert.alert("Clear Search History", "This will remove all your recent searches.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: () => {
          AsyncStorage.removeItem("beatstream_search_history").catch(() => {});
          Alert.alert("Done", "Search history cleared.");
        },
      },
    ]);
  };

  const clearRecentlyPlayed = () => {
    Alert.alert("Clear Recently Played", "This will remove your listening history.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: () => {
          AsyncStorage.removeItem("recently_played").catch(() => {});
          Alert.alert("Done", "Recently played cleared.");
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#1A0840", "#08080F"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.4 }}
      />

      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <SectionHeader title="AUDIO" />
        <GlassCard style={styles.card} intensity={30}>
          <SettingRow
            icon="zap"
            label="High Quality Streaming"
            subtitle="Uses more data"
            value={settings.highQuality}
            onToggle={(v) => updateSetting("highQuality", v)}
          />
          <SettingRow
            icon="skip-forward"
            label="Gapless Playback"
            subtitle="No silence between tracks"
            value={settings.gaplessPlayback}
            onToggle={(v) => updateSetting("gaplessPlayback", v)}
          />
          <SettingRow
            icon="sliders"
            label="Crossfade"
            subtitle="Blend between songs"
            value={settings.crossfade}
            onToggle={(v) => updateSetting("crossfade", v)}
          />
          <SettingRow
            icon="play-circle"
            label="Autoplay"
            subtitle="Continue playing similar songs"
            value={settings.autoPlay}
            onToggle={(v) => updateSetting("autoPlay", v)}
          />
        </GlassCard>

        <SectionHeader title="NOTIFICATIONS" />
        <GlassCard style={styles.card} intensity={30}>
          <SettingRow
            icon="bell"
            label="Push Notifications"
            subtitle="New music and updates"
            value={settings.notifications}
            onToggle={(v) => updateSetting("notifications", v)}
          />
        </GlassCard>

        <SectionHeader title="PRIVACY" />
        <GlassCard style={styles.card} intensity={30}>
          <SettingRow
            icon="clock"
            label="Clear Listening History"
            subtitle="Remove recently played tracks"
            onPress={clearRecentlyPlayed}
            showChevron
          />
          <SettingRow
            icon="search"
            label="Clear Search History"
            subtitle="Remove all recent searches"
            onPress={clearSearchHistory}
            showChevron
          />
        </GlassCard>

        <SectionHeader title="ABOUT" />
        <GlassCard style={styles.card} intensity={30}>
          <SettingRow
            icon="info"
            label="Version"
            subtitle="Beatstream 1.0.0"
            showChevron={false}
          />
          <SettingRow
            icon="shield"
            label="Privacy Policy"
            showChevron
            onPress={() => {}}
          />
          <SettingRow
            icon="file-text"
            label="Terms of Service"
            showChevron
            onPress={() => {}}
          />
          <SettingRow
            icon="github"
            label="Open Source Licenses"
            showChevron
            onPress={() => {}}
          />
        </GlassCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#08080F" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  title: { fontSize: 17, fontFamily: "Inter_700Bold", color: "#fff" },
  content: { paddingHorizontal: 16, paddingTop: 8 },
  sectionHeader: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: "rgba(255,255,255,0.4)",
    letterSpacing: 1.2,
    marginTop: 24,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  card: { borderRadius: 16, overflow: "hidden" },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.07)",
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  settingInfo: { flex: 1 },
  settingLabel: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  settingSubtitle: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.4)",
    marginTop: 2,
  },
});
