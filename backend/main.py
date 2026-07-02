import json
import asyncio
import websockets
import os
import gzip
import hashlib
import mimetypes

from http.server import SimpleHTTPRequestHandler
from socketserver import ThreadingTCPServer
import threading
import functools

from backend.api.routes import Routes

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(BASE_DIR, "..", "frontend")
FRONTEND_DIR = os.path.normpath(FRONTEND_DIR)

routes = Routes()

handlers = {
    "system:test": routes.test,

    "auth:login": routes.login,
    "auth:logout": routes.logout,
    "auth:check": routes.token_check,

    "day:get": routes.get_day,
    "day:get_indexes": routes.get_day_indexes,
    "day:set": routes.set_day,

    "question:add": routes.add_question,
    "question:remove": routes.remove_question,
    "question:get": routes.get_questions,

    "settings:get": routes.get_settings
}

COMPRESS_EXTENSIONS = {".html", ".css", ".js"}

class CachedFile:
    __slots__ = ("raw", "compressed", "mime", "etag")

    def __init__(self, abs_path: str):
        ext = os.path.splitext(abs_path)[1].lower()
        mime, _ = mimetypes.guess_type(abs_path)

        with open(abs_path, "rb") as f:
            self.raw = f.read()

        self.mime = mime or "application/octet-stream"
        self.etag = hashlib.md5(self.raw).hexdigest()
        self.compressed = gzip.compress(self.raw, compresslevel=6) if ext in COMPRESS_EXTENSIONS else None


file_cache: dict[str, CachedFile] = {}

def build_file_cache():
    for root, _, files in os.walk(FRONTEND_DIR):
        for filename in files:
            abs_path = os.path.join(root, filename)
            rel_path = "/" + os.path.relpath(abs_path, FRONTEND_DIR).replace(os.sep, "/")
            file_cache[rel_path] = CachedFile(abs_path)
    print(f"Cached {len(file_cache)} files.")


class SPARequestHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        path = self.path.split("?")[0]
        cached = file_cache.get(path) or file_cache.get("/index.html")

        if self.headers.get("If-None-Match") == cached.etag:
            print(f"[HTTP] 304 {path} (cached)")
            self.send_response(304)
            self.end_headers()
            return

        accepts_gzip = "gzip" in self.headers.get("Accept-Encoding", "")
        use_gzip = cached.compressed is not None and accepts_gzip
        body = cached.compressed if use_gzip else cached.raw

        encoding_note = "gzip" if use_gzip else "raw"
        print(f"[HTTP] 200 {path} ({encoding_note}, {len(body)} bytes)")

        self.send_response(200)
        self.send_header("Content-Type", cached.mime)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("ETag", cached.etag)
        self.send_header("Cache-Control", "no-cache" if path in ("/", "/index.html") else "public, max-age=31536000, immutable")
        if use_gzip:
            self.send_header("Content-Encoding", "gzip")
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format, *args):
        pass  # still silenced — we handle printing ourselves above


async def handle_connections(websocket):
    async for message in websocket:
        action = None

        try:
            data = json.loads(message)
            action = data.get("action")
            payload = data.get("data", {})

            print(f"[WS] >>> {action} | payload: {payload}")

            if action not in handlers:
                response = {
                    "status": "error",
                    "action": action,
                    "error": {"code": "UNKNOWN_ACTION", "message": f"Unknown action: {action}"}
                }
                print(f"[WS] <<< {action} | UNKNOWN_ACTION")
                await websocket.send(json.dumps(response))
                continue

            handler = handlers[action]
            result = handler(payload)
            if asyncio.iscoroutine(result):
                result = await result

            print(f"[WS] <<< {action} | status: {result.get('status')}")
            await websocket.send(json.dumps(result))

        except Exception as e:
            print(f"[WS] <<< {action or 'unknown'} | ERROR {type(e).__name__}: {e}")
            await websocket.send(json.dumps({
                "status": "error",
                "action": action or "unknown",
                "error": {"code": "INTERNAL_SERVER_ERROR", "message": str(e)},
                "meta": {"type": type(e).__name__}
            }))

async def main():
    build_file_cache()

    async with websockets.serve(handle_connections, "0.0.0.0", 1520):
        print("Websocket server running on ws://localhost:1520")
        await asyncio.Future()

def start_http():
    handler = functools.partial(SPARequestHandler, directory=FRONTEND_DIR)
    httpd = ThreadingTCPServer(("0.0.0.0", 1517), handler)
    httpd.daemon_threads = True
    httpd.allow_reuse_address = True
    print("HTTP server running on http://0.0.0.0:1517")
    httpd.serve_forever()

if __name__ == "__main__":
    threading.Thread(target=start_http, daemon=True).start()
    asyncio.run(main())