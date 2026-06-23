import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import * as Haptics from "expo-haptics";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Track, isYTMusicTrack, getYTMusicVideoId, getYTMusicDownloadUrl } from "@/data/tracks";
import {
  showDownloadCompleteNotification,
  showDownloadFailedNotification,
  showDownloadStartedNotification,
  setupNotifications,
} from "@/services/NotificationService";

export interface DownloadedTrack extends Track {
  localUri: string;
  downloadedAt: number;
}

export type DownloadStatus = "idle" | "downloading" | "done" | "error";

interface DownloadProgress {
  status: DownloadStatus;
  progress: number;
}

interface DownloadContextType {
  downloads: DownloadedTrack[];
  downloadProgress: Record<string, DownloadProgress>;
  isDownloaded: (id: string) => boolean;
  getLocalUri: (id: string) => string | null;
  downloadTrack: (track: Track) => Promise<void>;
  deleteDownload: (id: string) => Promise<void>;
}

const DownloadContext = createContext<DownloadContextType | null>(null);
const DOWNLOADS_KEY = "beatstream_downloads";
const DOWNLOAD_DIR = FileSystem.documentDirectory + "downloads/";

async function ensureDir() {
  const info = await FileSystem.getInfoAsync(DOWNLOAD_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(DOWNLOAD_DIR, { intermediates: true });
  }
}

function resolveDownloadUrl(track: Track): string | null {
  if (isYTMusicTrack(track)) {
    const videoId = getYTMusicVideoId(track);
    if (!videoId) return null;
    return getYTMusicDownloadUrl(videoId);
  }
  return track.audioUrl ?? null;
}

export function DownloadProvider({ children }: { children: React.ReactNode }) {
  const [downloads, setDownloads] = useState<DownloadedTrack[]>([]);
  const [downloadProgress, setDownloadProgress] = useState<
    Record<string, DownloadProgress>
  >({});

  useEffect(() => {
    setupNotifications().catch(() => {});

    AsyncStorage.getItem(DOWNLOADS_KEY).then((data) => {
      if (data) {
        const parsed: DownloadedTrack[] = JSON.parse(data);
        Promise.all(
          parsed.map(async (d) => {
            const info = await FileSystem.getInfoAsync(d.localUri);
            return info.exists ? d : null;
          })
        ).then((results) => {
          const valid = results.filter(Boolean) as DownloadedTrack[];
          setDownloads(valid);
          if (valid.length !== parsed.length) {
            AsyncStorage.setItem(DOWNLOADS_KEY, JSON.stringify(valid)).catch(() => {});
          }
        });
      }
    });
  }, []);

  const isDownloaded = useCallback(
    (id: string) => downloads.some((d) => d.id === id),
    [downloads]
  );

  const getLocalUri = useCallback(
    (id: string) => downloads.find((d) => d.id === id)?.localUri ?? null,
    [downloads]
  );

  const downloadTrack = useCallback(
    async (track: Track) => {
      if (
        isDownloaded(track.id) ||
        downloadProgress[track.id]?.status === "downloading"
      )
        return;

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setDownloadProgress((prev) => ({
        ...prev,
        [track.id]: { status: "downloading", progress: 0 },
      }));

      showDownloadStartedNotification(track.title).catch(() => {});

      try {
        await ensureDir();

        const downloadUrl = resolveDownloadUrl(track);
        if (!downloadUrl) {
          throw new Error("Could not resolve download URL");
        }

        const ext = isYTMusicTrack(track) ? "m4a" : "mp3";
        const localUri = `${DOWNLOAD_DIR}${track.id}.${ext}`;

        const existingInfo = await FileSystem.getInfoAsync(localUri);
        if (existingInfo.exists) {
          await FileSystem.deleteAsync(localUri, { idempotent: true });
        }

        const callback = (dp: FileSystem.DownloadProgressData) => {
          const ratio =
            dp.totalBytesExpectedToWrite > 0
              ? dp.totalBytesWritten / dp.totalBytesExpectedToWrite
              : 0;
          setDownloadProgress((prev) => ({
            ...prev,
            [track.id]: { status: "downloading", progress: ratio },
          }));
        };

        const downloadResumable = FileSystem.createDownloadResumable(
          downloadUrl,
          localUri,
          {
            headers: {
              "User-Agent": "Mozilla/5.0 (compatible; BeatStream/1.0)",
            },
          },
          callback
        );

        const result = await downloadResumable.downloadAsync();
        if (!result || !result.uri) throw new Error("Download failed — no result URI");

        const fileInfo = await FileSystem.getInfoAsync(result.uri);
        if (!fileInfo.exists || (fileInfo as any).size === 0) {
          throw new Error("Downloaded file is empty or missing");
        }

        const downloadedTrack: DownloadedTrack = {
          ...track,
          localUri: result.uri,
          downloadedAt: Date.now(),
        };

        setDownloads((prev) => {
          const updated = [downloadedTrack, ...prev.filter((d) => d.id !== track.id)];
          AsyncStorage.setItem(DOWNLOADS_KEY, JSON.stringify(updated)).catch(() => {});
          return updated;
        });

        setDownloadProgress((prev) => ({
          ...prev,
          [track.id]: { status: "done", progress: 1 },
        }));

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showDownloadCompleteNotification(track.title, track.artist).catch(() => {});
      } catch (err) {
        setDownloadProgress((prev) => ({
          ...prev,
          [track.id]: { status: "error", progress: 0 },
        }));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
        showDownloadFailedNotification(track.title).catch(() => {});
      }
    },
    [isDownloaded, downloadProgress]
  );

  const deleteDownload = useCallback(
    async (id: string) => {
      const track = downloads.find((d) => d.id === id);
      if (!track) return;

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      try {
        const info = await FileSystem.getInfoAsync(track.localUri);
        if (info.exists) await FileSystem.deleteAsync(track.localUri, { idempotent: true });
      } catch {}

      setDownloads((prev) => {
        const updated = prev.filter((d) => d.id !== id);
        AsyncStorage.setItem(DOWNLOADS_KEY, JSON.stringify(updated)).catch(() => {});
        return updated;
      });

      setDownloadProgress((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    },
    [downloads]
  );

  return (
    <DownloadContext.Provider
      value={{
        downloads,
        downloadProgress,
        isDownloaded,
        getLocalUri,
        downloadTrack,
        deleteDownload,
      }}
    >
      {children}
    </DownloadContext.Provider>
  );
}

export function useDownloads() {
  const ctx = useContext(DownloadContext);
  if (!ctx) throw new Error("useDownloads must be used within DownloadProvider");
  return ctx;
}
