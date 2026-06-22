import React from "react";
import { ImageBackground, StyleSheet, View } from "react-native";

const planetBg = require("../assets/images/planet-bg.jpg");

interface ScreenBackgroundProps {
  children: React.ReactNode;
}

export default function ScreenBackground({ children }: ScreenBackgroundProps) {
  return (
    <ImageBackground source={planetBg} style={styles.container} resizeMode="cover">
      <View style={styles.overlay}>{children}</View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
});
