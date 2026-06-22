import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, View } from "react-native";

interface ScreenBackgroundProps {
  children: React.ReactNode;
  accent?: string;
}

export default function ScreenBackground({ children, accent = "#3B0764" }: ScreenBackgroundProps) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#0A0A18", accent, "#050508"]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />
      {/* Subtle radial glow top-right */}
      <View style={[styles.glow, { backgroundColor: accent }]} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#080810",
  },
  glow: {
    position: "absolute",
    top: -120,
    right: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.18,
  },
});
