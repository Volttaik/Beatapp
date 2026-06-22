import { Router } from "express";

const router = Router();

const FREETOUSE_BASE = "https://api.freetouse.com/v3";

// Proxy routes mirror the FreeTouse API path structure so buildUrl() in the
// client works identically with or without the proxy:
//   buildUrl("/music/tracks/all") → /api/music/tracks/all  → FREETOUSE_BASE/music/tracks/all

router.get("/music/tracks/all", async (req, res) => {
  try {
    const params = new URLSearchParams(req.query as Record<string, string>);
    const upstream = await fetch(`${FREETOUSE_BASE}/music/tracks/all?${params}`);
    const data = await upstream.json();
    res.json(data);
  } catch {
    res.status(502).json({ ok: false, error: "Upstream error" });
  }
});

router.get("/music/tracks/search", async (req, res) => {
  try {
    const params = new URLSearchParams(req.query as Record<string, string>);
    const upstream = await fetch(`${FREETOUSE_BASE}/music/tracks/search?${params}`);
    const data = await upstream.json();
    res.json(data);
  } catch {
    res.status(502).json({ ok: false, error: "Upstream error" });
  }
});

router.get("/music/categories/all", async (req, res) => {
  try {
    const upstream = await fetch(`${FREETOUSE_BASE}/music/categories/all`);
    const data = await upstream.json();
    res.json(data);
  } catch {
    res.status(502).json({ ok: false, error: "Upstream error" });
  }
});

router.get("/music/categories/:id/tracks", async (req, res) => {
  try {
    const params = new URLSearchParams(req.query as Record<string, string>);
    const upstream = await fetch(
      `${FREETOUSE_BASE}/music/categories/${req.params.id}/tracks?${params}`
    );
    const data = await upstream.json();
    res.json(data);
  } catch {
    res.status(502).json({ ok: false, error: "Upstream error" });
  }
});

router.get("/music/tracks/:id/related", async (req, res) => {
  try {
    const upstream = await fetch(`${FREETOUSE_BASE}/music/tracks/${req.params.id}/related`);
    const data = await upstream.json();
    res.json(data);
  } catch {
    res.status(502).json({ ok: false, error: "Upstream error" });
  }
});

router.get("/music/tracks/:id", async (req, res) => {
  try {
    const upstream = await fetch(`${FREETOUSE_BASE}/music/tracks/${req.params.id}`);
    const data = await upstream.json();
    res.json(data);
  } catch {
    res.status(502).json({ ok: false, error: "Upstream error" });
  }
});

export default router;
