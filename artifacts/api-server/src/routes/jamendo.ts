import { Router } from "express";

const router = Router();

const FREETOUSE_BASE = "https://api.freetouse.com/v3";

// Proxy all freetouse music routes
router.get("/freetouse/tracks", async (req, res) => {
  try {
    const params = new URLSearchParams(req.query as Record<string, string>);
    const upstream = await fetch(`${FREETOUSE_BASE}/music/tracks/all?${params}`);
    const data = await upstream.json();
    res.json(data);
  } catch (e) {
    res.status(502).json({ ok: false, error: "Upstream error" });
  }
});

router.get("/freetouse/tracks/search", async (req, res) => {
  try {
    const params = new URLSearchParams(req.query as Record<string, string>);
    const upstream = await fetch(`${FREETOUSE_BASE}/music/tracks/search?${params}`);
    const data = await upstream.json();
    res.json(data);
  } catch (e) {
    res.status(502).json({ ok: false, error: "Upstream error" });
  }
});

router.get("/freetouse/categories", async (req, res) => {
  try {
    const upstream = await fetch(`${FREETOUSE_BASE}/music/categories/all`);
    const data = await upstream.json();
    res.json(data);
  } catch (e) {
    res.status(502).json({ ok: false, error: "Upstream error" });
  }
});

router.get("/freetouse/categories/:id/tracks", async (req, res) => {
  try {
    const params = new URLSearchParams(req.query as Record<string, string>);
    const upstream = await fetch(
      `${FREETOUSE_BASE}/music/categories/${req.params.id}/tracks?${params}`
    );
    const data = await upstream.json();
    res.json(data);
  } catch (e) {
    res.status(502).json({ ok: false, error: "Upstream error" });
  }
});

router.get("/freetouse/tracks/:id/related", async (req, res) => {
  try {
    const upstream = await fetch(`${FREETOUSE_BASE}/music/tracks/${req.params.id}/related`);
    const data = await upstream.json();
    res.json(data);
  } catch (e) {
    res.status(502).json({ ok: false, error: "Upstream error" });
  }
});

export default router;
