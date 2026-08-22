#!/usr/bin/env node
/**
 * agenda-reconciliacao.js — Vitrine Certa / Integracao · operacao continua (Mes 3).
 *
 * O Mes 2 entregou a RECONCILIACAO (reconciliacao-vc-avanca.js) e a
 * OBSERVABILIDADE (observabilidade-webhook.js). Este script as tranforma em
 * rotina: a cada intervalo, relê as duas verdades (Avanca pagos x VC liberados)
 * e o log do webhook, e emite um relatorio JSON + alerta estruturado.
 *
 * SEM rede: fontes sao arquivos locais. Em producao, quem popula esses arquivos
 * e' gate humano (um job que exporta de cada Supabase) — aqui so consumimos.
 *
 * Uso:
 *   node references/agenda-reconciliacao.js --uma-vez \
 *       --avanca avanca.json --vc vc.json [--log webhook.jsonl]
 *   node references/agenda-reconciliacao.js --loop --minutos 60 ...   # fica rodando
 *
 * Exit code 1 se houver divergencia CRITICA ou webhook falhando.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { reconciliar } = require('./reconciliacao-vc-avanca');
const { painelSaude, detectarFalhaWebhook } = require('./observabilidade-webhook');

function lerJson(arq) {
  try { return JSON.parse(fs.readFileSync(arq, 'utf8')); } catch (e) { return null; }
}

function rodar({ avanca, vc, log }) {
  const out = { ts: new Date().toISOString(), criticas: 0, alertas: [] };

  if (avanca && vc) {
    const r = reconciliar(lerJson(avanca) || [], lerJson(vc) || []);
    out.reconciliacao = r.resumo;
    out.criticas = r.criticas.length;
    if (r.criticas.length) out.alertas.push({
      tipo: 'pago_sem_site_liberado', severidade: 'critica',
      mensagem: `${r.criticas.length} PME(s) pagaram e nao receberam o site.`,
    });
  }

  if (log) {
    const falha = detectarFalhaWebhook(log);
    out.webhook = { erros: painelSaude(log).erros, tem_alerta: falha.tem_alerta };
    if (falha.tem_alerta) out.alertas.push(...falha.alertas.map((a) => ({
      tipo: a.tipo, severidade: a.severidade, mensagem: a.mensagem,
    })));
  }

  out.status = out.criticas > 0 || out.alertas.some((a) => a.severidade === 'critica')
    ? 'CRITICO' : (out.alertas.length ? 'ALERTA' : 'OK');
  return out;
}

function main() {
  const args = process.argv.slice(2);
  const avanca = args[args.indexOf('--avanca') + 1];
  const vc = args[args.indexOf('--vc') + 1];
  const log = args[args.indexOf('--log') + 1];
  const loop = args.includes('--loop');
  const minutos = Number(args[args.indexOf('--minutos') + 1]) || 60;

  const emitir = () => {
    const out = rodar({ avanca, vc, log });
    process.stdout.write(JSON.stringify(out) + '\n');
    return out.status === 'CRITICO' ? 1 : 0;
  };

  if (loop) {
    console.log(`[agenda] loop a cada ${minutos}min (Ctrl+C para parar)`);
    emitir();
    const id = setInterval(emitir, minutos * 60 * 1000);
    process.on('SIGINT', () => { clearInterval(id); console.log('\n[agenda] encerrado'); process.exit(0); });
  } else {
    process.exit(emitir());
  }
}

if (require.main === module) main();
