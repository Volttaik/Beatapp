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

function getBaseUrl(): string {
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  if (!domain) return "";
  return `https://${domain}`;
}

export function mapJamendoTrack(t: JamendoTrack): Track | null {
  if (!t?.id || !t?.audio) return null;
  return {
    id: String(t.id),
    title: t.name ?? "Unknown",
    artist: t.artist_name ?? "Unknown Artist",
    album: t.album_name ?? "",
    artwork: t.album_image ?? "",
    audioUrl: (t.audio ?? "").replace("http://", "https://"),
    duration: Number(t.duration) || 0,
    genre: t.musicinfo?.tags?.genres?.[0],
  };
}

export async function fetchJamendoTracks(
  params: Record<string, string> = {}
): Promise<Track[]> {
  const baseUrl = getBaseUrl();

  let url: string;
  if (baseUrl) {
    const q = new URLSearchParams({
      limit: "20",
      ...params,
    });
    url = `${baseUrl}/api/jamendo/tracks?${q}`;
  } else {
    const q = new URLSearchParams({
      client_id: "b6747d04",
      format: "json",
      limit: "20",
      ...params,
    });
    url = `https://api.jamendo.com/v3.0/tracks/?${q}`;
  }

  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data?.results)) return [];
    return (data.results as JamendoTrack[])
      .map(mapJamendoTrack)
      .filter((t): t is Track => t !== null);
  } catch {
    return [];
  }
}

export async function searchJamendoTracks(query: string): Promise<Track[]> {
  return fetchJamendoTracks({ search: query, limit: "30" });
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
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}
