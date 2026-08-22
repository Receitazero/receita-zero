#!/usr/bin/env node
/**
 * observabilidade-webhook.js — Mês 2 da Integracao VC x Avanca.
 *
 * Tudo LOCAL, sem rede. Tres funcoes puras (facil de testar) sobre o log
 * JSONL do receptor references/avanca-webhook.js:
 *   1. painelSaude(logPath)         -> total, taxa de erro, ultimos N, idade
 *   2. detectarFalhaWebhook(logPath)-> alerta se 2+ falhas consecutivas p/ destino
 *   3. (o painel e' servido em GET /__hml/saude pelo servidor abaixo)
 *
 * A ENTREGA do alerta via Telegram e' gate humano: as funcoes preparam o
 * payload estruturado, mas NAO enviam nada.
 */
'use strict';
const fs = require('fs');
const http = require('http');
const path = require('path');

function lerLog(logPath) {
  try {
    return fs.readFileSync(logPath, 'utf8').split('\n').filter(Boolean).map((l) => {
      try { return JSON.parse(l); } catch { return null; }
    }).filter(Boolean);
  } catch { return []; }
}

function idadeMs(ultimoTs, agora = Date.now()) {
  if (!ultimoTs) return null;
  const t = new Date(ultimoTs).getTime();
  return Number.isNaN(t) ? null : agora - t;
}

function painelSaude(logPath, { ultimos = 20, agora = Date.now() } = {}) {
  const linhas = lerLog(logPath);
  const total = linhas.length;
  const erros = linhas.filter((l) => l.status && l.status >= 400);
  const taxaErro = total > 0 ? Math.round((erros.length / total) * 1000) / 10 : 0;
  const ultimosEventos = linhas.slice(-ultimos).map((l) => ({
    ts: l.ts,
    evento: l.evento || l.evento_tipo || null,
    status: l.status ?? null,
    destino: l.destino ?? null,
    erro: l.erro ?? null,
  }));
  const ultimo = linhas.length ? linhas[linhas.length - 1].ts : null;
  return {
    total,
    erros: erros.length,
    taxa_erro: taxaErro,
    ultimo_evento_em: ultimo,
    ultimo_evento_ha_ms: idadeMs(ultimo, agora),
    ultimos_eventos: ultimosEventos,
  };
}

// Alerta se houver 2+ falhas (status>=400) CONSECUTIVAS para o MESMO destino.
function detectarFalhaWebhook(logPath, { limite = 2, agora = Date.now() } = {}) {
  const linhas = lerLog(logPath);
  const porDestino = new Map();
  let atual = 0;
  for (const l of linhas) {
    const dest = l.destino ?? '(sem destino)';
    const falhou = (l.status ?? 0) >= 400;
    if (falhou) atual++;
    else atual = 0;
    if (atual >= limite) porDestino.set(dest, { falhas_consecutivas: atual, desde: l.ts });
  }
  const alertas = [...porDestino.entries()].map(([destino, info]) => ({
    tipo: 'webhook_falhando',
    destino,
    falhas_consecutivas: info.falhas_consecutivas,
    primeiro_erro_em: info.desde,
    detectado_em: new Date(agora).toISOString(),
    severidade: info.falhas_consecutivas >= 5 ? 'critica' : 'alta',
    // payload pronto para envio (Telegram e' gate humano — NAO enviamos aqui)
    mensagem: `Webhook para ${destino} falhou ${info.falhas_consecutivas}x seguidas (desde ${info.desde}).`,
  }));
  return { alertas, tem_alerta: alertas.length > 0 };
}

// ===== Servidor de saude (roda apenas em HML local) =====
const LOG_PATH = process.env.AVANCA_WEBHOOK_LOG || path.join(__dirname, '..', 'lead-engine', 'bridge-log.jsonl');

function iniciarServidorSaude(porta = 8799) {
  const srv = http.createServer((req, res) => {
    if (req.url && req.url.startsWith('/__hml/saude')) {
      const painel = painelSaude(LOG_PATH);
      const falha = detectarFalhaWebhook(LOG_PATH);
      res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ ...painel, falha_webhook: falha }, null, 2));
      return;
    }
    res.writeHead(404); res.end('not found');
  });
  srv.listen(porta, () => console.log(`[saude] ouvindo em http://localhost:${porta}/__hml/saude`));
  return srv;
}

if (require.main === module && process.argv.includes('--servir')) {
  iniciarServidorSaude(Number(process.env.AVANCA_SAUDE_PORT || 8799));
}

module.exports = { painelSaude, detectarFalhaWebhook, lerLog };
