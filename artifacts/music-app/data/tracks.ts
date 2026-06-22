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
  type: string;
  thumbnails?: { sm?: string; md?: string; lg?: string };
}

function getBaseUrl(): string {
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  if (!domain) return "";
  return `https://${domain}`;
}

export function mapFreetouseTrack(t: FreetouseTrack): Track | null {
  if (!t?.id || !t?.files?.mp3) return null;
  const artistEntry = Array.isArray(t.artists) ? t.artists[0] : null;
  const artistName =
    artistEntry && Array.isArray(artistEntry) ? artistEntry[1]?.name : "Unknown Artist";
  return {
    id: t.id,
    title: t.title ?? "Unknown",
    artist: artistName ?? "Unknown Artist",
    album: t.genre ?? "",
    artwork: t.thumbnails?.md ?? t.thumbnails?.lg ?? "",
    audioUrl: t.files.mp3,
    duration: Math.floor(t.duration ?? 0),
    genre: t.genre,
  };
}

export async function fetchFreetouseTracks(
  params: Record<string, string> = {}
): Promise<Track[]> {
  const baseUrl = getBaseUrl();
  const q = new URLSearchParams({ limit: "20", ...params });

  const url = baseUrl
    ? `${baseUrl}/api/freetouse/tracks?${q}`
    : `https://api.freetouse.com/v3/music/tracks/all?${q}`;

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

export async function searchFreetouseTracks(query: string): Promise<Track[]> {
  const baseUrl = getBaseUrl();
  const q = new URLSearchParams({ q: query, limit: "30" });

  const url = baseUrl
    ? `${baseUrl}/api/freetouse/tracks/search?${q}`
    : `https://api.freetouse.com/v3/music/tracks/search?${q}`;

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

export async function fetchFreetouseCategoryTracks(
  categoryId: string,
  params: Record<string, string> = {}
): Promise<Track[]> {
  const baseUrl = getBaseUrl();
  const q = new URLSearchParams({ limit: "20", ...params });

  const url = baseUrl
    ? `${baseUrl}/api/freetouse/categories/${categoryId}/tracks?${q}`
    : `https://api.freetouse.com/v3/music/categories/${categoryId}/tracks?${q}`;

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

export async function fetchFreetouseCategories(): Promise<FreetouseCategory[]> {
  const baseUrl = getBaseUrl();
  const url = baseUrl
    ? `${baseUrl}/api/freetouse/categories`
    : `https://api.freetouse.com/v3/music/categories/all`;

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

// Legacy aliases so old imports still compile
export const fetchJamendoTracks = fetchFreetouseTracks;
export const searchJamendoTracks = searchFreetouseTracks;

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
