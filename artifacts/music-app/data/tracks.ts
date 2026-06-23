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

export interface FreetouseTrack {
  id: string;
  title: string;
  duration: number;
  genre?: string;
  artists?: [number, { id: string; name: string }][];
  thumbnails?: { sm?: string; md?: string; lg?: string; xl?: string };
  files?: { mp3?: string };
  tags?: [number, string][];
  release_date?: string;
}

export interface FreetouseCategory {
  id: string;
  name: string;
  type?: string;
  thumbnails?: { sm?: string; md?: string; lg?: string };
}

const DIRECT_API = "https://api.freetouse.com/v3";

function getBaseUrl(): string {
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  if (!domain) return "";
  return `https://${domain}`;
}

function buildUrl(path: string, params: Record<string, string> = {}): string {
  const baseUrl = getBaseUrl();
  const q = new URLSearchParams(params);
  const qs = q.toString() ? `?${q}` : "";
  if (baseUrl) return `${baseUrl}/api${path}${qs}`;
  return `${DIRECT_API}${path}${qs}`;
}

export function mapFreetouseTrack(t: FreetouseTrack): Track | null {
  if (!t?.id || !t?.files?.mp3) return null;
  const artistEntry = Array.isArray(t.artists) ? t.artists[0] : null;
  const artistName =
    artistEntry && Array.isArray(artistEntry)
      ? (artistEntry[1] as any)?.name
      : "Unknown Artist";
  return {
    id: t.id,
    title: t.title ?? "Unknown",
    artist: artistName ?? "Unknown Artist",
    album: t.genre ?? "",
    artwork: t.thumbnails?.md ?? t.thumbnails?.lg ?? t.thumbnails?.sm ?? "",
    audioUrl: t.files.mp3,
    duration: Math.floor(t.duration ?? 0),
    genre: t.genre,
  };
}

async function fetchAndMap(url: string): Promise<Track[]> {
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data?.data)) return [];
    return (data.data as FreetouseTrack[])
      .map(mapFreetouseTrack)
      .filter((t): t is Track => t !== null);
  } catch {
    return [];
  }
}

export async function fetchFreetouseTracks(
  params: Record<string, string> = {}
): Promise<Track[]> {
  const url = buildUrl("/music/tracks/all", { limit: "20", ...params });
  return fetchAndMap(url);
}

export async function searchFreetouseTracks(query: string): Promise<Track[]> {
  const url = buildUrl("/music/tracks/search", { q: query, limit: "30" });
  return fetchAndMap(url);
}

export async function fetchFreetouseCategoryTracks(
  categoryId: string,
  params: Record<string, string> = {}
): Promise<Track[]> {
  const url = buildUrl(`/music/categories/${categoryId}/tracks`, {
    limit: "20",
    ...params,
  });
  return fetchAndMap(url);
}

export async function fetchFreetouseCategories(): Promise<FreetouseCategory[]> {
  const url = buildUrl("/music/categories/all");
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data?.data)) return [];
    return data.data as FreetouseCategory[];
  } catch {
    return [];
  }
}

export async function fetchRelatedTracks(trackId: string): Promise<Track[]> {
  const url = buildUrl(`/music/tracks/${trackId}/related`);
  return fetchAndMap(url);
}

export async function fetchTrackById(id: string): Promise<Track | null> {
  const url = buildUrl(`/music/tracks/${id}`);
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return mapFreetouseTrack(data?.data ?? data);
  } catch {
    return null;
  }
}

// Legacy aliases
export const fetchJamendoTracks = fetchFreetouseTracks;
export const searchJamendoTracks = searchFreetouseTracks;

// ── YouTube Music (ytmusicapi) ────────────────────────────────────────────

const YT_MUSIC_SERVICE = "https://stephanie-investigate-pixel-starts.trycloudflare.com";

export async function searchYTMusicTracks(query: string, limit = 30): Promise<Track[]> {
  const url = `${YT_MUSIC_SERVICE}/search?q=${encodeURIComponent(query)}&limit=${limit}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data?.results)) return [];
    return data.results as Track[];
  } catch {
    return [];
  }
}

export async function fetchYTMusicTrending(): Promise<Track[]> {
  const url = `${YT_MUSIC_SERVICE}/trending`;
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data?.results)) return [];
    return data.results as Track[];
  } catch {
    return [];
  }
}

export async function fetchYTMusicStreamUrl(videoId: string): Promise<string | null> {
  const url = `${YT_MUSIC_SERVICE}/stream/${videoId}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(35000) });
    if (!res.ok) return null;
    const data = await res.json();
    return (data?.url as string) ?? null;
  } catch {
    return null;
  }
}

export function isYTMusicTrack(track: Track): boolean {
  return track.audioUrl?.startsWith("ytmusic://") ?? false;
}

export function getYTMusicVideoId(track: Track): string | null {
  if (!isYTMusicTrack(track)) return null;
  return track.audioUrl.replace("ytmusic://", "");
}

export const FEATURED_GENRES = [
  { id: "91ca6cf0-08d4-0e57-e024-2fd0e1413327", label: "Chill" },
  { id: "f96cc1c5-9172-b0e2-6c63-eb3f3eff5598", label: "Cinematic" },
  { id: "b5bc7541-bdc2-d42a-3986-572fddd29753", label: "Ambient" },
  { id: "e8eb326e-cb23-408f-e6cf-e7a5ab10e197", label: "Classical" },
  { id: "0a065241-a911-f541-c738-42013e9bd891", label: "Action" },
  { id: "8bd52977-7aa9-5f48-6226-9d11771b5e93", label: "Adventure" },
  { id: "6f0fe64f-5795-2876-6fd3-cdaedda1634f", label: "Aesthetic" },
  { id: "78b17c21-bfb1-90ae-5240-e59d82c5ef3a", label: "Calm" },
];

export const GENRE_CATEGORY_ICONS: Record<string, string> = {
  "91ca6cf0-08d4-0e57-e024-2fd0e1413327": "coffee",
  "f96cc1c5-9172-b0e2-6c63-eb3f3eff5598": "film",
  "b5bc7541-bdc2-d42a-3986-572fddd29753": "wind",
  "e8eb326e-cb23-408f-e6cf-e7a5ab10e197": "award",
  "0a065241-a911-f541-c738-42013e9bd891": "zap",
  "8bd52977-7aa9-5f48-6226-9d11771b5e93": "compass",
  "6f0fe64f-5795-2876-6fd3-cdaedda1634f": "feather",
  "78b17c21-bfb1-90ae-5240-e59d82c5ef3a": "moon",
};

export function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}
