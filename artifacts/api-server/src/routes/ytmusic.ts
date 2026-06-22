import { Router } from "express";

const router = Router();

const YT_MUSIC_SERVICE = process.env.YT_MUSIC_SERVICE_URL ?? "http://localhost:9000";

router.get("/ytmusic/search", async (req, res) => {
  try {
    const params = new URLSearchParams(req.query as Record<string, string>);
    const upstream = await fetch(`${YT_MUSIC_SERVICE}/search?${params}`, {
      signal: AbortSignal.timeout(20000),
    });
    const data = await upstream.json();
    res.json(data);
  } catch {
    res.status(502).json({ error: "YT Music service unavailable", results: [] });
  }
});

router.get("/ytmusic/trending", async (req, res) => {
  try {
    const upstream = await fetch(`${YT_MUSIC_SERVICE}/trending`, {
      signal: AbortSignal.timeout(20000),
    });
    const data = await upstream.json();
    res.json(data);
  } catch {
    res.status(502).json({ error: "YT Music service unavailable", results: [] });
  }
});

router.get("/ytmusic/stream/:videoId", async (req, res) => {
  try {
    const upstream = await fetch(
      `${YT_MUSIC_SERVICE}/stream/${req.params.videoId}`,
      { signal: AbortSignal.timeout(35000) }
    );
    const data = await upstream.json();
    res.json(data);
  } catch {
    res.status(502).json({ error: "Stream extraction failed" });
  }
});

export default router;
