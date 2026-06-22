import { Image } from "expo-image";
import React, { memo } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface AlbumCardProps {
  title: string;
  subtitle?: string;
  imageUrl: string;
  onPress: () => void;
  width?: number;
}

const AlbumCard = memo(function AlbumCard({
  title,
  subtitle,
  imageUrl,
  onPress,
  width = 150,
}: AlbumCardProps) {
  const colors = useColors();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        { width, opacity: pressed ? 0.75 : 1 },
      ]}
      onPress={onPress}
    >
      <Image
        source={imageUrl}
        style={[styles.image, { width, height: width, borderRadius: 10 }]}
        contentFit="cover"
      />
      <Text
        style={[styles.title, { color: colors.foreground }]}
        numberOfLines={1}
      >
        {title}
      </Text>
      {subtitle ? (
        <Text
          style={[styles.subtitle, { color: colors.mutedForeground }]}
          numberOfLines={1}
        >
          {subtitle}
        </Text>
      ) : null}
    </Pressable>
  );
});

export default AlbumCard;

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  image: {
    backgroundColor: "#1C1C2A",
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "Inter_600SemiBold" : undefined,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: Platform.OS === "ios" ? "Inter_400Regular" : undefined,
  },
});
