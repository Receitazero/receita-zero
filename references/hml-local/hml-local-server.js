#!/usr/bin/env node
/**
 * HML LOCAL da Vitrine Certa — 100% offline, sem Supabase, sem Mercado Pago.
 *
 * Por que existe: o Supabase Sandbox (pcaemtalylngfzoghbkm) foi DELETADO e a anon
 * key do projeto VC no repo esta mascarada ('eyJhbG...X3YU'). Testar o HML contra o
 * PRD significaria cobranca real. Este servidor entrega o mesmo fluxo sem rede.
 *
 * NAO EDITA NENHUM HTML DO REPO. A troca dos <script> de Supabase pelo shim local
 * acontece em tempo de resposta (stream), entao o PRD fica byte-identico no disco.
 *
 * Uso:  node references/hml-local/hml-local-server.js [--porta 8788]
 *       http://127.0.0.1:8788/hml/index.html
 */

'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const RAIZ = path.resolve(__dirname, '..', '..');
const SHIM = path.join(__dirname, 'vc-auth-local.js');

const args = process.argv.slice(2);
const PORTA = Number((args[args.indexOf('--porta') + 1] || '').match(/^\d+$/) ? args[args.indexOf('--porta') + 1] : 8788);

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon',
  '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8'
};

// ---------------------------------------------------------------- estado local
const estado = { cobrancas: [], eventos: [] };
const PLANOS = { basico: 49, plus: 99, premium: 149 };

// ------------------------------------------------------- reescrita de HTML
// Troca os 3 scripts de Supabase pelo shim local e reaponta a API do Avanca
// para este proprio servidor. Puramente em memoria.
function reescreverHtml(html) {
  let out = html;

  // 1. mata o CDN do Supabase (nao ha rede no HML local)
  out = out.replace(
    /<script[^>]*src="https:\/\/cdn\.jsdelivr\.net\/npm\/@supabase\/supabase-js@2"[^>]*><\/script>\s*/g,
    ''
  );
  // 2. config + auth reais -> shim local (mantem o contrato window.VC_AUTH)
  out = out.replace(
    /<script[^>]*src="supabase-config\.js"[^>]*><\/script>\s*/g,
    ''
  );
  out = out.replace(
    /<script[^>]*src="supabase-auth\.js"[^>]*><\/script>/g,
    '<script src="/__hml/vc-auth-local.js"></script>'
  );
  // 3. API do Avanca (PRD, cobranca real) -> mock local
  out = out.replace(
    /data-api-url="https:\/\/[^"]*\/api\/v1\/vc-checkout"/g,
    'data-api-url="/api/v1/vc-checkout"'
  );
  out = out.replace(
    /https:\/\/saas-confianca-cobranca[a-z0-9-]*\.vercel\.app/g,
    ''
  );
  return out;
}

function enviarJson(res, codigo, corpo) {
  const b = Buffer.from(JSON.stringify(corpo), 'utf8');
  res.writeHead(codigo, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': b.length,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
  });
  res.end(b);
}

function lerCorpo(req) {
  return new Promise((resolve) => {
    let d = '';
    req.on('data', (c) => { d += c; if (d.length > 1e6) req.destroy(); });
    req.on('end', () => { try { resolve(JSON.parse(d || '{}')); } catch (e) { resolve({}); } });
  });
}

// --------------------------------------------------------------- API mock
async function rotaCheckout(req, res) {
  const body = await lerCorpo(req);
  const plano = String(body.plano || '').toLowerCase();
  if (!PLANOS[plano]) return enviarJson(res, 400, { erro: 'plano invalido (basico|plus|premium)' });
  if (!body.pme_email) return enviarJson(res, 400, { erro: 'pme_email obrigatorio' });

  const subId = crypto.randomBytes(16).toString('hex');
  const cob = {
    id: crypto.randomUUID(),
    subscription_id: subId,
    tenant_id: 'local-vitrinecerta',
    valor: PLANOS[plano],
    status: 'pendente',
    plano,
    pme_email: body.pme_email,
    pme_nome: body.pme_nome || '',
    payment_method: body.payment_method || 'pix_auto',
    criado_em: new Date().toISOString()
  };
  estado.cobrancas.push(cob);

  // "MP" local: uma pagina que simula aprovar/recusar (nunca cobra nada)
  enviarJson(res, 200, {
    subscription_id: subId,
    cobranca_id: cob.id,
    status: 'pending',
    redirect_url: `/__hml/mp-simulado.html?sub=${subId}&valor=${cob.valor}&plano=${plano}`,
    pme_id: body.pme_email,
    plano,
    payment_method: cob.payment_method
  });
}

// simula o webhook do MP chegando no Avanca e o Avanca avisando a VC (P9)
async function rotaSimularPagamento(req, res) {
  const body = await lerCorpo(req);
  const cob = estado.cobrancas.find((c) => c.subscription_id === body.subscription_id);
  if (!cob) return enviarJson(res, 404, { erro: 'assinatura nao encontrada' });

  cob.status = body.aprovar === false ? 'falhou' : 'pago';
  const evento = {
    id: crypto.randomUUID(),
    evento: cob.status === 'pago' ? 'subscription.activated' : 'subscription.failed',
    subscription_id: cob.subscription_id,
    pme_email: cob.pme_email,
    plano: cob.plano,
    valor: cob.valor,
    criado_em: new Date().toISOString()
  };
  estado.eventos.push(evento);
  enviarJson(res, 200, { ok: true, status: cob.status, evento: evento.evento });
}

const servidor = http.createServer(async (req, res) => {
  const u = new URL(req.url, `http://127.0.0.1:${PORTA}`);
  const rota = decodeURIComponent(u.pathname);

  if (req.method === 'OPTIONS') { res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*' }); return res.end(); }

  // ---- API local do "Avanca"
  if (rota === '/api/v1/vc-checkout' && req.method === 'POST') return rotaCheckout(req, res);
  if (rota === '/__hml/pagar' && req.method === 'POST') return rotaSimularPagamento(req, res);
  if (rota === '/__hml/estado') return enviarJson(res, 200, estado);

  // ---- shim de auth
  if (rota === '/__hml/vc-auth-local.js') {
    const js = fs.readFileSync(SHIM);
    res.writeHead(200, { 'Content-Type': MIME['.js'], 'Content-Length': js.length });
    return res.end(js);
  }
  // ---- pagina do "Mercado Pago" simulado
  if (rota === '/__hml/mp-simulado.html') {
    const p = path.join(__dirname, 'mp-simulado.html');
    const h = fs.readFileSync(p);
    res.writeHead(200, { 'Content-Type': MIME['.html'], 'Content-Length': h.length });
    return res.end(h);
  }

  // ---- estaticos do repo (com reescrita em HTML)
  let alvo = path.join(RAIZ, rota === '/' ? '/hml/index.html' : rota);
  if (!alvo.startsWith(RAIZ)) { res.writeHead(403); return res.end('fora da raiz'); }
  if (fs.existsSync(alvo) && fs.statSync(alvo).isDirectory()) alvo = path.join(alvo, 'index.html');
  if (!fs.existsSync(alvo)) { res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('404 ' + rota); }

  const ext = path.extname(alvo).toLowerCase();
  if (ext === '.html') {
    const html = reescreverHtml(fs.readFileSync(alvo, 'utf8'));
    const b = Buffer.from(html, 'utf8');
    res.writeHead(200, { 'Content-Type': MIME['.html'], 'Content-Length': b.length });
    return res.end(b);
  }
  const buf = fs.readFileSync(alvo);
  res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Content-Length': buf.length });
  res.end(buf);
});

servidor.listen(PORTA, '127.0.0.1', () => {
  console.log(`HML LOCAL no ar  ->  http://127.0.0.1:${PORTA}/hml/index.html`);
  console.log('sem Supabase, sem Mercado Pago, sem cobranca real. Ctrl+C encerra.');
});
