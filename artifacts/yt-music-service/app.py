import os
import re
from flask import Flask, jsonify, request, Response
from flask_cors import CORS
from ytmusicapi import YTMusic
import yt_dlp
import urllib.request

app = Flask(__name__)
CORS(app)

yt = YTMusic()


def parse_duration(duration_str):
    if not duration_str:
        return 0
    parts = str(duration_str).split(":")
    try:
        if len(parts) == 2:
            return int(parts[0]) * 60 + int(parts[1])
        elif len(parts) == 3:
            return int(parts[0]) * 3600 + int(parts[1]) * 60 + int(parts[2])
    except Exception:
        pass
    return 0


def normalize_thumb(url):
    if not url:
        return ""
    if "=w" in url:
        return url.split("=w")[0] + "=w400-h400"
    return url


def map_result(r):
    vid = r.get("videoId")
    if not vid:
        return None
    thumbnails = r.get("thumbnails", []) or []
    thumb = normalize_thumb(thumbnails[-1]["url"] if thumbnails else "")
    artists = r.get("artists", []) or []
    artist = artists[0]["name"] if artists else "Unknown Artist"
    album_info = r.get("album") or {}
    album = album_info.get("name", "") if album_info else ""
    dur = r.get("duration_seconds") or parse_duration(r.get("duration"))
    return {
        "id": vid,
        "title": r.get("title", "Unknown"),
        "artist": artist,
        "album": album,
        "artwork": thumb,
        "duration": dur,
        "audioUrl": f"ytmusic://{vid}",
    }


def get_stream_info(video_id):
    ydl_opts = {
        "format": "bestaudio[ext=m4a]/bestaudio[ext=webm]/bestaudio",
        "quiet": True,
        "no_warnings": True,
        "socket_timeout": 20,
        "extractor_args": {"youtube": {"skip": ["hls", "dash"]}},
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(
            f"https://music.youtube.com/watch?v={video_id}",
            download=False,
        )
        if not info:
            return None, None, None

        formats = info.get("formats", []) or []
        audio_only = [
            f for f in formats
            if f.get("vcodec") == "none" and f.get("url")
        ]
        m4a = [f for f in audio_only if f.get("ext") == "m4a"]
        webm = [f for f in audio_only if f.get("ext") == "webm"]

        chosen = None
        if m4a:
            chosen = sorted(m4a, key=lambda f: f.get("abr") or 0)[-1]
        elif webm:
            chosen = sorted(webm, key=lambda f: f.get("abr") or 0)[-1]
        elif audio_only:
            chosen = sorted(audio_only, key=lambda f: f.get("abr") or 0)[-1]

        if chosen and chosen.get("url"):
            return chosen["url"], chosen.get("ext", "m4a"), chosen.get("http_headers", {})
        return None, None, None


@app.route("/search")
def search():
    q = request.args.get("q", "").strip()
    limit = int(request.args.get("limit", "20"))
    if not q:
        return jsonify({"results": []})
    try:
        raw = yt.search(q, filter="songs", limit=limit)
        tracks = [t for r in raw if (t := map_result(r)) is not None]
        return jsonify({"results": tracks})
    except Exception as e:
        return jsonify({"error": str(e), "results": []}), 500


@app.route("/trending")
def trending():
    queries = [
        "top hits 2025",
        "popular songs right now",
        "billboard hot 100 2025",
    ]
    import random
    q = random.choice(queries)
    try:
        raw = yt.search(q, filter="songs", limit=20)
        tracks = [t for r in raw if (t := map_result(r)) is not None]
        return jsonify({"results": tracks})
    except Exception as e:
        return jsonify({"error": str(e), "results": []}), 500


@app.route("/stream/<video_id>")
def stream(video_id):
    try:
        url, ext, headers = get_stream_info(video_id)
        if not url:
            return jsonify({"error": "No audio stream found"}), 404
        return jsonify({
            "url": url,
            "ext": ext or "m4a",
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/download/<video_id>")
def download(video_id):
    """Proxy the audio stream so the client doesn't need time-limited CDN URLs."""
    try:
        url, ext, extra_headers = get_stream_info(video_id)
        if not url:
            return jsonify({"error": "No audio stream found"}), 404

        req_headers = {
            "User-Agent": "Mozilla/5.0 (compatible; BeatStream/1.0)",
            "Accept": "*/*",
        }
        if extra_headers:
            req_headers.update(extra_headers)

        req = urllib.request.Request(url, headers=req_headers)
        remote = urllib.request.urlopen(req, timeout=60)

        content_type = remote.headers.get("Content-Type", f"audio/{ext}")
        content_length = remote.headers.get("Content-Length")

        resp_headers = {"Content-Type": content_type}
        if content_length:
            resp_headers["Content-Length"] = content_length
        resp_headers["Content-Disposition"] = f'attachment; filename="{video_id}.{ext}"'

        def generate():
            try:
                while True:
                    chunk = remote.read(65536)
                    if not chunk:
                        break
                    yield chunk
            finally:
                remote.close()

        return Response(generate(), headers=resp_headers, status=200)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/health")
def health():
    return jsonify({"ok": True})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 9000))
    app.run(host="0.0.0.0", port=port, debug=False)
