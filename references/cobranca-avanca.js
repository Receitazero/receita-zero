#!/usr/bin/env node
/**
 * Vitrine Certa — Cobrança Avança (MP Pix Automático + Cartão + Boleto + PIX QR)
 * ============================================================================
 * Módulo Node SEM dependência externa (https nativo).
 *
 * Vitrine Certa NUNCA toca Mercado Pago diretamente — sempre via Avança API.
 * Este módulo é o único ponto de entrada para criar assinaturas no Avança.
 *
 * API contract (Avança → Vitrine Certa):
 *   POST /api/v1/subscriptions
 *   { plano: string, pme_id: string, payment_method: 'pix_auto'|'credit_card'|'boleto'|'pix_qr' }
 *
 * Webhook contract (Avança → Vitrine Certa):
 *   subscription.activated, subscription.failed, payment.confirmed, subscription.suspended
 *
 * Token lido de ~/.secrets/avanca-api-token (NUNCA logado).
 * API URL via env AVANCA_API_URL (default: https://api.avanca.com.br).
 *
 * CLI:
 *   node references/cobranca-avanca.js probe                                   # GET read-only
 *   node references/cobranca-avanca.js assinatura <plano> <pme_id> <metodo> [--dry-run]
 *   node references/cobranca-avanca.js status <subscription_id>
 *   node references/cobranca-avanca.js retry <subscription_id>
 *
 * ⚠️ POSTs reais criam cobrança de verdade — use --dry-run até ter cliente real.
 */
'use strict';

const https = require('https');
const fs = require('fs');
const path = require('path');
const os = require('os');

// ===== Configuração =====
const API_URL = process.env.AVANCA_API_URL || 'https://api.avanca.com.br';
const API_BASE = API_URL.replace(/\/+$/, ''); // remove trailing slash

// Matriz canônica (docs/COBRANCA-AVANCA.md §1)
const PLANOS = {
  basico:  { valor: 49.0,  label: 'Básico' },
  plus:    { valor: 99.0,  label: 'Plus' },
  premium: { valor: 149.0, label: 'Premium' },
};

// Métodos de pagamento (API contract)
const METODOS = {
  pix_auto:    { label: 'Pix Automático',  recorrente: true  },
  credit_card: { label: 'Cartão de Crédito', recorrente: true },
  boleto:      { label: 'Boleto Bancário',  recorrente: true },
  pix_qr:      { label: 'PIX QR',          recorrente: false },
};

// ===== Token =====
function lerToken() {
  const p = path.join(os.homedir(), '.secrets', 'avanca-api-token');
  try {
    const t = fs.readFileSync(p, 'utf8').trim();
    if (!t) throw new Error('token vazio em ~/.secrets/avanca-api-token');
    return t;
  } catch (e) {
    throw new Error('Token Avança não encontrado em ~/.secrets/avanca-api-token. ' +
      'Configure AVANCA_API_TOKEN no cofre.');
  }
}

// ===== HTTP =====
function req(method, urlPath, body) {
  const token = lerToken();
  const url = new URL(API_BASE + urlPath);
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const r = https.request(
      {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname + url.search,
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-Tenant-Id': process.env.VITRINE_CERTA_TENANT_ID || 'vitrine-certa',
          ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
        },
      },
      (res) => {
        let buf = '';
        res.on('data', (c) => (buf += c));
        res.on('end', () => {
          let json = null;
          try { json = JSON.parse(buf); } catch (_) { /* texto cru */ }
          resolve({ status: res.statusCode, body: json ?? buf });
        });
      }
    );
    r.on('error', reject);
    if (data) r.write(data);
    r.end();
  });
}

// ===== Payloads =====
function payloadAssinatura(plano, pmeId, paymentMethod) {
  const p = PLANOS[plano];
  if (!p) throw new Error(`plano inválido: ${plano} (use ${Object.keys(PLANOS).join('|')})`);
  const m = METODOS[paymentMethod];
  if (!m) throw new Error(`payment_method inválido: ${paymentMethod} (use ${Object.keys(METODOS).join('|')})`);
  if (!pmeId) throw new Error('pme_id é obrigatório');

  return {
    plano: plano,
    pme_id: pmeId,
    payment_method: paymentMethod,
  };
}

// ===== API pública do módulo =====
async function criarAssinatura(plano, pmeId, paymentMethod, opts = {}) {
  const payload = payloadAssinatura(plano, pmeId, paymentMethod);
  if (opts.dryRun) {
    console.log('[DRY-RUN] POST /api/v1/subscriptions →');
    console.log(JSON.stringify(payload, null, 2));
    return { dryRun: true, payload };
  }
  return req('POST', '/api/v1/subscriptions', payload);
}

async function consultarStatus(subscriptionId) {
  return req('GET', `/api/v1/subscriptions/${encodeURIComponent(subscriptionId)}`);
}

async function retry(subscriptionId) {
  return req('POST', `/api/v1/subscriptions/${encodeURIComponent(subscriptionId)}/retry`);
}

async function webhookFalha(subscriptionId, errorDetail) {
  return req('POST', `/api/v1/subscriptions/${encodeURIComponent(subscriptionId)}/webhook-falha`, {
    error: errorDetail || 'unknown',
  });
}

async function probe() {
  const health = await req('GET', '/health');
  console.log(`GET /health → HTTP ${health.status}` +
    (health.body && health.body.status ? ` (${health.body.status})` : ''));
  return { health: health.status };
}

module.exports = {
  criarAssinatura,
  consultarStatus,
  retry,
  webhookFalha,
  probe,
  PLANOS,
  METODOS,
  API_BASE,
};

// ===== CLI =====
if (require.main === module) {
  const argv = process.argv.slice(2);
  const dryRun = argv.includes('--dry-run');
  const args = argv.filter((a) => a !== '--dry-run');
  const [cmd, a1, a2, a3] = args;

  (async () => {
    switch (cmd) {
      case 'probe': {
        const r = await probe();
        const ok = r.health === 200;
        console.log(ok ? '✅ PROBE_OK (200)' : '❌ PROBE_FAIL');
        process.exit(ok ? 0 : 1);
      }
      case 'assinatura': {
        // assinatura <plano> <pme_id> <payment_method> [--dry-run]
        const r = await criarAssinatura(a1, a2, a3, { dryRun });
        if (!r.dryRun) console.log(`HTTP ${r.status}`, JSON.stringify(r.body, null, 2));
        break;
      }
      case 'status': {
        const r = await consultarStatus(a1);
        console.log(`HTTP ${r.status}`, JSON.stringify(r.body, null, 2));
        break;
      }
      case 'retry': {
        const r = await retry(a1);
        console.log(`HTTP ${r.status}`, JSON.stringify(r.body, null, 2));
        break;
      }
      default:
        console.log('uso: cobranca-avanca.js probe | assinatura <plano> <pme_id> <metodo> [--dry-run] | status <id> | retry <id>');
        console.log('planos: ' + Object.keys(PLANOS).join(' | '));
        console.log('metodos: ' + Object.keys(METODOS).join(' | '));
        process.exit(2);
    }
  })().catch((e) => {
    console.error('ERRO:', e.message);
    process.exit(1);
  });
}
