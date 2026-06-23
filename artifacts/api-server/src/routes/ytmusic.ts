import { Router } from "express";
import http from "http";
import https from "https";

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

router.get("/ytmusic/download/:videoId", (req, res) => {
  const serviceUrl = new URL(`${YT_MUSIC_SERVICE}/download/${req.params.videoId}`);
  const transport = serviceUrl.protocol === "https:" ? https : http;

  const proxyReq = transport.request(
    {
      hostname: serviceUrl.hostname,
      port: serviceUrl.port || (serviceUrl.protocol === "https:" ? 443 : 80),
      path: serviceUrl.pathname + serviceUrl.search,
      method: "GET",
      timeout: 120000,
    },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode ?? 200, {
        "Content-Type": proxyRes.headers["content-type"] ?? "audio/m4a",
        "Content-Length": proxyRes.headers["content-length"] ?? "",
        "Content-Disposition": proxyRes.headers["content-disposition"] ?? "",
        "Cache-Control": "no-cache",
      });
      proxyRes.pipe(res);
    }
  );

  proxyReq.on("error", (err) => {
    if (!res.headersSent) {
      res.status(502).json({ error: `Download proxy error: ${err.message}` });
    }
  });

  req.on("close", () => proxyReq.destroy());
  proxyReq.end();
});

export default router;
