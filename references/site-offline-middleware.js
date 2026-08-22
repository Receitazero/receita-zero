#!/usr/bin/env node
/**
 * site-offline-middleware.js — Middleware de site offline (Vitrine Certa)
 * ========================================================================
 * Verifica o status da assinatura no Avança API e retorna 503 se suspensa.
 *
 * Arquitetura:
 *   - Avança retorna subscription status (ATIVO / SUSPENSO / INADIMPLENTE)
 *   - Vitrine Certa middleware verifica e retorna 503 se suspensa
 *   - Vitrine Certa NUNCA toca MP diretamente — sempre via Avança API
 *
 * Modos:
 *   1. Express middleware (importar e usar em app.use)
 *   2. Standalone (node references/site-offline-middleware.js --check <pme_id>)
 *   3. Mock (node references/site-offline-middleware.js --mock)
 *
 * Uso (Express):
 *   const offline = require('./references/site-offline-middleware.js');
 *   app.use('/site/:pme_id', offline.middleware());
 *
 * Uso (standalone):
 *   node references/site-offline-middleware.js --check pme-123
 *   node references/site-offline-middleware.js --mock
 */
'use strict';

const https = require('https');
const fs = require('fs');
const path = require('path');
const os = require('os');

// ===== Configuração =====
const API_URL = process.env.AVANCA_API_URL || 'https://api.avanca.com.br';
const API_BASE = API_URL.replace(/\/+$/, '');
const CACHE_TTL = parseInt(process.env.OFFLINE_CACHE_TTL || '300', 10); // 5 min cache

// Status que bloqueiam o acesso
const STATUS_BLOQUEIO = ['SUSPENSO', 'INADIMPLENTE', 'CANCELADO'];

// ===== Token =====
function lerToken() {
  try {
    return fs.readFileSync(
      path.join(os.homedir(), '.secrets', 'avanca-api-token'), 'utf8'
    ).trim();
  } catch (e) {
    throw new Error('Token Avança não encontrado em ~/.secrets/avanca-api-token');
  }
}

// ===== Cache em memória =====
const cache = new Map();
function cacheGet(pmeId) {
  const entry = cache.get(pmeId);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL * 1000) {
    cache.delete(pmeId);
    return null;
  }
  return entry;
}
function cacheSet(pmeId, data) {
  cache.set(pmeId, { ...data, ts: Date.now() });
}

// ===== Consulta status no Avança =====
async function consultarStatus(pmeId) {
  // Verifica cache primeiro
  const cached = cacheGet(pmeId);
  if (cached) return cached;

  const token = lerToken();
  const url = new URL(API_BASE + `/api/v1/subscriptions/${encodeURIComponent(pmeId)}/status`);

  return new Promise((resolve, reject) => {
    const r = https.request(
      {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-Tenant-Id': process.env.VITRINE_CERTA_TENANT_ID || 'vitrine-certa',
        },
      },
      (res) => {
        let buf = '';
        res.on('data', (c) => (buf += c));
        res.on('end', () => {
          let json = null;
          try { json = JSON.parse(buf); } catch (_) {}
          const status = json?.status || json?.subscription?.status || 'UNKNOWN';
          const result = { status, raw: json, httpStatus: res.statusCode };
          cacheSet(pmeId, result);
          resolve(result);
        });
      }
    );
    r.on('error', reject);
    r.end();
  });
}

// ===== Express middleware =====
function middleware(options = {}) {
  const { pmeIdParam = 'pme_id', allowOverride = false } = options;

  return async function(req, res, next) {
    // Se allowOverride e query ?offline=bypass, pula verificação (modo dev)
    if (allowOverride && req.query && req.query.offline === 'bypass') {
      return next();
    }

    const pmeId = req.params[pmeIdParam] || req.query[pmeIdParam];
    if (!pmeId) {
      return next(); // sem pme_id, deixa passar (página pública)
    }

    try {
      const result = await consultarStatus(pmeId);
      if (STATUS_BLOQUEIO.includes(result.status)) {
        // Site offline — retorna 503
        res.statusCode = 503;
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Retry-After', '3600');
        res.end(
          '<!DOCTYPE html><html><head><title>Site temporariamente offline</title>' +
          '<meta name="viewport" content="width=device-width,initial-scale=1">' +
          '<style>body{font-family:system-ui,sans-serif;text-align:center;padding:4rem;background:#f9fafb;color:#333}' +
          'h1{color:#1C6E6A}h2{color:#666;margin-top:1rem}</style></head>' +
          '<body><h1>Site temporariamente offline</h1>' +
          '<p>O pagamento da assinatura está pendente ou suspensa.</p>' +
          '<h2>Entre em contato:</h2>' +
          '<p><a href="https://wa.me/5511970776856">WhatsApp (55) 11 97077-6856</a></p>' +
          '</body></html>'
        );
        return;
      }
      next();
    } catch (e) {
      // Em caso de erro na API, loga mas deixa passar (fail-open)
      console.error('[offline-middleware] erro ao consultar Avança:', e.message);
      next();
    }
  };
}

// ===== Mock =====
function runMock() {
  const pmeId = process.argv[3] || 'pme-123';
  const status = process.argv[4] || 'ATIVO';
  const mockResult = { status, raw: { subscription: { status } }, httpStatus: 200 };
  cacheSet(pmeId, mockResult);

  console.log('='.repeat(64));
  console.log('  SITE OFFLINE MIDDLEWARE — MOCK');
  console.log('='.repeat(64));
  console.log(`pme_id: ${pmeId}`);
  console.log(`status: ${status}`);
  console.log(`bloqueado: ${STATUS_BLOQUEIO.includes(status)}`);

  if (STATUS_BLOQUEIO.includes(status)) {
    console.log('→ 503 Service Unavailable (site offline)');
    console.log('SITE_OFFLINE_MOCK_503');
  } else {
    console.log('→ 200 OK (site ativo)');
    console.log('SITE_OFFLINE_MOCK_200');
  }
  console.log('='.repeat(64));
  process.exit(0);
}

// ===== CLI =====
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args[0] === '--mock') {
    runMock();
  } else if (args[0] === '--check') {
    const pmeId = args[1];
    if (!pmeId) {
      console.error('uso: --check <pme_id>');
      process.exit(2);
    }
    (async () => {
      try {
        const result = await consultarStatus(pmeId);
        console.log(`pme_id: ${pmeId}`);
        console.log(`status: ${result.status}`);
        console.log(`http: ${result.httpStatus}`);
        if (STATUS_BLOQUEIO.includes(result.status)) {
          console.log('→ 503 (site offline)');
          process.exit(0);
        } else {
          console.log('→ 200 (site ativo)');
          process.exit(0);
        }
      } catch (e) {
        console.error('ERRO:', e.message);
        process.exit(1);
      }
    })();
  } else {
    console.log('uso: site-offline-middleware.js --mock [pme_id] [status]');
    console.log('     site-offline-middleware.js --check <pme_id>');
    console.log('     (como middleware: require().middleware())');
    process.exit(2);
  }
}

module.exports = { middleware, consultarStatus, STATUS_BLOQUEIO, cacheGet, cacheSet };
