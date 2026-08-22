#!/usr/bin/env node
/**
 * reconciliacao-vc-avanca.js — Mês 2 da Integracao VC x Avanca.
 *
 * Compara duas verdades que vivem em sistemas diferentes:
 *   - Avanca diz quais cobrancas estao PAGAS (fonte de verdade da cobranca)
 *   - VC diz quais sites estao LIBERADOS (fonte de verdade do negocio)
 *
 * e reporta divergencias classificadas. A mais critica: cliente PAGOU mas o
 * site NAO foi liberado (prejuizo de entrega, nao so de caixa).
 *
 * Sem rede: recebe dois arquivos JSON via argumento de linha de comando.
 *
 * Uso:
 *   node references/reconciliacao-vc-avanca.js <avanca.json> <vc.json>
 *
 * Formato avanca.json: [{ pme_id, cobranca_id, status, valor, plano }]
 *   status esperado para "pago": "pago" | "ativa" | "ativa"
 * Formato vc.json:     [{ pme_id, site_id, liberado, plano }]
 *   liberado: true/false
 *
 * Exit code 1 se houver divergencia CRITICA (pago sem site liberado).
 */
'use strict';
const fs = require('fs');
const path = require('path');

const STATUS_PAGO = new Set(['pago', 'ativa', 'ativo', 'ativa']);

function ler(arq, nome) {
  if (!fs.existsSync(arq)) {
    console.error(`ERRO: ${nome} nao encontrado: ${arq}`);
    process.exit(2);
  }
  let dados;
  try { dados = JSON.parse(fs.readFileSync(arq, 'utf8')); }
  catch (e) { console.error(`ERRO: ${nome} nao e JSON valido: ${e.message}`); process.exit(2); }
  if (!Array.isArray(dados)) { console.error(`ERRO: ${nome} deve ser um array`); process.exit(2); }
  return dados;
}

function reconciliar(avanca, vc) {
  // Avanca: so as cobrancas pagas importam para a entrega do site.
  const pago = new Map(
    avanca
      .filter((c) => STATUS_PAGO.has(String(c.status || '').toLowerCase()))
      .map((c) => [String(c.pme_id), { valor: Number(c.valor || 0), plano: c.plano || null, cobranca_id: c.cobranca_id }])
  );
  const porCobranca = new Map(avanca.map((c) => [String(c.cobranca_id), c]));

  // VC: sites liberados por pme.
  const liberado = new Map(
    vc.map((s) => [String(s.pme_id), { liberado: !!s.liberado, plano: s.plano || null, site_id: s.site_id }])
  );

  const criticas = [];
  const prejuizo = [];
  const divergentes = [];

  // 1) pago no Avanca mas sem site liberado na VC (CRITICO)
  for (const [pme, c] of pago) {
    const v = liberado.get(pme);
    if (!v || !v.liberado) {
      criticas.push({ pme_id: pme, cobranca_id: c.cobranca_id, valor: c.valor, plano: c.plano });
    }
  }

  // 2) site liberado na VC mas sem pagamento no Avanca (prejuizo: entregou de graca)
  for (const [pme, v] of liberado) {
    if (v.liberado && !pago.has(pme)) {
      prejuizo.push({ pme_id: pme, site_id: v.site_id, plano: v.plano });
    }
  }

  // 3) ambos presentes, mas plano/valor divergem
  for (const [pme, c] of pago) {
    const v = liberado.get(pme);
    if (v && v.liberado && c.plano && v.plano && String(c.plano).toLowerCase() !== String(v.plano).toLowerCase()) {
      divergentes.push({ pme_id: pme, plano_avanca: c.plano, plano_vc: v.plano, valor: c.valor });
    }
  }

  const resumo = {
    avanca_pagos: pago.size,
    vc_liberados: [...liberado.values()].filter((v) => v.liberado).length,
    pago_sem_site_liberado: criticas.length,
    site_liberado_sem_pagamento: prejuizo.length,
    valor_ou_plano_divergente: divergentes.length,
  };

  return { criticas, prejuizo, divergentes, resumo };
}

function imprimir(r) {
  const linha = '-'.repeat(60);
  console.log(linha);
  console.log('RECONCILIACAO VC x AVANCA');
  console.log(linha);
  console.log(`Avanca pagos        : ${r.resumo.avanca_pagos}`);
  console.log(`VC liberados        : ${r.resumo.vc_liberados}`);
  console.log(`Pago sem site       : ${r.resumo.pago_sem_site_liberado}  [CRITICO]`);
  console.log(`Site sem pagamento  : ${r.resumo.site_liberado_sem_pagamento}  [prejuizo]`);
  console.log(`Plano/valor diverg. : ${r.resumo.valor_ou_plano_divergente}`);
  console.log(linha);

  if (r.criticas.length) {
    console.log('CRITICO — pagou e nao recebeu o site:');
    for (const c of r.criticas) console.log(`  x  pme=${c.pme_id} cobranca=${c.cobranca_id} R$${c.valor} (${c.plano || 'sem plano'})`);
  }
  if (r.prejuizo.length) {
    console.log('PREJUIZO — site liberado sem pagamento:');
    for (const p of r.prejuizo) console.log(`  -  pme=${p.pme_id} site=${p.site_id} (${p.plano || 'sem plano'})`);
  }
  if (r.divergentes.length) {
    console.log('DIVERGENTE — plano/valor nao batem:');
    for (const d of r.divergentes) console.log(`  ~  pme=${d.pme_id} Avanca=${d.plano_avanca} VC=${d.plano_vc} R$${d.valor}`);
  }

  const critico = r.criticas.length > 0;
  console.log(linha);
  console.log(critico ? 'RECONCILIACAO_FALHOU_CRITICO' : 'RECONCILIACAO_OK');

  // Saida estruturada para quem quiser automatizar a partir daqui.
  process.stdout.write('\n' + JSON.stringify(r) + '\n');
  return critico ? 1 : 0;
}

function main() {
  const [a, v] = process.argv.slice(2);
  if (!a || !v) {
    console.error('uso: node references/reconciliacao-vc-avanca.js <avanca.json> <vc.json>');
    process.exit(2);
  }
  const avanca = ler(path.resolve(a), 'avanca');
  const vc = ler(path.resolve(v), 'vc');
  process.exit(imprimir(reconciliar(avanca, vc)));
}

if (require.main === module) main();
module.exports = { reconciliar, STATUS_PAGO };
