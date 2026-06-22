import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Track } from "@/data/tracks";

interface LibraryContextType {
  favorites: Track[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (track: Track) => void;
}

const LibraryContext = createContext<LibraryContextType | null>(null);

const FAVORITES_KEY = "library_favorites";

export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<Track[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(FAVORITES_KEY).then((data) => {
      if (data) setFavorites(JSON.parse(data));
    });
  }, []);

  const isFavorite = useCallback(
    (id: string) => favorites.some((t) => t.id === id),
    [favorites]
  );

  const toggleFavorite = useCallback(
    (track: Track) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setFavorites((prev) => {
        const exists = prev.some((t) => t.id === track.id);
        const updated = exists ? prev.filter((t) => t.id !== track.id) : [track, ...prev];
        AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated)).catch(() => {});
        return updated;
      });
    },
    []
  );

  return (
    <LibraryContext.Provider value={{ favorites, isFavorite, toggleFavorite }}>
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error("useLibrary must be used within LibraryProvider");
  return ctx;
}
