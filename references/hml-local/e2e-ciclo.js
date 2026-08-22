#!/usr/bin/env node
/**
 * e2e-ciclo.js — Simulador de ponta a ponta (HML local ↔ webhook Avança)
 * ------------------------------------------------------------------------
 * 1. Sobe o HML local (references/hml-local/hml-local-server.js) na porta 8797.
 * 2. Sobe o receptor de webhook (references/avanca-webhook.js) na porta 3001.
 * 3. Faz checkout de um plano (basico) via API do HML.
 * 4. Aprova o pagamento (simulado) via endpoint __hml/pagar.
 * 5. Captura o evento gerado (subscription.activated) do estado interno do HML.
 * 6. Assina o payload com HMAC-SHA256 usando o mesmo secret que o webhook
 *    espera (AVANCA_WEBHOOK_SECRET). Envia o POST ao receptor.
 * 7. Verifica que o receptor aceita (200 OK, result: applied).
 * 8. Reenvia o mesmo payload (mesmo event_id) e verifica idempotência
 *    (200 OK, result: duplicate, log marca como duplicado).
 * 9. Derruba ambos os servidores e sai com código 0 (sucesso) ou 1 (falha).
 *
 * O script é zero-dep; usa apenas APIs nativas do Node (http, child_process,
 * crypto, fs, path). Usa fetch (global a partir do Node 22) para chamadas HTTP.
 */
'use strict';

const { spawn } = require('child_process');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const fs = require('fs');

// ---- Configuração ----
const REPO_ROOT = path.resolve(__dirname, '..', '..'); // caminho raiz do repo
const HML_PORT = 8797;
const WEBHOOK_PORT = 3001;
const WEBHOOK_SECRET = 'e2e-test-secret-123'; // secret usado tanto para assinar quanto para o webhook
const LOCK_DIR = path.join(os.tmpdir(), 'avanca-webhook-locks-e2e-' + Date.now());
const LOG_PATH = path.join(os.tmpdir(), 'avanca-webhook-log-e2e-' + Date.now() + '.jsonl');

// Helpers de log legível. `falhas` e global de proposito: um e2e que imprime
// FALHA e ainda assim sai 0 nao serve para nada (era o bug anterior).
let falhas = 0;
function ok(label, condition, extra) {
  console.log(`${condition ? '  ok  ' : 'FALHA'} ${label}${!condition && extra ? ' -> ' + extra : ''}`);
  if (!condition) falhas++;
  return condition;
}

function fatal(msg) {
  console.error('FATAL:', msg);
  process.exit(1);
}

// ---- Inicia HML server ----
function startHmlServer() {
  const srv = spawn(process.execPath, [path.join(REPO_ROOT, 'references', 'hml-local', 'hml-local-server.js'), '--porta', String(HML_PORT)], {
    cwd: REPO_ROOT,
    stdio: 'ignore',
  });
  return srv;
}

// ---- Inicia webhook receptor ----
function startWebhookServer() {
  const env = {
    ...process.env,
    AVANCA_WEBHOOK_SECRET: WEBHOOK_SECRET,
    AVANCA_WEBHOOK_PORT: String(WEBHOOK_PORT),
    AVANCA_WEBHOOK_LOG: LOG_PATH,
    AVANCA_WEBHOOK_LOCK_DIR: LOCK_DIR,
  };
  const srv = spawn(process.execPath, [path.join(REPO_ROOT, 'references', 'avanca-webhook.js'), '--port', String(WEBHOOK_PORT)], {
    cwd: REPO_ROOT,
    env,
    stdio: 'ignore',
  });
  return srv;
}

// ---- Espera que um endpoint HTTP devolva 200 ----
async function waitFor(url, timeoutMs = 5000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const r = await fetch(url);
      if (r.ok) return true;
    } catch (_) {}
    await new Promise((res) => setTimeout(res, 100));
  }
  return false;
}

(async () => {
  // 1. Subir servidores
  const hmlSrv = startHmlServer();
  const webhookSrv = startWebhookServer();

  // Garantir encerramento ao final
  const cleanup = () => {
    try { hmlSrv.kill(); } catch (_) {}
    try { webhookSrv.kill(); } catch (_) {}
    // remover locks e log criados
    try { fs.rmSync(LOCK_DIR, { recursive: true, force: true }); } catch (_) {}
    try { fs.rmSync(LOG_PATH, { force: true }); } catch (_) {}
  };
  process.on('exit', cleanup);
  process.on('SIGINT', () => process.exit(1));
  process.on('SIGTERM', () => process.exit(1));

  // 2. Esperar readiness
  const hmlReady = await waitFor(`http://127.0.0.1:${HML_PORT}/__hml/estado`);
  const whReady = await waitFor(`http://127.0.0.1:${WEBHOOK_PORT}/health`);
  if (!hmlReady) fatal('HML server não ficou pronto a tempo');
  if (!whReady) fatal('Webhook server não ficou pronto a tempo');

  // 3. Checkout (plano basico)
  const checkoutRes = await fetch(`http://127.0.0.1:${HML_PORT}/api/v1/vc-checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plano: 'basico', pme_email: 'e2e@test.local', pme_nome: 'E2E Test', payment_method: 'pix_auto' }),
  });
  const checkoutOk = ok('checkout basico = 200', checkoutRes.status === 200, `status ${checkoutRes.status}`);
  const checkoutBody = checkoutOk ? await checkoutRes.json() : {};
  const subId = checkoutBody.subscription_id;
  ok('checkout retornou subscription_id', !!subId, 'missing');

  // 4. Aprovar pagamento
  const pagarRes = await fetch(`http://127.0.0.1:${HML_PORT}/__hml/pagar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subscription_id: subId, aprovar: true }),
  });
  const pagarOk = ok('pagar -> pago', pagarRes.status === 200, `status ${pagarRes.status}`);
  const pagarBody = pagarOk ? await pagarRes.json() : {};
  ok('pagar status = pago', pagarBody.status === 'pago', pagarBody.status);
  ok('pagar evento = subscription.activated', pagarBody.evento === 'subscription.activated', pagarBody.evento);

  // 5. Capturar evento gerado no HML
  const estadoRes = await fetch(`http://127.0.0.1:${HML_PORT}/__hml/estado`);
  const estado = await estadoRes.json();
  const ultimoEvento = estado.eventos[estado.eventos.length - 1];
  ok('evento capturado no HML', !!ultimoEvento && ultimoEvento.evento === 'subscription.activated');

  // 6. Preparar payload para webhook
  const payload = {
    event: ultimoEvento.evento,
    event_id: ultimoEvento.id,
    subscription_id: ultimoEvento.subscription_id,
    pme_id: ultimoEvento.pme_email,
    // opcional: data extra
  };
  const payloadStr = JSON.stringify(payload);
  const signature = crypto.createHmac('sha256', WEBHOOK_SECRET).update(payloadStr).digest('hex');

  // 7. Enviar ao webhook (primeira vez)
  const whRes1 = await fetch(`http://127.0.0.1:${WEBHOOK_PORT}/webhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-vc-signature': signature },
    body: payloadStr,
  });
  const whOk1 = ok('webhook primeira chamada = 200', whRes1.status === 200, `status ${whRes1.status}`);
  const whBody1 = whOk1 ? await whRes1.json() : {};
  ok('webhook result applied', whBody1.result === 'applied', whBody1.result);

  // 8. Reenviar mesmo payload (duplicado)
  const whRes2 = await fetch(`http://127.0.0.1:${WEBHOOK_PORT}/webhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-vc-signature': signature },
    body: payloadStr,
  });
  const whOk2 = ok('webhook segunda chamada (duplicado) = 200', whRes2.status === 200, `status ${whRes2.status}`);
  const whBody2 = whOk2 ? await whRes2.json() : {};
  ok('webhook result duplicate', whBody2.result === 'duplicate', whBody2.result);

  // 9. Verificar log JSONL (opcional, mas garante que is_duplicado foi marcado)
  try {
    const logLines = fs.readFileSync(LOG_PATH, 'utf8').trim().split('\n').filter(Boolean).map(l => JSON.parse(l));
    const first = logLines.find(l => l.event_id === payload.event_id && !l.is_duplicado);
    const second = logLines.find(l => l.event_id === payload.event_id && l.is_duplicado);
    ok('log contém entrada não duplicada', !!first);
    ok('log contém entrada duplicada', !!second);
  } catch (e) {
    ok('log JSONL legível', false, e.message);
  }

  // 10. Encerrar servidores e sair
  console.log(falhas ? `\n${falhas} FALHA(S)` : '\nE2E_CYCLE_ALL_PASS');
  process.exit(falhas ? 1 : 0);
})();
