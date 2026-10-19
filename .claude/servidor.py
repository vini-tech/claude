"""Servidor local do ateliê para a visualização no navegador (.claude/launch.json).

Serve web/ em http://127.0.0.1:8765 (ou na porta PORT) com charset=utf-8 nos .html e .js, para os
acentos não dependerem só do <meta charset> da página, e sem cache, para ver cada mudança na hora."""

import functools
import http.server
import os
from pathlib import Path

WEB = Path(__file__).resolve().parent.parent / "web"


class Handler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {
        **http.server.SimpleHTTPRequestHandler.extensions_map,
        ".html": "text/html; charset=utf-8",
        ".js": "text/javascript; charset=utf-8",
        ".css": "text/css; charset=utf-8",
        ".json": "application/json; charset=utf-8",
    }

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


if __name__ == "__main__":
    # PORT vem do app quando a 8765 está ocupada (por exemplo, pelo servidor da outra sessão)
    porta = int(os.environ.get("PORT", "8765"))
    http.server.ThreadingHTTPServer(("127.0.0.1", porta), functools.partial(Handler, directory=str(WEB))).serve_forever()
