import { Platform } from "react-native";

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  artwork: string;
  audioUrl: string;
  duration: number;
  genre?: string;
}

export interface JamendoTrack {
  id: string;
  name: string;
  artist_name: string;
  album_name: string;
  album_image: string;
  audio: string;
  duration: number;
  musicinfo?: {
    tags?: { genres?: string[] };
  };
}

const JAMENDO_BASE = "https://api.jamendo.com/v3.0";
const CLIENT_ID = "b6747d04";

function getBaseUrl(): string {
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  return domain ? `https://${domain}` : "";
}

function useProxy(): boolean {
  return true;
}

export function mapJamendoTrack(t: JamendoTrack): Track {
  return {
    id: t.id,
    title: t.name,
    artist: t.artist_name,
    album: t.album_name,
    artwork: t.album_image,
    audioUrl: t.audio.replace("http://", "https://"),
    duration: t.duration,
    genre: t.musicinfo?.tags?.genres?.[0],
  };
}

export async function fetchJamendoTracks(
  params: Record<string, string> = {}
): Promise<Track[]> {
  const queryParams: Record<string, string> = {
    format: "json",
    limit: "20",
    audioformat: "mp32",
    include: "musicinfo",
    ...params,
  };

  let url: string;
  if (useProxy()) {
    const query = new URLSearchParams(queryParams);
    url = `${getBaseUrl()}/api/jamendo/tracks?${query}`;
  } else {
    const query = new URLSearchParams({
      client_id: CLIENT_ID,
      ...queryParams,
    });
    url = `${JAMENDO_BASE}/tracks/?${query}`;
  }

  const res = await fetch(url);
  const data = await res.json();
  return (data.results as JamendoTrack[]).map(mapJamendoTrack);
}

export async function searchJamendoTracks(query: string): Promise<Track[]> {
  return fetchJamendoTracks({ search: query });
}

export async function fetchTracksByTag(tag: string): Promise<Track[]> {
  return fetchJamendoTracks({ tags: tag });
}

export const FEATURED_GENRES = [
  { id: "electronic", label: "Electronic" },
  { id: "rock", label: "Rock" },
  { id: "jazz", label: "Jazz" },
  { id: "ambient", label: "Ambient" },
  { id: "classical", label: "Classical" },
  { id: "hiphop", label: "Hip-Hop" },
  { id: "pop", label: "Pop" },
  { id: "folk", label: "Folk" },
];

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
