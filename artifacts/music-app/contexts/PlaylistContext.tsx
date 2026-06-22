import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Track } from "@/data/tracks";

export interface Playlist {
  id: string;
  name: string;
  description: string;
  coverImage?: string;
  tracks: Track[];
  createdAt: number;
  updatedAt: number;
}

interface PlaylistContextType {
  playlists: Playlist[];
  createPlaylist: (name: string, description?: string) => Playlist;
  deletePlaylist: (id: string) => void;
  addTrackToPlaylist: (playlistId: string, track: Track) => void;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
  updatePlaylist: (id: string, updates: Partial<Pick<Playlist, "name" | "description" | "coverImage">>) => void;
  getPlaylist: (id: string) => Playlist | undefined;
}

const PlaylistContext = createContext<PlaylistContextType | null>(null);
const PLAYLISTS_KEY = "beatstream_playlists";

export function PlaylistProvider({ children }: { children: React.ReactNode }) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(PLAYLISTS_KEY).then((data) => {
      if (data) setPlaylists(JSON.parse(data));
    });
  }, []);

  const persist = (updated: Playlist[]) => {
    AsyncStorage.setItem(PLAYLISTS_KEY, JSON.stringify(updated)).catch(() => {});
  };

  const createPlaylist = useCallback((name: string, description = ""): Playlist => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name,
      description,
      tracks: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setPlaylists((prev) => {
      const updated = [newPlaylist, ...prev];
      persist(updated);
      return updated;
    });
    return newPlaylist;
  }, []);

  const deletePlaylist = useCallback((id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPlaylists((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      persist(updated);
      return updated;
    });
  }, []);

  const addTrackToPlaylist = useCallback((playlistId: string, track: Track) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPlaylists((prev) => {
      const updated = prev.map((p) => {
        if (p.id !== playlistId) return p;
        if (p.tracks.some((t) => t.id === track.id)) return p;
        return { ...p, tracks: [...p.tracks, track], updatedAt: Date.now() };
      });
      persist(updated);
      return updated;
    });
  }, []);

  const removeTrackFromPlaylist = useCallback((playlistId: string, trackId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPlaylists((prev) => {
      const updated = prev.map((p) => {
        if (p.id !== playlistId) return p;
        return { ...p, tracks: p.tracks.filter((t) => t.id !== trackId), updatedAt: Date.now() };
      });
      persist(updated);
      return updated;
    });
  }, []);

  const updatePlaylist = useCallback(
    (id: string, updates: Partial<Pick<Playlist, "name" | "description" | "coverImage">>) => {
      setPlaylists((prev) => {
        const updated = prev.map((p) =>
          p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p
        );
        persist(updated);
        return updated;
      });
    },
    []
  );

  const getPlaylist = useCallback(
    (id: string) => playlists.find((p) => p.id === id),
    [playlists]
  );

  return (
    <PlaylistContext.Provider
      value={{ playlists, createPlaylist, deletePlaylist, addTrackToPlaylist, removeTrackFromPlaylist, updatePlaylist, getPlaylist }}
    >
      {children}
    </PlaylistContext.Provider>
  );
}

export function usePlaylists() {
  const ctx = useContext(PlaylistContext);
  if (!ctx) throw new Error("usePlaylists must be used within PlaylistProvider");
  return ctx;
}
