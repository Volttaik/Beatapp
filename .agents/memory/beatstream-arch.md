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

## Design System (Glassmorphism)
- Earth/space photo: `assets/images/earth-bg.jpg` — used as background on ALL screens
- ScreenBackground renders earth image with `rgba(2,4,12,0.78)` dark overlay
- GlassCard: BlurView intensity=70 + `rgba(8,8,16,0.52)` overlay + per-side borders (top: rgba(255,255,255,0.22), left: 0.12, right: 0.05, bottom: 0.04) + LinearGradient shine
- GlassIcon: circular/rounded glass container wrapping Feather icon, same border treatment
- Accent: `#7C3AED` / `#A78BFA` — used ONLY for active states, NOT backgrounds
- No rainbow gradients anywhere; single purple accent only
- Tab bar: white active, rgba(255,255,255,0.35) inactive, BlurView bg on iOS

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

### Per-side border colors
React Native supports `borderTopColor`, `borderLeftColor`, etc. alongside `borderWidth: 1`.
This gives the top-lit glass effect (brighter top border = glass catching light).

### useClerkSafe hooks
All tab screens must use `useUserSafe` / `useAuthSafe` from `hooks/useClerkSafe.ts` instead of direct Clerk hooks to avoid crashes when Clerk is unavailable.

## File Map
- `app/_layout.tsx` — Root layout with all providers
- `app/(tabs)/_layout.tsx` — 5-tab layout with custom tab bar (MiniPlayer above tabs)
- `components/ScreenBackground.tsx` — Earth ImageBackground + dark overlay
- `components/GlassCard.tsx` — Premium glass card with blur, shine, per-side borders
- `components/GlassIcon.tsx` — Glass icon button (circle/rounded container)
- `components/MiniPlayer.tsx` — Glass mini player with progress bar
- `components/TrackCard.tsx` — Track row with glass icon buttons
- `contexts/PlaylistContext.tsx` — Playlist CRUD with AsyncStorage
- `contexts/StatsContext.tsx` — Listening stats (plays, minutes, top genre)
- `contexts/PlayerContext.tsx` — Audio player with queue, shuffle, repeat, recentlyPlayed
- `app/player.tsx` — Full-screen player, earth bg + artwork blur overlay
- `assets/images/earth-bg.jpg` — Space/earth photo background
- `assets/images/beatstream-logo.png` — Beatstream logo
