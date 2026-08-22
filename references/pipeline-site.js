#!/usr/bin/env node
/**
 * pipeline-site.js — Vitrine Certa · pipeline BRIEF -> SITE -> QA.
 *
 * Orquestra (nao reimplementa) o scaffold existente em references/gera-site.js
 * e em seguida valida o resultado com references/qa-site.js. Um site so sai do
 * pipeline como "pronto" se o QA passar — caso contrario o operador recebe a
 * lista de falhas e o exit code 1.
 *
 * Uso:
 *   node references/pipeline-site.js <brief.json> [--saida <dir>]
 *   echo '{...}' | node references/pipeline-site.js -
 *
 * Brief (JSON):
 *   nome        (obrigatorio)  nome do PME
 *   nicho       (obrigatorio)  chave de tenant_vitrinecerta.json
 *   whatsapp    (obrigatorio)  numero com DDI+DDD (so digitos)
 *   endereco    (opcional)     vai para o rodape / cidade no title
 *   servicos    (opcional)     [{nome,desc,preco}] -> cardapio
 *   cores       (opcional)     {primary,accent}
 *   tier        (opcional)     basico | plus | premium (seleciona variante)
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const GERA = path.join(__dirname, 'gera-site.js');
const QA = path.join(__dirname, 'qa-site.js');

const OBRIGATORIOS = ['nome', 'nicho', 'whatsapp'];
const TIERS = ['basico', 'plus', 'premium'];

function die(msg, code = 1) {
  console.error('PIPELINE_ERRO: ' + msg);
  process.exit(code);
}

function lerBrief() {
  const arg = process.argv[2];
  if (arg === '-' || arg === undefined) {
    const raw = fs.readFileSync(0, 'utf8'); // stdin
    try { return JSON.parse(raw); } catch (e) { die('brief em stdin nao e JSON valido: ' + e.message); }
  }
  const p = path.resolve(arg);
  if (!fs.existsSync(p)) die('arquivo de brief nao encontrado: ' + p);
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); }
  catch (e) { die('brief nao e JSON valido: ' + e.message); }
}

function validar(brief) {
  const faltando = OBRIGATORIOS.filter((c) => !brief[c]);
  if (faltando.length) die('campo(s) obrigatorio(s) ausente(s): ' + faltando.join(', '));

  const wa = String(brief.whatsapp).replace(/\D/g, '');
  if (wa.length < 12 || wa.length > 13) die('whatsapp invalido (esperado DDI+DDD+numero, 12-13 digitos): ' + brief.whatsapp);

  if (brief.tier && !TIERS.includes(brief.tier)) {
    die('tier invalido "' + brief.tier + '". Validos: ' + TIERS.join(', '));
  }
  if (brief.servicos !== undefined && !Array.isArray(brief.servicos)) {
    die('servicos deve ser um array de {nome,desc,preco}');
  }
  // brief ok: devolve o whatsapp so com digitos para o gerador
  return { ...brief, whatsapp: wa };
}

function main() {
  const args = process.argv.slice(2);
  const saidaIdx = args.indexOf('--saida');
  const saida = saidaIdx >= 0 ? args[saidaIdx + 1] : null;

  const brief = validar(lerBrief());

  // site_dir vem do tenant (tem acento: "site-dfy/clínica"), nao do slug do
  // nicho. Tier, se houver, e' subpasta de site_dir (pet/plus, pet/premium).
  const tenant = JSON.parse(fs.readFileSync(path.join(ROOT, 'tenant_vitrinecerta.json'), 'utf8'));
  const conf = tenant.nichos[brief.nicho];
  if (!conf) die('nicho invalido "' + brief.nicho + '". Validos: ' + Object.keys(tenant.nichos).join(', '));
  const baseDir = conf.site_dir.replace(/^site-dfy\//, '');
  const dirComTier = brief.tier ? path.join(baseDir, brief.tier) : baseDir;
  const nichoEfetivo = fs.existsSync(path.join(ROOT, 'site-dfy', dirComTier)) ? dirComTier : baseDir;

  // 1) gera o site (reuso do scaffold existente). O gera-site.js le um arquivo,
  // nao stdin, entao escrevemos o brief validado num temp e passamos o caminho.
  const tmp = path.join(ROOT, 'site-dfy', '.brief-' + Date.now() + '.json');
  fs.writeFileSync(tmp, JSON.stringify(brief), 'utf8');
  let r1;
  try {
    r1 = spawnSync(process.execPath, [GERA, tmp], { cwd: ROOT, encoding: 'utf8' });
  } finally {
    fs.rmSync(tmp, { force: true });
  }
  if (r1.status !== 0) die('gera-site.js falhou:\n' + (r1.stdout || '') + (r1.stderr || ''));
  process.stdout.write(r1.stdout);

  // 2) acha o diretorio gerado (mesma regra do gera-site.js: cliente-<slug>)
  const slug = brief.nome.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const dirGerado = path.join(ROOT, 'site-dfy', nichoEfetivo, 'cliente-' + slug);
  if (!fs.existsSync(dirGerado)) die('nao encontrei o diretorio gerado: ' + dirGerado);

  // 3) QA automatico
  console.log('\n--- QA do site gerado ---');
  const r2 = spawnSync(process.execPath, [QA, dirGerado], { cwd: ROOT, encoding: 'utf8' });
  process.stdout.write(r2.stdout || '');

  if (r2.status === 1) {
    console.log('\nPIPELINE_FALHOU — corrija as falhas de QA acima e rode de novo.');
    process.exit(1);
  }
  if (saida) {
    // --saida copia o site para a pasta de entrega do cliente
    fs.cpSync(dirGerado, saida, { recursive: true });
    console.log('entrega copiada para: ' + saida);
  }
  console.log('\nPIPELINE_OK — site ' + brief.nome + ' (' + nichoEfetivo + ') aprovado no QA.');
}

if (require.main === module) main();
module.exports = { validar };
