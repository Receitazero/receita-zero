#!/usr/bin/env node
/**
 * teste-observabilidade.js — exercita as 3 funcoes do Mês 2 da Integracao
 * com dados sinteticos e sai com exit code correto (1 se houver falha).
 */
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { painelSaude, detectarFalhaWebhook } = require('../observabilidade-webhook');
const { reconciliar } = require('../reconciliacao-vc-avanca');

let falhas = 0;
function ok(label, cond, extra) {
  console.log(`${cond ? '  ok  ' : 'FALHA'} ${label}${!cond && extra ? ' -> ' + extra : ''}`);
  if (!cond) falhas++;
}

// ---- 1. Reconciliacao ----
console.log('\n== Reconciliacao VC x Avanca ==');
const avanca = [
  { pme_id: 'p1', cobranca_id: 'c1', status: 'pago', valor: 149, plano: 'premium' },
  { pme_id: 'p2', cobranca_id: 'c2', status: 'pendente', valor: 49, plano: 'basico' }, // nao pagou
  { pme_id: 'p3', cobranca_id: 'c3', status: 'ativa', valor: 99, plano: 'plus' },
];
const vc = [
  { pme_id: 'p1', site_id: 's1', liberado: false },            // CRITICO: pagou, nao liberado
  { pme_id: 'p2', site_id: 's2', liberado: false },           // ok: nao pagou, nao liberado
  { pme_id: 'p3', site_id: 's3', liberado: true, plano: 'basic' }, // DIVERGENTE: plano
  { pme_id: 'p4', site_id: 's4', liberado: true, plano: 'plus' }, // PREJUIZO: liberou, nao pagou
];
const r = reconciliar(avanca, vc);
ok('detecta pago sem site (critico)', r.criticas.length === 1 && r.criticas[0].pme_id === 'p1');
ok('detecta site liberado sem pagamento', r.prejuizo.length === 1 && r.prejuizo[0].pme_id === 'p4');
ok('detecta plano divergente', r.divergentes.length === 1 && r.divergentes[0].pme_id === 'p3');
ok('nao confunde pendente com pago', !r.criticas.some((c) => c.pme_id === 'p2'));

// ---- 2. Painel de saude ----
console.log('\n== Painel de saude (log JSONL) ==');
const tmpLog = path.join(os.tmpdir(), 'obs-test-' + Date.now() + '.jsonl');
const agora = Date.now();
const linhas = [
  { ts: new Date(agora - 300000).toISOString(), evento: 'subscription.activated', status: 200, destino: 'https://vc/x' },
  { ts: new Date(agora - 120000).toISOString(), evento: 'subscription.failed', status: 200, destino: 'https://vc/x' },
  { ts: new Date(agora - 5000).toISOString(), evento: 'subscription.activated', status: 200, destino: 'https://vc/y' },
];
fs.writeFileSync(tmpLog, linhas.map((l) => JSON.stringify(l)).join('\n') + '\n');
const painel = painelSaude(tmpLog, { agora });
ok('conta total de eventos', painel.total === 3);
ok('taxa de erro zero quando tudo 200', painel.taxa_erro === 0);
ok('ultimo evento ha ~5s', painel.ultimo_evento_ha_ms !== null && painel.ultimo_evento_ha_ms < 10000);
ok('retorna ate N ultimos', painel.ultimos_eventos.length === 3);

// log com erro -> taxa de erro sobe
const linhasErr = [...linhas, { ts: new Date(agora - 1000).toISOString(), evento: 'x', status: 500, destino: 'https://vc/x', erro: 'boom' }];
fs.writeFileSync(tmpLog, linhasErr.map((l) => JSON.stringify(l)).join('\n') + '\n');
const painelErr = painelSaude(tmpLog, { agora });
ok('taxa de erro reflete o 500', painelErr.taxa_erro === 25);

// ---- 3. Detector de webhook falhando ----
console.log('\n== Detector de webhook falhando ==');
fs.writeFileSync(tmpLog, [
  { ts: new Date(agora - 60000).toISOString(), status: 500, destino: 'https://vc/x' },
  { ts: new Date(agora - 30000).toISOString(), status: 500, destino: 'https://vc/x' }, // 2 consecutivas
  { ts: new Date(agora - 10000).toISOString(), status: 200, destino: 'https://vc/x' },
].map((l) => JSON.stringify(l)).join('\n') + '\n');
const falha = detectarFalhaWebhook(tmpLog, { agora });
ok('alerta quando 2+ falhas consecutivas', falha.tem_alerta === true);
ok('alerta aponta o destino certo', falha.alertas[0] && falha.alertas[0].destino === 'https://vc/x');
ok('mensagem de alerta montada', !!falha.alertas[0] && /falhou 2x/.test(falha.alertas[0].mensagem));

// menos de 2 -> sem alerta
fs.writeFileSync(tmpLog, [
  { ts: new Date(agora - 60000).toISOString(), status: 500, destino: 'https://vc/x' },
  { ts: new Date(agora - 30000).toISOString(), status: 200, destino: 'https://vc/x' },
].map((l) => JSON.stringify(l)).join('\n') + '\n');
ok('sem alerta abaixo do limite', detectarFalhaWebhook(tmpLog, { agora }).tem_alerta === false);

fs.rmSync(tmpLog, { force: true });
console.log(falhas ? `\n${falhas} FALHA(S)` : '\nOBSERVABILIDADE_OK');
process.exit(falhas ? 1 : 0);
