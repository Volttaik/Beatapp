import React from "react";
import { ImageBackground, StyleSheet, View } from "react-native";

interface ScreenBackgroundProps {
  children: React.ReactNode;
  accent?: string;
}

const earthBg = require("../assets/images/earth-bg.jpg");

export default function ScreenBackground({ children }: ScreenBackgroundProps) {
  return (
    <View style={styles.container}>
      <ImageBackground
        source={earthBg}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />
      <View style={styles.overlay} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(2,4,12,0.78)",
  },
});
