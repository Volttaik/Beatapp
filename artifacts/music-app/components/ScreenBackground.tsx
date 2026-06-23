import React from "react";
import { StyleSheet, View } from "react-native";

interface ScreenBackgroundProps {
  children: React.ReactNode;
}

export default function ScreenBackground({ children }: ScreenBackgroundProps) {
  return (
    <View style={styles.container}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
});
