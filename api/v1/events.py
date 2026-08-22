# api/v1/events.py — Vitrine Certa (Mês 37)
# Recebe pageview do analytics-visita.js (navigator.sendBeacon) e persiste na
# tabela evento_visita do Supabase da VC. Lê agregado para o dashboard.
# Padrão: BaseHTTPRequestHandler (Vercel Python function), igual api/insta.py.
#
# ENV (runtime, NÃO commitadas):
#   SUPABASE_URL               ex: https://xxxx.supabase.co
#   SUPABASE_SERVICE_ROLE_KEY  service_role (bypass RLS; só a function usa)
# Se ausentes -> modo stateless (recebe/valida/loga, não persiste).

import os
import sys
import json
import urllib.request
import urllib.error
from http.server import BaseHTTPRequestHandler

SUPABASE_URL = os.environ.get("SUPABASE_URL", "").rstrip("/")
SVC = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
TABLE = "evento_visita"


def _clean(payload):
    if not isinstance(payload, dict):
        return None
    return {
        "tenant_id": str(payload.get("tenant_id") or "landing")[:64],
        "nicho": str(payload.get("nicho") or "landing")[:64],
        "path": str(payload.get("path") or "/")[:256],
        "user_agent": str(payload.get("user_agent") or "")[:512],
    }


def _insert(ev):
    if not SUPABASE_URL or not SVC:
        return False  # stateless
    body = json.dumps({
        "tenant_id": ev["tenant_id"],
        "nicho": ev["nicho"],
        "path": ev["path"],
        "user_agent": ev["user_agent"],
    }).encode("utf-8")
    req = urllib.request.Request(
        f"{SUPABASE_URL}/rest/v1/{TABLE}",
        data=body,
        headers={
            "apikey": SVC,
            "Authorization": f"Bearer {SVC}",
            "Content-Type": "application/json",
            "Prefer": "return=minimal",
        },
        method="POST",
    )
    try:
        urllib.request.urlopen(req, timeout=5)
        return True
    except Exception as e:
        sys.stderr.write(f"EVENT_INSERT_ERR {e}\n")
        return False


def _stats(dias=30):
    if not SUPABASE_URL or not SVC:
        return {"status": "stateless", "dias": dias, "total": 0}
    since = f"created_at=gte.now()-{int(dias)}d"
    # total
    try:
        req = urllib.request.Request(
            f"{SUPABASE_URL}/rest/v1/{TABLE}?{since}&select=id",
            headers={"apikey": SVC, "Authorization": f"Bearer {SVC}",
                     "Accept": "application/json"},
        )
        with urllib.request.urlopen(req, timeout=5) as r:
            rows = json.loads(r.read().decode("utf-8")) or []
        total = len(rows)
    except Exception as e:
        sys.stderr.write(f"EVENT_STATS_ERR {e}\n")
        total = 0
    # por nicho
    try:
        req2 = urllib.request.Request(
            f"{SUPABASE_URL}/rest/v1/{TABLE}?{since}&select=nicho",
            headers={"apikey": SVC, "Authorization": f"Bearer {SVC}",
                     "Accept": "application/json"},
        )
        with urllib.request.urlopen(req2, timeout=5) as r:
            rows2 = json.loads(r.read().decode("utf-8")) or []
        por_nicho = {}
        for row in rows2:
            n = row.get("nicho", "landing")
            por_nicho[n] = por_nicho.get(n, 0) + 1
    except Exception:
        por_nicho = {}
    return {"status": "ok", "dias": dias, "total": total, "por_nicho": por_nicho}


class handler(BaseHTTPRequestHandler):
    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def log_message(self, *a):
        pass

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_POST(self):
        n = int(self.headers.get("Content-Length", 0) or 0)
        raw = self.rfile.read(n) if n else b"{}"
        try:
            payload = json.loads(raw or b"{}")
        except Exception:
            payload = {}
        ev = _clean(payload)
        if not ev:
            self.send_response(400)
            self._cors()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"ok": False, "erro": "payload_invalido"}).encode())
            return
        persisted = _insert(ev)
        sys.stderr.write(f"EVENT {ev['tenant_id']}/{ev['nicho']} persisted={persisted}\n")
        self.send_response(200)
        self._cors()
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps({"ok": True, "persisted": persisted}).encode() if False else
                         json.dumps({"ok": True, "persisted": persisted}).encode())

    def do_GET(self):
        # /api/v1/events?dias=30
        qs = self.path.split("?", 1)[1] if "?" in self.path else ""
        dias = 30
        try:
            for kv in qs.split("&"):
                if kv.startswith("dias="):
                    dias = max(1, min(365, int(kv.split("=", 1)[1])))
        except Exception:
            pass
        data = _stats(dias)
        self.send_response(200)
        self._cors()
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())
