import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

import GlassCard from "@/components/GlassCard";
import GlassIcon from "@/components/GlassIcon";
import ScreenBackground from "@/components/ScreenBackground";

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
  icon: React.ComponentProps<typeof Feather>["name"];
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
      <GlassIcon
        name={icon}
        size={16}
        containerSize={36}
        borderRadius={11}
        active={danger}
        color={danger ? "rgba(239,68,68,0.9)" : "rgba(255,255,255,0.75)"}
      />
      <View style={styles.settingInfo}>
        <Text style={[styles.settingLabel, danger && { color: "#EF4444" }]}>{label}</Text>
        {subtitle ? <Text style={styles.settingSubtitle}>{subtitle}</Text> : null}
      </View>
      {onToggle !== undefined && value !== undefined ? (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: "rgba(255,255,255,0.08)", true: "rgba(124,58,237,0.55)" }}
          thumbColor={value ? "#A78BFA" : "rgba(255,255,255,0.35)"}
          ios_backgroundColor="rgba(255,255,255,0.08)"
        />
      ) : showChevron ? (
        <Feather name="chevron-right" size={16} color="rgba(255,255,255,0.18)" />
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
  const topPad = Platform.OS === "web" ? 60 : insets.top;

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
    <ScreenBackground>
      <View style={[styles.header, { paddingTop: topPad + 16 }]}>
        <GlassIcon name="arrow-left" size={20} containerSize={42} onPress={() => router.back()} />
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 42 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 140 }]}
        showsVerticalScrollIndicator={false}
      >
        <SectionHeader title="AUDIO" />
        <GlassCard style={styles.card} intensity={60} shine>
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
        <GlassCard style={styles.card} intensity={60} shine>
          <SettingRow
            icon="bell"
            label="Push Notifications"
            subtitle="New music and updates"
            value={settings.notifications}
            onToggle={(v) => updateSetting("notifications", v)}
          />
        </GlassCard>

        <SectionHeader title="PRIVACY" />
        <GlassCard style={styles.card} intensity={60} shine>
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
        <GlassCard style={styles.card} intensity={60} shine>
          <SettingRow
            icon="info"
            label="Version"
            subtitle="BeatStream 1.0.0"
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
  sectionHeader: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: "rgba(255,255,255,0.35)",
    letterSpacing: 1.2,
    marginTop: 24,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  card: {
    borderRadius: 18,
    overflow: "hidden",
    paddingHorizontal: 14,
    paddingBottom: 4,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    gap: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  settingInfo: { flex: 1 },
  settingLabel: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    color: "#fff",
  },
  settingSubtitle: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.38)",
    marginTop: 2,
  },
});
