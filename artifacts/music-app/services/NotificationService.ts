import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function setupNotifications(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  try {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("media", {
        name: "Now Playing",
        importance: Notifications.AndroidImportance.LOW,
        sound: null,
        vibrationPattern: null,
        enableVibrate: false,
        showBadge: false,
      });
      await Notifications.setNotificationChannelAsync("downloads", {
        name: "Downloads",
        importance: Notifications.AndroidImportance.DEFAULT,
        sound: null,
        vibrationPattern: null,
        enableVibrate: false,
        showBadge: false,
      });
    }
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === "granted") return true;
    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  } catch {
    return false;
  }
}

export async function showDownloadStartedNotification(title: string): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Downloading",
        body: `Saving "${title}" for offline playback`,
        data: { type: "download_start" },
        ...(Platform.OS === "android" ? { channelId: "downloads" } : {}),
      },
      trigger: null,
    });
  } catch {}
}

export async function showDownloadCompleteNotification(title: string, artist: string): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Download complete",
        body: `"${title}" by ${artist} is ready offline`,
        data: { type: "download_complete" },
        ...(Platform.OS === "android" ? { channelId: "downloads" } : {}),
      },
      trigger: null,
    });
  } catch {}
}

export async function showDownloadFailedNotification(title: string): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Download failed",
        body: `Could not save "${title}". Check your connection and try again.`,
        data: { type: "download_error" },
        ...(Platform.OS === "android" ? { channelId: "downloads" } : {}),
      },
      trigger: null,
    });
  } catch {}
}

let nowPlayingNotifId: string | null = null;

export async function updateNowPlayingNotification(title: string, artist: string): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    if (nowPlayingNotifId) {
      await Notifications.dismissNotificationAsync(nowPlayingNotifId).catch(() => {});
    }
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body: artist,
        data: { type: "now_playing" },
        sticky: Platform.OS === "android",
        ...(Platform.OS === "android" ? {
          channelId: "media",
          priority: "low",
        } : {}),
      },
      trigger: null,
    });
    nowPlayingNotifId = id;
  } catch {}
}

export async function dismissNowPlayingNotification(): Promise<void> {
  if (!nowPlayingNotifId) return;
  try {
    await Notifications.dismissNotificationAsync(nowPlayingNotifId);
    nowPlayingNotifId = null;
  } catch {}
}
