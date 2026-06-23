import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio, AVPlaybackStatus } from "expo-av";
import * as Haptics from "expo-haptics";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Platform } from "react-native";
import { Track, fetchYTMusicStreamUrl, isYTMusicTrack, getYTMusicVideoId } from "@/data/tracks";
import {
  updateNowPlayingNotification,
  dismissNowPlayingNotification,
  setupNotifications,
} from "@/services/NotificationService";

interface PlayerContextType {
  currentTrack: Track | null;
  queue: Track[];
  isPlaying: boolean;
  position: number;
  duration: number;
  isLoading: boolean;
  playbackError: string | null;
  playTrack: (track: Track, queue?: Track[], localUri?: string) => Promise<void>;
  togglePlayPause: () => Promise<void>;
  playNext: () => Promise<void>;
  playPrev: () => Promise<void>;
  seekTo: (millis: number) => Promise<void>;
  addToQueue: (track: Track) => void;
  clearQueue: () => void;
  isShuffled: boolean;
  toggleShuffle: () => void;
  repeatMode: "none" | "all" | "one";
  cycleRepeat: () => void;
  recentlyPlayed: Track[];
  setLocalUriResolver: (fn: ((id: string) => string | null) | null) => void;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<"none" | "all" | "one">("none");
  const [recentlyPlayed, setRecentlyPlayed] = useState<Track[]>([]);

  const soundRef = useRef<Audio.Sound | null>(null);
  const queueIndexRef = useRef(0);
  const queueRef = useRef<Track[]>([]);
  const repeatModeRef = useRef<"none" | "all" | "one">("none");
  const localUriResolverRef = useRef<((id: string) => string | null) | null>(null);
  const currentLoadIdRef = useRef(0);

  const setLocalUriResolver = useCallback(
    (fn: ((id: string) => string | null) | null) => { localUriResolverRef.current = fn; },
    []
  );

  useEffect(() => {
    queueRef.current = queue;
    queueIndexRef.current = queueIndex;
    repeatModeRef.current = repeatMode;
  }, [queue, queueIndex, repeatMode]);

  useEffect(() => {
    if (Platform.OS !== "web") {
      Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      }).catch(() => {});
    }
    setupNotifications().catch(() => {});
    loadRecentlyPlayed();
    return () => {
      soundRef.current?.unloadAsync().catch(() => {});
      dismissNowPlayingNotification().catch(() => {});
    };
  }, []);

  const loadRecentlyPlayed = async () => {
    try {
      const data = await AsyncStorage.getItem("recently_played");
      if (data) setRecentlyPlayed(JSON.parse(data));
    } catch {}
  };

  const addToRecentlyPlayed = useCallback(async (track: Track) => {
    setRecentlyPlayed((prev) => {
      const filtered = prev.filter((t) => t.id !== track.id);
      const updated = [track, ...filtered].slice(0, 20);
      AsyncStorage.setItem("recently_played", JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  }, []);

  const onPlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      if ((status as any).error) {
        setPlaybackError("Playback error — try another track.");
        setIsLoading(false);
      }
      return;
    }
    setIsPlaying(status.isPlaying);
    setPosition(status.positionMillis);
    setDuration(status.durationMillis ?? 0);
    if (status.isLoaded && !status.isBuffering) setPlaybackError(null);

    if (status.didJustFinish) {
      const mode = repeatModeRef.current;
      const q = queueRef.current;
      const idx = queueIndexRef.current;
      if (mode === "one") {
        soundRef.current?.replayAsync().catch(() => {});
      } else if (mode === "all" || idx < q.length - 1) {
        const nextIdx = idx < q.length - 1 ? idx + 1 : 0;
        if (q[nextIdx]) loadAndPlay(q[nextIdx], q, nextIdx);
      }
    }
  }, []);

  const loadAndPlay = useCallback(
    async (track: Track, q: Track[] = [], idx = 0, overrideUri?: string) => {
      const loadId = ++currentLoadIdRef.current;

      if (!track?.audioUrl) {
        setPlaybackError("This track has no audio URL.");
        return;
      }
      try {
        setIsLoading(true);
        setPlaybackError(null);
        if (soundRef.current) {
          const prev = soundRef.current;
          soundRef.current = null;
          await prev.stopAsync().catch(() => {});
          await prev.unloadAsync().catch(() => {});
        }
        if (currentLoadIdRef.current !== loadId) return;

        const localUri = overrideUri ?? localUriResolverRef.current?.(track.id) ?? null;
        let resolvedUrl = localUri ?? track.audioUrl;
        if (!localUri && isYTMusicTrack(track)) {
          const videoId = getYTMusicVideoId(track);
          if (videoId) {
            const streamUrl = await fetchYTMusicStreamUrl(videoId);
            if (currentLoadIdRef.current !== loadId) return;
            if (!streamUrl) {
              setPlaybackError("Could not fetch stream. Try another track.");
              setIsLoading(false);
              return;
            }
            resolvedUrl = streamUrl;
          }
        }
        if (currentLoadIdRef.current !== loadId) return;

        const { sound } = await Audio.Sound.createAsync(
          { uri: resolvedUrl },
          { shouldPlay: true, progressUpdateIntervalMillis: 500 },
          onPlaybackStatusUpdate
        );
        if (currentLoadIdRef.current !== loadId) {
          sound.unloadAsync().catch(() => {});
          return;
        }
        soundRef.current = sound;
        setCurrentTrack(track);
        setQueue(q);
        setQueueIndex(idx);
        setIsPlaying(true);
        addToRecentlyPlayed(track);

        // Update now playing notification
        updateNowPlayingNotification(track.title, track.artist).catch(() => {});
      } catch (e: any) {
        if (currentLoadIdRef.current !== loadId) return;
        const msg = e?.message ?? "Could not load audio.";
        setPlaybackError(
          msg.includes("network") || msg.includes("Network")
            ? "Network error — check your connection."
            : msg.includes("format") || msg.includes("Format")
            ? "Unsupported audio format."
            : "Could not play track. Try another one."
        );
        setIsPlaying(false);
      } finally {
        if (currentLoadIdRef.current === loadId) setIsLoading(false);
      }
    },
    [onPlaybackStatusUpdate, addToRecentlyPlayed]
  );

  const playTrack = useCallback(
    async (track: Track, newQueue?: Track[], localUri?: string) => {
      if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      const q = newQueue ?? [track];
      const idx = Math.max(0, q.findIndex((t) => t.id === track.id));
      await loadAndPlay(track, q, idx, localUri);
    },
    [loadAndPlay]
  );

  const togglePlayPause = useCallback(async () => {
    if (!soundRef.current) return;
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (isPlaying) await soundRef.current.pauseAsync().catch(() => {});
    else await soundRef.current.playAsync().catch(() => {});
  }, [isPlaying]);

  const playNext = useCallback(async () => {
    const q = queueRef.current;
    const idx = queueIndexRef.current;
    if (!q.length) return;
    let nextIdx = idx + 1;
    if (nextIdx >= q.length) {
      if (repeatModeRef.current === "all") nextIdx = 0;
      else return;
    }
    if (q[nextIdx]) {
      if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      await loadAndPlay(q[nextIdx], q, nextIdx);
    }
  }, [loadAndPlay]);

  const playPrev = useCallback(async () => {
    const q = queueRef.current;
    const idx = queueIndexRef.current;
    if (!q.length) return;
    if (position > 3000) {
      await soundRef.current?.setPositionAsync(0).catch(() => {});
      return;
    }
    const prevIdx = idx > 0 ? idx - 1 : 0;
    if (q[prevIdx]) {
      if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      await loadAndPlay(q[prevIdx], q, prevIdx);
    }
  }, [position, loadAndPlay]);

  const seekTo = useCallback(async (millis: number) => {
    await soundRef.current?.setPositionAsync(millis).catch(() => {});
  }, []);

  const addToQueue = useCallback((track: Track) => { setQueue((q) => [...q, track]); }, []);
  const clearQueue = useCallback(() => { setQueue([]); setQueueIndex(0); }, []);

  const toggleShuffle = useCallback(() => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setIsShuffled((v) => !v);
  }, []);

  const cycleRepeat = useCallback(() => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setRepeatMode((m) => (m === "none" ? "all" : m === "all" ? "one" : "none"));
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack, queue, isPlaying, position, duration, isLoading,
        playbackError, playTrack, togglePlayPause, playNext, playPrev,
        seekTo, addToQueue, clearQueue, isShuffled, toggleShuffle,
        repeatMode, cycleRepeat, recentlyPlayed, setLocalUriResolver,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}
