---
name: Beatstream visual overhaul
description: Key decisions from the animation/UX overhaul — black theme, wave bg, download fix, notification service
---

## Download fix
YT Music `audioUrl` values are `ytmusic://videoId` scheme — stream URLs expire. DownloadContext must call `fetchYTMusicStreamUrl(videoId)` fresh at download time, not cache the URL from when the track was loaded.

**Why:** The yt-dlp stream URL has a TTL of minutes; using the cached URL from playback causes 403 errors on download.

**How to apply:** Always check `isYTMusicTrack(track)` before downloading; resolve a fresh stream URL first.

## Notification service
`artifacts/music-app/services/NotificationService.ts` uses a try/catch require for `expo-notifications` (graceful no-op if not installed). expo-notifications is NOT in the music-app package.json — it must be added and installed before notifications will work in prod.

## Wave background
`WaveBackground.tsx` uses genre-to-color-palette mapping (GENRE_PALETTES dict) + Reanimated withRepeat/withSequence blobs. Always sits behind a LinearGradient overlay so content stays readable. Intensity prop (0-1) scales blob opacity.

## Theme
All backgrounds use `#000000`. Surface tints are `rgba(255,255,255,0.05-0.08)`. Icon color tier: icons at `rgba(255,255,255,0.82)`, primary text `#FFF`, secondary text `rgba(255,255,255,0.45)`. Accent: `#C4B5FD` (violet-300).

## pnpm install
When workflows fail with "node_modules missing", run `pnpm install --no-frozen-lockfile` from workspace root. The root node_modules must exist before `pnpm exec expo` can find the expo binary.
