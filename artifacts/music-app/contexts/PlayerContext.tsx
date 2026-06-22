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
import { Track } from "@/data/tracks";

interface PlayerContextType {
  currentTrack: Track | null;
  queue: Track[];
  isPlaying: boolean;
  position: number;
  duration: number;
  isLoading: boolean;
  playTrack: (track: Track, queue?: Track[]) => Promise<void>;
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
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [queueIndex, setQueueIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<"none" | "all" | "one">("none");
  const [recentlyPlayed, setRecentlyPlayed] = useState<Track[]>([]);

  const soundRef = useRef<Audio.Sound | null>(null);
  const queueIndexRef = useRef<number>(0);
  const queueRef = useRef<Track[]>([]);
  const repeatModeRef = useRef<"none" | "all" | "one">("none");

  useEffect(() => {
    queueRef.current = queue;
    queueIndexRef.current = queueIndex;
    repeatModeRef.current = repeatMode;
  }, [queue, queueIndex, repeatMode]);

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
    });
    loadRecentlyPlayed();
    return () => {
      soundRef.current?.unloadAsync();
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
    if (!status.isLoaded) return;
    setIsPlaying(status.isPlaying);
    setPosition(status.positionMillis);
    setDuration(status.durationMillis ?? 0);

    if (status.didJustFinish) {
      const mode = repeatModeRef.current;
      const q = queueRef.current;
      const idx = queueIndexRef.current;

      if (mode === "one") {
        soundRef.current?.replayAsync();
      } else if (mode === "all" || idx < q.length - 1) {
        const nextIdx = idx < q.length - 1 ? idx + 1 : 0;
        if (q[nextIdx]) {
          loadAndPlay(q[nextIdx], q, nextIdx);
        }
      }
    }
  }, []);

  const loadAndPlay = useCallback(
    async (track: Track, q: Track[] = [], idx: number = 0) => {
      try {
        setIsLoading(true);
        if (soundRef.current) {
          await soundRef.current.unloadAsync();
          soundRef.current = null;
        }
        const { sound } = await Audio.Sound.createAsync(
          { uri: track.audioUrl },
          { shouldPlay: true, progressUpdateIntervalMillis: 500 },
          onPlaybackStatusUpdate
        );
        soundRef.current = sound;
        setCurrentTrack(track);
        setQueue(q);
        setQueueIndex(idx);
        setIsPlaying(true);
        addToRecentlyPlayed(track);
      } catch (err) {
        setIsPlaying(false);
      } finally {
        setIsLoading(false);
      }
    },
    [onPlaybackStatusUpdate, addToRecentlyPlayed]
  );

  const playTrack = useCallback(
    async (track: Track, newQueue?: Track[]) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const q = newQueue ?? [track];
      const idx = q.findIndex((t) => t.id === track.id);
      await loadAndPlay(track, q, idx >= 0 ? idx : 0);
    },
    [loadAndPlay]
  );

  const togglePlayPause = useCallback(async () => {
    if (!soundRef.current) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isPlaying) {
      await soundRef.current.pauseAsync();
    } else {
      await soundRef.current.playAsync();
    }
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
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await loadAndPlay(q[nextIdx], q, nextIdx);
    }
  }, [loadAndPlay]);

  const playPrev = useCallback(async () => {
    const q = queueRef.current;
    const idx = queueIndexRef.current;
    if (!q.length) return;
    if (position > 3000) {
      await soundRef.current?.setPositionAsync(0);
      return;
    }
    const prevIdx = idx > 0 ? idx - 1 : 0;
    if (q[prevIdx]) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await loadAndPlay(q[prevIdx], q, prevIdx);
    }
  }, [position, loadAndPlay]);

  const seekTo = useCallback(async (millis: number) => {
    await soundRef.current?.setPositionAsync(millis);
  }, []);

  const addToQueue = useCallback((track: Track) => {
    setQueue((q) => [...q, track]);
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
    setQueueIndex(0);
  }, []);

  const toggleShuffle = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsShuffled((v) => !v);
  }, []);

  const cycleRepeat = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRepeatMode((m) => (m === "none" ? "all" : m === "all" ? "one" : "none"));
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        queue,
        isPlaying,
        position,
        duration,
        isLoading,
        playTrack,
        togglePlayPause,
        playNext,
        playPrev,
        seekTo,
        addToQueue,
        clearQueue,
        isShuffled,
        toggleShuffle,
        repeatMode,
        cycleRepeat,
        recentlyPlayed,
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
