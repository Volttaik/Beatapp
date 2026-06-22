import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React, { useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { usePlaylists } from "@/contexts/PlaylistContext";

export default function CreatePlaylistScreen() {
  const insets = useSafeAreaInsets();
  const { createPlaylist } = usePlaylists();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const descRef = useRef<TextInput>(null);

  const handleCreate = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert("Name required", "Please enter a playlist name.");
      return;
    }
    const playlist = createPlaylist(trimmed, description.trim());
    router.back();
    setTimeout(() => {
      router.push(`/playlist/${playlist.id}` as any);
    }, 100);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#1C0A3A", "#08080F"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.5 }}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Feather name="x" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.title}>New Playlist</Text>
          <Pressable
            onPress={handleCreate}
            style={[styles.createBtn, !name.trim() && styles.createBtnDisabled]}
            disabled={!name.trim()}
          >
            <Text style={styles.createBtnText}>Create</Text>
          </Pressable>
        </View>

        <View style={styles.content}>
          {/* Playlist art placeholder */}
          <View style={styles.artworkPlaceholder}>
            <Feather name="music" size={48} color="rgba(167,139,250,0.5)" />
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Playlist Name</Text>
              <TextInput
                style={styles.input}
                placeholder="My Playlist"
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={name}
                onChangeText={setName}
                returnKeyType="next"
                onSubmitEditing={() => descRef.current?.focus()}
                autoFocus
                maxLength={60}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description (optional)</Text>
              <TextInput
                ref={descRef}
                style={[styles.input, styles.textArea]}
                placeholder="Add a description..."
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={description}
                onChangeText={setDescription}
                returnKeyType="done"
                multiline
                numberOfLines={3}
                maxLength={200}
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    paddingBottom: 16,
  },
  title: { fontSize: 17, fontFamily: "Inter_700Bold", color: "#fff" },
  createBtn: {
    backgroundColor: "#7C3AED",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createBtnDisabled: { opacity: 0.4 },
  createBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#fff" },
  content: { flex: 1, alignItems: "center", paddingHorizontal: 24, paddingTop: 32 },
  artworkPlaceholder: {
    width: 160,
    height: 160,
    borderRadius: 16,
    backgroundColor: "#1C1C2A",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  form: { width: "100%", gap: 20 },
  inputGroup: { gap: 8 },
  inputLabel: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: "rgba(255,255,255,0.5)",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: "#fff",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
});
