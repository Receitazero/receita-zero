#!/usr/bin/env node
/**
 * atlas-followup-mock.js — MOCK LOCAL da Fase 1 ATLAS (follow-up de lead)
 *
 * 100% LOCAL · SEM REDE · SEM API · SEM SECRET · DETERMINÍSTICO
 * ------------------------------------------------------------------
 * Lê um JSON de leads fictícios e imprime a fila de follow-up ordenada.
 *
 * Regra de prioridade:
 *   - lead com > 7 dias sem contato  => PRIORIDADE ALTA
 *   - lead com <= 7 dias sem contato => PRIORIDADE NORMAL
 *
 * A fila é ordenada: ALTA primeiro (mais antigo no topo), depois NORMAL
 * (também do mais antigo para o mais recente).
 *
 * Isto é o "esqueleto" da Fase 1 — quando as credenciais ATLAS existirem,
 * este mesmo fluxo vira a leitura real de leads (Sheets/ATLAS F1) + disparo
 * F4 (follow-up). Ver docs/FASE1-ATLAS-FOLLOWUP.md.
 *
 * Uso:
 *   node references/atlas-followup-mock.js
 *   node references/atlas-followup-mock.js caminho/para/outro.json
 */

'use strict';

const fs = require('fs');
const path = require('path');

const DIAS_LIMITE = 7; // > 7 dias sem contato = prioridade alta
const HOJE = new Date('2026-07-23T00:00:00-03:00'); // data de referência da fixture

function diasSemContato(dataStr) {
  const ultimo = new Date(dataStr + 'T00:00:00');
  const ms = HOJE.getTime() - ultimo.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function prioridade(dias) {
  return dias > DIAS_LIMITE ? 'ALTA' : 'NORMAL';
}

function main() {
  const fixturePath = process.argv[2]
    ? path.resolve(process.argv[2])
    : path.join(__dirname, '_fixtures', 'leads-demo.json');

  if (!fs.existsSync(fixturePath)) {
    console.error('❌ Fixture não encontrado: ' + fixturePath);
    process.exit(1);
  }

  const raw = fs.readFileSync(fixturePath, 'utf8');
  const data = JSON.parse(raw);
  const leads = data.leads || [];

  const fila = leads.map((l) => {
    const dias = diasSemContato(l.data_ultimo_contato);
    return {
      ...l,
      dias_sem_contato: dias,
      prioridade: prioridade(dias),
    };
  });

  // Ordena: ALTA antes de NORMAL; dentro de cada grupo, mais antigo (maior dias) no topo
  fila.sort((a, b) => {
    const ordem = (p) => (p === 'ALTA' ? 0 : 1);
    if (ordem(a.prioridade) !== ordem(b.prioridade)) {
      return ordem(a.prioridade) - ordem(b.prioridade);
    }
    return b.dias_sem_contato - a.dias_sem_contato;
  });

  const alta = fila.filter((f) => f.prioridade === 'ALTA').length;

  console.log('='.repeat(64));
  console.log('  FILA DE FOLLOW-UP — Fase 1 ATLAS (MOCK LOCAL, sem secret)');
  console.log('='.repeat(64));
  console.log(`Referência: ${HOJE.toISOString().slice(0, 10)}  |  Limite: >${DIAS_LIMITE} dias = ALTA`);
  console.log(`Leads: ${fila.length}  |  Prioridade ALTA: ${alta}  |  Normal: ${fila.length - alta}`);
  console.log('-'.repeat(64));

  fila.forEach((f, i) => {
    const tag = f.prioridade === 'ALTA' ? '🔴 ALTA ' : '🟢 NORMAL';
    console.log(
      `${String(i + 1).padStart(2, ' ')}. [${tag}] ${f.nome_fantasia}` +
        `\n     nicho: ${f.nicho} | ${f.dias_sem_contato} dias sem contato | status: ${f.status}`
    );
  });

  console.log('-'.repeat(64));
  console.log('Próximo passo (Fase 1 real): plugar ATLAS F1 (ler leads) + F4 (disparar follow-up).');
  console.log('='.repeat(64));

  // Exit code útil p/ CI: 0 se fila montada, 1 se vazia/inválida
  process.exit(fila.length > 0 ? 0 : 1);
}

main();
