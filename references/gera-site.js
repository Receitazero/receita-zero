#!/usr/bin/env node
/**
 * gera-site.js — Vitrine Certa · scaffold de site de cliente a partir do template do nicho.
 * Semana 2, Mês 1 (autônomo).
 *
 * Uso:  node references/gera-site.js <cliente.json>
 *
 * Entrada (JSON): { nome, nicho, cidade?, whatsapp, cores?{primary,accent}, itens?[{nome,desc,preco}] }
 * Nichos válidos: chaves de tenant_vitrinecerta.json (clinica, imobiliaria, lavanderia,
 * oficina, padaria, pet, pizzaria, salao).
 *
 * Saída: site-dfy/<dir-do-nicho>/cliente-<slug>/index.html (+assets copiados).
 * NÃO altera o template original — só copia e injeta.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function die(msg) { console.error('ERRO: ' + msg); process.exit(1); }

function slugify(s) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

// --- args ---
const arg = process.argv[2];
if (!arg) die('uso: node references/gera-site.js <cliente.json>');
const clientePath = path.resolve(arg);
if (!fs.existsSync(clientePath)) die('arquivo não encontrado: ' + clientePath);
const cliente = JSON.parse(fs.readFileSync(clientePath, 'utf8'));

for (const campo of ['nome', 'nicho', 'whatsapp']) {
  if (!cliente[campo]) die('campo obrigatório ausente no JSON: ' + campo);
}

// --- tenant / nicho ---
const tenant = JSON.parse(fs.readFileSync(path.join(ROOT, 'tenant_vitrinecerta.json'), 'utf8'));
const nicho = tenant.nichos[cliente.nicho];
if (!nicho) die('nicho inválido "' + cliente.nicho + '". Válidos: ' + Object.keys(tenant.nichos).join(', '));

const srcDir = path.join(ROOT, nicho.site_dir);
const srcIndex = path.join(srcDir, 'index.html');
if (!fs.existsSync(srcIndex)) die('template não encontrado: ' + srcIndex);

const slug = slugify(cliente.nome);
const outDir = path.join(srcDir, 'cliente-' + slug);
fs.mkdirSync(outDir, { recursive: true });

// --- copia assets (raso) ---
const assetsSrc = path.join(srcDir, 'assets');
if (fs.existsSync(assetsSrc)) {
  const assetsOut = path.join(outDir, 'assets');
  fs.mkdirSync(assetsOut, { recursive: true });
  for (const f of fs.readdirSync(assetsSrc)) {
    const p = path.join(assetsSrc, f);
    if (fs.statSync(p).isFile()) fs.copyFileSync(p, path.join(assetsOut, f));
  }
}

// --- injeção no HTML ---
let html = fs.readFileSync(srcIndex, 'utf8');
let mudancas = [];

// 1. WhatsApp: troca TODOS os wa.me/<numero> pelo do cliente
const waAntes = (html.match(/wa\.me\/\d+/g) || []).length;
html = html.replace(/wa\.me\/\d+/g, 'wa.me/' + String(cliente.whatsapp).replace(/\D/g, ''));
mudancas.push('whatsapp: ' + waAntes + ' link(s) wa.me trocados');

// 2. Nome no <title> e no hero (<h1>)
html = html.replace(/<title>[^<]*<\/title>/i,
  '<title>' + cliente.nome + (cliente.cidade ? ' — ' + cliente.cidade : '') + '</title>');
html = html.replace(/(<h1[^>]*>)[\s\S]*?(<\/h1>)/i,
  '$1' + cliente.nome + (cliente.cidade ? ' <em>· ' + cliente.cidade + '</em>' : '') + '$2');
mudancas.push('title + h1 → "' + cliente.nome + '"');

// 3. Cores (opcional): sobrescreve via bloco :root injetado no fim do <head>
if (cliente.cores && (cliente.cores.primary || cliente.cores.accent)) {
  const extra = '\n<style>/* gera-site.js override */:root{' +
    (cliente.cores.primary ? '--primary:' + cliente.cores.primary + ';--p:' + cliente.cores.primary + ';' : '') +
    (cliente.cores.accent ? '--accent:' + cliente.cores.accent + ';--ac:' + cliente.cores.accent + ';' : '') +
    '}</style>\n';
  html = html.replace(/<\/head>/i, extra + '</head>');
  mudancas.push('cores override injetado');
}

// 4. Itens de cardápio/serviços (opcional): substitui os cards dentro de #cardapio
if (Array.isArray(cliente.itens) && cliente.itens.length) {
  const cards = cliente.itens.map(it =>
    '      <div class="pizza reveal"><div class="body"><h4>' + it.nome + '</h4>' +
    '<p class="desc">' + (it.desc || '') + '</p>' +
    '<div class="row"><span class="price">R$ ' + it.preco + '</span></div></div></div>'
  ).join('\n');
  // acha o container de cards do cardápio (padrão dos templates: divs .pizza dentro de #cardapio)
  const re = /(<section id="cardapio"[\s\S]*?)((?:\s*<div class="pizza reveal">[\s\S]*?<\/div><\/div><\/div>)+)/;
  if (re.test(html)) {
    html = html.replace(re, (m, head) => head + '\n' + cards + '\n');
    mudancas.push('cardápio: ' + cliente.itens.length + ' item(ns) injetado(s)');
  } else {
    mudancas.push('cardápio: container padrão não encontrado neste nicho — itens NÃO injetados (ajustar manualmente)');
  }
}

fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf8');

// --- relatório ---
console.log('OK — site scaffoldado');
console.log('  cliente : ' + cliente.nome + ' (' + cliente.nicho + ')');
console.log('  saída   : ' + path.relative(ROOT, outDir));
console.log('  bytes   : ' + fs.statSync(path.join(outDir, 'index.html')).size);
for (const m of mudancas) console.log('  - ' + m);
console.log('Próximo passo: revisar fotos/textos e rodar node references/verify-syntax.js');
