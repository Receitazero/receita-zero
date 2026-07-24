// sheets-atlas-bridge.js — Vitrine Certa · Semana 3 (antecipada)
// Ponte Sheets → ATLAS F1 (Receptionist).
// Fluxo: linha nova na planilha de leads (docs/LEADS-SHEETS.md) → POST /lead aqui
// → traduz p/ payload Z-API-like → POST http://localhost:8080/webhook (ATLAS F1)
// → registra resposta em lead-engine/bridge-log.jsonl.
//
// Modos:
//   node references/sheets-atlas-bridge.js              # servidor na :8737 (escuta POST /lead do Apps Script)
//   node references/sheets-atlas-bridge.js --mock       # teste E2E com 1 lead fake + stub local do ATLAS
//   ATLAS_URL=http://host:8080/webhook ...              # override do endpoint F1
//
// Sem secrets aqui: o ATLAS local é quem tem NIM/Z-API. Este bridge só encaminha.

const http = require('http');
const fs = require('fs');
const path = require('path');

const ATLAS_URL = process.env.ATLAS_URL || 'http://127.0.0.1:8080/webhook';
const PORT = parseInt(process.env.BRIDGE_PORT || '8737', 10);
const LOG = path.join(__dirname, '..', 'lead-engine', 'bridge-log.jsonl');

function normalizaWhats(w) {
  const d = String(w || '').replace(/\D/g, '');
  return d.startsWith('55') ? d : '55' + d;
}

// Linha da planilha (docs/LEADS-SHEETS.md) → payload que o webhook_zapi.py entende
// (_extrai_mensagem lê payload.phone + payload.text.message)
function leadToAtlasPayload(lead) {
  return {
    phone: normalizaWhats(lead.whatsapp),
    text: {
      message:
        `[VITRINE CERTA · lead ${lead.origem || 'sheets'}] ` +
        `${lead.nome || 'sem nome'} · nicho=${lead.nicho || '?'} · ` +
        `status=${lead.status || 'novo'}` +
        (lead.site_gerado ? ` · site=${lead.site_gerado}` : ''),
    },
    fromMe: false,
    tenant: 'vitrinecerta',
  };
}

function postJson(url, body) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const data = JSON.stringify(body);
    const req = http.request(
      { hostname: u.hostname, port: u.port, path: u.pathname, method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } },
      (res) => {
        let buf = '';
        res.on('data', (c) => (buf += c));
        res.on('end', () => resolve({ status: res.statusCode, body: buf }));
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function logLine(obj) {
  fs.mkdirSync(path.dirname(LOG), { recursive: true });
  fs.appendFileSync(LOG, JSON.stringify({ ts: new Date().toISOString(), ...obj }) + '\n');
}

async function encaminhaLead(lead, atlasUrl) {
  const payload = leadToAtlasPayload(lead);
  const resp = await postJson(atlasUrl || ATLAS_URL, payload);
  logLine({ lead, payload, atlas_status: resp.status, atlas_body: resp.body.slice(0, 500) });
  return resp;
}

// ---- modo servidor: escuta POST /lead (gatilho do Apps Script) ----
function startServer() {
  const srv = http.createServer(async (req, res) => {
    if (req.method === 'POST' && req.url === '/lead') {
      let buf = '';
      req.on('data', (c) => (buf += c));
      req.on('end', async () => {
        try {
          const lead = JSON.parse(buf);
          const r = await encaminhaLead(lead);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: true, atlas_status: r.status }));
        } catch (e) {
          res.writeHead(500);
          res.end(JSON.stringify({ ok: false, error: String(e) }));
        }
      });
    } else if (req.url === '/health') {
      res.writeHead(200); res.end('ok');
    } else { res.writeHead(404); res.end(); }
  });
  srv.listen(PORT, () => console.log(`bridge ouvindo :${PORT} → ${ATLAS_URL}`));
}

// ---- modo mock: sobe stub do ATLAS local e roda 1 lead fake fim-a-fim ----
async function runMock() {
  const stub = http.createServer((req, res) => {
    let buf = '';
    req.on('data', (c) => (buf += c));
    req.on('end', () => {
      console.log('[stub ATLAS F1] recebeu:', buf);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, sent: true, modo: 'stub-f1', qualificado: true }));
    });
  });
  await new Promise((r) => stub.listen(18080, r));
  const leadFake = {
    nome: 'Pizzaria do João (FAKE/QA)', nicho: 'pizzaria',
    whatsapp: '11999998888', origem: 'gerador', status: 'novo',
    site_gerado: '', data: new Date().toISOString(),
  };
  const resp = await encaminhaLead(leadFake, 'http://127.0.0.1:18080/webhook');
  console.log('[bridge] resposta ATLAS(stub):', resp.status, resp.body);
  stub.close();
  console.log('[bridge] log gravado em', LOG);
  console.log(resp.status === 200 ? 'BRIDGE_MOCK_OK' : 'BRIDGE_MOCK_FAIL');
  process.exit(resp.status === 200 ? 0 : 1);
}

if (require.main === module) {
  if (process.argv.includes('--mock')) runMock();
  else startServer();
}
module.exports = { leadToAtlasPayload, encaminhaLead };
