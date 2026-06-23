import { Platform } from "react-native";

let Notifications: any = null;
try {
  Notifications = require("expo-notifications");
} catch {}

export async function setupNotifications(): Promise<boolean> {
  if (!Notifications || Platform.OS === "web") return false;
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });

    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === "granted") return true;

    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  } catch {
    return false;
  }
}

export async function showDownloadStartedNotification(title: string): Promise<void> {
  if (!Notifications || Platform.OS === "web") return;
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Downloading",
        body: `"${title}" is being saved for offline playback`,
        data: { type: "download_start" },
      },
      trigger: null,
    });
  } catch {}
}

export async function showDownloadCompleteNotification(title: string, artist: string): Promise<void> {
  if (!Notifications || Platform.OS === "web") return;
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Download complete",
        body: `"${title}" by ${artist} is ready to play offline`,
        data: { type: "download_complete" },
      },
      trigger: null,
    });
  } catch {}
}

export async function showDownloadFailedNotification(title: string): Promise<void> {
  if (!Notifications || Platform.OS === "web") return;
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Download failed",
        body: `Could not save "${title}". Check your connection and try again.`,
        data: { type: "download_error" },
      },
      trigger: null,
    });
  } catch {}
}

let nowPlayingNotifId: string | null = null;

export async function updateNowPlayingNotification(title: string, artist: string): Promise<void> {
  if (!Notifications || Platform.OS === "web") return;
  try {
    if (nowPlayingNotifId) {
      await Notifications.dismissNotificationAsync(nowPlayingNotifId).catch(() => {});
    }
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: "🎵 Now Playing",
        body: `${title} · ${artist}`,
        sticky: true,
        data: { type: "now_playing" },
      },
      trigger: null,
    });
    nowPlayingNotifId = id;
  } catch {}
}

export async function dismissNowPlayingNotification(): Promise<void> {
  if (!Notifications || !nowPlayingNotifId) return;
  try {
    await Notifications.dismissNotificationAsync(nowPlayingNotifId);
    nowPlayingNotifId = null;
  } catch {}
}
