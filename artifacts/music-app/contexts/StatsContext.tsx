import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

interface Stats {
  totalPlays: number;
  totalSeconds: number;
  topGenre: string;
  playlistsCreated: number;
}

interface StatsContextType {
  stats: Stats;
  recordPlay: (durationSeconds: number, genre?: string) => void;
  incrementPlaylists: () => void;
  decrementPlaylists: () => void;
}

const defaultStats: Stats = {
  totalPlays: 0,
  totalSeconds: 0,
  topGenre: "Mixed",
  playlistsCreated: 0,
};

const StatsContext = createContext<StatsContextType | null>(null);
const STATS_KEY = "beatstream_stats";
const GENRE_KEY = "beatstream_genre_counts";

export function StatsProvider({ children }: { children: React.ReactNode }) {
  const [stats, setStats] = useState<Stats>(defaultStats);
  const [genreCounts, setGenreCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    AsyncStorage.multiGet([STATS_KEY, GENRE_KEY]).then(([[, s], [, g]]) => {
      if (s) setStats(JSON.parse(s));
      if (g) setGenreCounts(JSON.parse(g));
    });
  }, []);

  const persist = (s: Stats, gc: Record<string, number>) => {
    AsyncStorage.multiSet([[STATS_KEY, JSON.stringify(s)], [GENRE_KEY, JSON.stringify(gc)]]).catch(() => {});
  };

  const recordPlay = useCallback((durationSeconds: number, genre?: string) => {
    setStats((prev) => {
      const newStats = {
        ...prev,
        totalPlays: prev.totalPlays + 1,
        totalSeconds: prev.totalSeconds + durationSeconds,
      };
      setGenreCounts((prevG) => {
        const newG = { ...prevG };
        if (genre) newG[genre] = (newG[genre] ?? 0) + 1;
        const topGenre = Object.entries(newG).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Mixed";
        const finalStats = { ...newStats, topGenre };
        persist(finalStats, newG);
        return newG;
      });
      return newStats;
    });
  }, []);

  const incrementPlaylists = useCallback(() => {
    setStats((prev) => {
      const updated = { ...prev, playlistsCreated: prev.playlistsCreated + 1 };
      persist(updated, genreCounts);
      return updated;
    });
  }, [genreCounts]);

  const decrementPlaylists = useCallback(() => {
    setStats((prev) => {
      const updated = { ...prev, playlistsCreated: Math.max(0, prev.playlistsCreated - 1) };
      persist(updated, genreCounts);
      return updated;
    });
  }, [genreCounts]);

  return (
    <StatsContext.Provider value={{ stats, recordPlay, incrementPlaylists, decrementPlaylists }}>
      {children}
    </StatsContext.Provider>
  );
}

export function useStats() {
  const ctx = useContext(StatsContext);
  if (!ctx) throw new Error("useStats must be used within StatsProvider");
  return ctx;
}
