import { Router } from "express";

const router = Router();

const JAMENDO_BASE = "https://api.jamendo.com/v3.0";
const CLIENT_ID = "b6747d04";

router.get("/jamendo/tracks", async (req, res) => {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    format: "json",
    ...Object.fromEntries(
      Object.entries(req.query as Record<string, string>).filter(([k]) => k !== "client_id")
    ),
  });
  const upstream = await fetch(`${JAMENDO_BASE}/tracks/?${params}`);
  const data = await upstream.json();
  res.json(data);
});

export default router;
