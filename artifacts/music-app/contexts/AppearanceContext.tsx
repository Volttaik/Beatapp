import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export type WallpaperType = "image" | "gradient";

export interface WallpaperOption {
  id: string;
  name: string;
  type: WallpaperType;
  colors?: string[];
  overlay?: string;
}

export const WALLPAPERS: WallpaperOption[] = [
  {
    id: "earth",
    name: "Earth Space",
    type: "image",
    overlay: "rgba(2,4,12,0.78)",
  },
  {
    id: "nebula",
    name: "Nebula",
    type: "gradient",
    colors: ["#0d0018", "#220060", "#05000f", "#0a0020"],
    overlay: "rgba(4,0,12,0.65)",
  },
  {
    id: "aurora",
    name: "Aurora",
    type: "gradient",
    colors: ["#001510", "#003828", "#000d08", "#001a12"],
    overlay: "rgba(0,6,4,0.65)",
  },
  {
    id: "volcanic",
    name: "Volcanic",
    type: "gradient",
    colors: ["#1a0200", "#400800", "#0f0100", "#220400"],
    overlay: "rgba(8,1,0,0.65)",
  },
  {
    id: "ocean",
    name: "Deep Ocean",
    type: "gradient",
    colors: ["#000d1f", "#002050", "#00080f", "#001030"],
    overlay: "rgba(0,3,10,0.65)",
  },
  {
    id: "dusk",
    name: "Cosmic Dusk",
    type: "gradient",
    colors: ["#100020", "#280060", "#0a001a", "#1a0040"],
    overlay: "rgba(6,0,10,0.68)",
  },
  {
    id: "void",
    name: "Pure Dark",
    type: "gradient",
    colors: ["#020205", "#06060f", "#010102", "#040408"],
    overlay: "rgba(0,0,4,0.75)",
  },
];

const APPEARANCE_KEY = "beatstream_appearance";

interface AppearanceContextType {
  wallpaper: WallpaperOption;
  setWallpaper: (w: WallpaperOption) => void;
  profilePicture: string | null;
  setProfilePicture: (uri: string | null) => void;
}

const AppearanceContext = createContext<AppearanceContextType | null>(null);

export function AppearanceProvider({ children }: { children: React.ReactNode }) {
  const [wallpaper, setWallpaperState] = useState<WallpaperOption>(WALLPAPERS[0]);
  const [profilePicture, setProfilePictureState] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(APPEARANCE_KEY).then((raw) => {
      if (!raw) return;
      try {
        const { wallpaperId, profilePicture: pic } = JSON.parse(raw);
        const found = WALLPAPERS.find((w) => w.id === wallpaperId);
        if (found) setWallpaperState(found);
        if (pic) setProfilePictureState(pic);
      } catch {}
    });
  }, []);

  const persist = useCallback(
    (wallpaperId: string, pic: string | null) => {
      AsyncStorage.setItem(APPEARANCE_KEY, JSON.stringify({ wallpaperId, profilePicture: pic })).catch(() => {});
    },
    []
  );

  const setWallpaper = useCallback(
    (w: WallpaperOption) => {
      setWallpaperState(w);
      persist(w.id, profilePicture);
    },
    [profilePicture, persist]
  );

  const setProfilePicture = useCallback(
    (uri: string | null) => {
      setProfilePictureState(uri);
      persist(wallpaper.id, uri);
    },
    [wallpaper.id, persist]
  );

  return (
    <AppearanceContext.Provider value={{ wallpaper, setWallpaper, profilePicture, setProfilePicture }}>
      {children}
    </AppearanceContext.Provider>
  );
}

export function useAppearance() {
  const ctx = useContext(AppearanceContext);
  if (!ctx) throw new Error("useAppearance must be used within AppearanceProvider");
  return ctx;
}
