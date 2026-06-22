---
name: Beatstream Workflows
description: Workflow names and port configuration for Beatstream dev environment
---

# Beatstream Workflow Configuration

## Active Workflows
- **Start API Server** — `PORT=8080 pnpm --filter @workspace/api-server run dev` → port 8080 (console)
- **Start Music App** — `PORT=8081 pnpm --filter @workspace/music-app run dev` → port 8081 (webview, external 80)

## Port Map (.replit)
- 8080 → external 8080 (API server)
- 8081 → external 80 (Expo web, main preview)
- 24425 → external 3000
- 24426 → external 3002

## Why explicit PORT= prefix
The `.replit` workflow runner does NOT expand `$PORT` shell variable in commands. Must hardcode `PORT=8081` directly in the command string.
**Why:** `pnpm exec expo start --localhost --port $PORT` fails with "option requires argument: --port" when $PORT is empty.
