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
- FreeTouse API (NOT Jamendo) via proxy: `${EXPO_PUBLIC_DOMAIN}/api/freetouse/*`
- API server proxies to `https://api.freetouse.com/v3` — no API key needed

## FreeTouse API Response Shape
- Track object: `{ id, title, duration, genre, artists, thumbnails, files: {mp3}, tags }`
- `artists` is array of tuples: `[[0, {id, name}]]` — access name via `t.artists[0][1].name`
- Pagination uses `offset` (NOT `page`) — e.g. `?limit=20&offset=0`
- `data/tracks.ts` has `buildUrl(path, params)` that routes via proxy when `EXPO_PUBLIC_DOMAIN` is set, otherwise falls back to direct API call

## Design System (Glassmorphism)
- Earth/space photo: `assets/images/earth-bg.jpg` — used as background on ALL screens
- ScreenBackground renders earth image with `rgba(2,4,12,0.78)` dark overlay, OR LinearGradient for gradient wallpapers
- GlassCard: BlurView intensity=70 + `rgba(6,6,14,0.48)` overlay + per-side borders (top: rgba(255,255,255,0.24), left: 0.13, right: 0.05, bottom: 0.04) + LinearGradient shine
- GlassIcon: circular/rounded glass container wrapping Feather icon, same border treatment
- Accent: `#7C3AED` / `#A78BFA` — used ONLY for active states, NOT backgrounds
- No rainbow gradients anywhere; single purple accent only
- Tab bar: full-width pill buttons with labels (Home/Search/Library/Likes/Profile), white active, rgba(255,255,255,0.32) inactive

## Key Decisions

### FreeTouse pagination
Use `offset` param, NOT `page`. Home screen fetches 3 batches: offset 0, 20, 40.
**Why:** FreeTouse API ignores `page` param, returns same results — discovered via API response inspection.

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

## Screens Map
- `app/_layout.tsx` — Root layout with all providers + routes for: settings, appearance, license, privacy, terms, oss, about
- `app/(tabs)/_layout.tsx` — 5-tab layout with custom floating tab bar (labels + MiniPlayer above tabs)
- `app/appearance.tsx` — Wallpaper picker + profile photo picker
- `app/settings.tsx` — Audio/notifications/privacy/about settings
- `app/license.tsx` — Music license info (FreeTouse)
- `app/privacy.tsx` — Privacy policy
- `app/terms.tsx` — Terms of service
- `app/oss.tsx` — Open source libraries
- `app/about.tsx` — About screen with links to all legal pages
- `components/ScreenBackground.tsx` — Dynamic background (image or gradient wallpaper)
- `components/GlassCard.tsx` — Premium glass card
- `contexts/AppearanceContext.tsx` — Wallpaper + profilePicture state (AsyncStorage persisted)
- `contexts/PlayerContext.tsx` — Audio player with queue, shuffle, repeat, recentlyPlayed
- `assets/images/earth-bg.jpg` — Space/earth photo background
- `assets/images/beatstream-logo.png` — Beatstream logo

## Profile Picture
- Stored in AppearanceContext as local URI string (from expo-image-picker)
- Set via `setProfilePicture(uri)` — persisted to AsyncStorage
- Shown in profile screen and home screen header avatar
- expo-image-picker already installed (~17.0.9)
