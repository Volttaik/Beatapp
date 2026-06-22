---
name: Beatstream App Architecture
description: Key decisions and quirks for the Beatstream music streaming app built on Expo/React Native
---

# Beatstream App Architecture

## Stack
- Expo 54, React Native 0.81.5, Expo Router v6
- Clerk auth (ClerkProvider + ClerkLoaded wrapper in `_layout.tsx`)
- expo-av for audio (deprecated in SDK 54, but still in use)
- AsyncStorage for persistence
- Jamendo API via proxy: `${EXPO_PUBLIC_DOMAIN}/api/jamendo/tracks` with CLIENT_ID `b6747d04`

## Color Scheme
- Background: `#08080F`
- Primary: `#7C3AED` (purple)
- Accent: `#A78BFA`
- Surface: `#13131F` / `#1C1C2A`

## Key Decisions

### @react-navigation/bottom-tabs import
`BottomTabBar` is NOT directly importable with TypeScript types. Use `require()`:
```tsx
const BottomTabBar = require("@react-navigation/bottom-tabs").BottomTabBar as React.ComponentType<any>;
```
**Why:** The package is a transitive dep of expo-router; types aren't explicitly installed.

### Clerk API (forgot-password)
Newer Clerk SDK returns `SignInSignalValue` from `useSignIn()`, not the resource directly.
Cast with `(signInResult as any).signIn` for password reset flows.

### GlassCard web styles
`WebkitBackdropFilter` causes TS type error in RN StyleSheet. Use `as any` on the style object.

### useColors hook
Type the return explicitly to avoid TS inference issues with `colors.radius`.

### Web preview blank screen
Web preview often shows white during Clerk loading — normal. App works via Expo Go on mobile.
`ClerkLoaded` wrapper prevents render until Clerk initializes.

## File Map
- `app/_layout.tsx` — Root layout with all providers (ClerkProvider, PlayerProvider, PlaylistProvider, StatsProvider, LibraryProvider)
- `app/(tabs)/_layout.tsx` — 5-tab layout with custom tab bar (MiniPlayer above tabs)
- `contexts/PlaylistContext.tsx` — Playlist CRUD with AsyncStorage
- `contexts/StatsContext.tsx` — Listening stats (plays, minutes, top genre)
- `contexts/PlayerContext.tsx` — Audio player with queue, shuffle, repeat, recentlyPlayed
- `components/AddToPlaylistModal.tsx` — Bottom sheet to add tracks to playlists
- `app/player.tsx` — Full-screen player with blur BG, seek bar, shuffle/repeat
- `app/queue.tsx` — Queue management screen
- `app/settings.tsx` — App settings with AsyncStorage persistence
- `app/playlist/create.tsx` — Create playlist modal
- `app/playlist/[id].tsx` — Playlist detail with track management
- `assets/images/beatstream-logo.png` — Beatstream logo (used in auth screens)
