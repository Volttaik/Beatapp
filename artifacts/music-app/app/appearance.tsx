import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React, { useState } from "react";
import {
  Alert,
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
import {
  useAppearance,
  WALLPAPERS,
  WallpaperOption,
} from "@/contexts/AppearanceContext";

const earthBg = require("../assets/images/earth-bg.jpg");

function WallpaperPreview({ wallpaper, selected, onSelect }: {
  wallpaper: WallpaperOption;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <Pressable
      onPress={onSelect}
      style={({ pressed }) => [wp.item, pressed && { opacity: 0.8 }]}
    >
      <View style={[wp.preview, selected && wp.previewSelected]}>
        {wallpaper.type === "image" ? (
          <>
            <Image source={earthBg} style={StyleSheet.absoluteFill} contentFit="cover" />
            <View style={[StyleSheet.absoluteFill, { backgroundColor: wallpaper.overlay ?? "rgba(2,4,12,0.78)" }]} />
          </>
        ) : (
          <>
            <LinearGradient
              colors={(wallpaper.colors ?? ["#020205", "#06060f"]) as [string, string, ...string[]]}
              style={StyleSheet.absoluteFill}
              start={{ x: 0.3, y: 0 }}
              end={{ x: 0.7, y: 1 }}
            />
            <View style={[StyleSheet.absoluteFill, { backgroundColor: wallpaper.overlay ?? "rgba(0,0,4,0.65)" }]} />
          </>
        )}

        {/* Mini music UI mockup */}
        <View style={wp.miniUi}>
          <View style={wp.miniBar} />
          <View style={[wp.miniBar, { width: "60%", opacity: 0.5 }]} />
        </View>

        {selected && (
          <View style={wp.checkCircle}>
            <Feather name="check" size={12} color="#fff" />
          </View>
        )}
      </View>
      <Text style={[wp.label, selected && wp.labelSelected]}>{wallpaper.name}</Text>
    </Pressable>
  );
}

const wp = StyleSheet.create({
  item: { width: "47%" },
  preview: {
    height: 120,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.08)",
    justifyContent: "flex-end",
    padding: 10,
    marginBottom: 8,
  },
  previewSelected: {
    borderColor: "#A78BFA",
    borderWidth: 2,
  },
  miniUi: { gap: 6 },
  miniBar: {
    height: 4,
    width: "80%",
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  checkCircle: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#7C3AED",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.55)",
    textAlign: "center",
  },
  labelSelected: {
    color: "#A78BFA",
    fontFamily: "Inter_600SemiBold",
  },
});

export default function AppearanceScreen() {
  const insets = useSafeAreaInsets();
  const { wallpaper, setWallpaper, profilePicture, setProfilePicture } = useAppearance();
  const [pickingImage, setPickingImage] = useState(false);
  const topPad = Platform.OS === "web" ? 60 : insets.top;

  const handlePickProfilePicture = async () => {
    if (pickingImage) return;
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Please allow access to your photo library.");
        return;
      }
      setPickingImage(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.[0]?.uri) {
        setProfilePicture(result.assets[0].uri);
      }
    } catch {
      Alert.alert("Error", "Could not open photo library.");
    } finally {
      setPickingImage(false);
    }
  };

  return (
    <ScreenBackground>
      <View style={[styles.header, { paddingTop: topPad + 16 }]}>
        <GlassIcon name="arrow-left" size={20} containerSize={42} onPress={() => router.back()} />
        <Text style={styles.title}>Appearance</Text>
        <View style={{ width: 42 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 160 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Picture */}
        <Text style={styles.sectionHeader}>PROFILE PICTURE</Text>
        <GlassCard style={styles.profileCard} intensity={60} shine>
          <View style={styles.profileRow}>
            <Pressable onPress={handlePickProfilePicture} style={styles.profilePicWrapper}>
              {profilePicture ? (
                <Image source={profilePicture} style={styles.profilePic} contentFit="cover" />
              ) : (
                <View style={styles.profilePicPlaceholder}>
                  <Feather name="user" size={28} color="rgba(255,255,255,0.3)" />
                </View>
              )}
              <View style={styles.profileEditBadge}>
                <Feather name="camera" size={11} color="#fff" />
              </View>
            </Pressable>
            <View style={{ flex: 1 }}>
              <Text style={styles.profileLabel}>
                {profilePicture ? "Profile photo set" : "No profile photo"}
              </Text>
              <Text style={styles.profileSub}>
                {profilePicture ? "Tap photo to change" : "Tap to choose from library"}
              </Text>
            </View>
            {profilePicture && (
              <GlassIcon
                name="x"
                size={14}
                containerSize={32}
                onPress={() => {
                  Alert.alert("Remove Photo", "Remove your profile picture?", [
                    { text: "Cancel", style: "cancel" },
                    { text: "Remove", style: "destructive", onPress: () => setProfilePicture(null) },
                  ]);
                }}
              />
            )}
          </View>
        </GlassCard>

        {/* Wallpaper */}
        <Text style={styles.sectionHeader}>APP WALLPAPER</Text>
        <View style={styles.wallpaperGrid}>
          {WALLPAPERS.map((w) => (
            <WallpaperPreview
              key={w.id}
              wallpaper={w}
              selected={wallpaper.id === w.id}
              onSelect={() => setWallpaper(w)}
            />
          ))}
        </View>
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
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  profileCard: {
    borderRadius: 18,
    overflow: "hidden",
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  profilePicWrapper: { position: "relative" },
  profilePic: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
  },
  profilePicPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  profileEditBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#7C3AED",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "rgba(2,4,12,0.9)",
  },
  profileLabel: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#fff", marginBottom: 3 },
  profileSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.4)" },
  wallpaperGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
});
