import { Audio } from "expo-av";
import { Platform } from "react-native";

let popSound: Audio.Sound | null = null;
let isLoading = false;

async function getPopSound(): Promise<Audio.Sound | null> {
  if (Platform.OS === "web") return null;
  if (popSound) return popSound;
  if (isLoading) return null;
  isLoading = true;
  try {
    const { sound } = await Audio.Sound.createAsync(
      require("../assets/pop.wav"),
      { volume: 0.35 }
    );
    popSound = sound;
    return sound;
  } catch {
    return null;
  } finally {
    isLoading = false;
  }
}

export async function playPopSound(): Promise<void> {
  try {
    const sound = await getPopSound();
    if (!sound) return;
    await sound.setPositionAsync(0);
    await sound.playAsync();
  } catch {
    // silent fail
  }
}
