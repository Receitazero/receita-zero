#!/usr/bin/env node
/**
 * gera-nicho.js — Vitrine Certa · scaffolda um NICHO NOVO (3 tiers) a partir de um nicho base.
 * Reusa a infra/lógica de injeção do gera-site.js (cópia determinística + replaces).
 *
 * Uso:  node references/gera-nicho.js <nicho.json>
 *
 * Entrada (JSON): {
 *   nicho: "barbearia", base_dir: "site-dfy/salão",
 *   titulo: "Barbearia Navalha de Ouro", cidade: "São Paulo",
 *   whatsapp: "5511999990000",
 *   cores?: { primary, accent },
 *   termos?: [ [de, para], ... ]   // substituições de copy determinísticas
 * }
 *
 * Saída: site-dfy/<nicho>/standard/ , site-dfy/<nicho>/plus/ , site-dfy/<nicho>/premium/
 * NÃO altera nada do nicho base, nem index.html da raiz, nem premium de clientes.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

function die(m) { console.error('ERRO: ' + m); process.exit(1); }

const arg = process.argv[2];
if (!arg) die('uso: node references/gera-nicho.js <nicho.json>');
const cfg = JSON.parse(fs.readFileSync(path.resolve(arg), 'utf8'));
for (const c of ['nicho', 'base_dir', 'titulo', 'whatsapp']) if (!cfg[c]) die('campo obrigatório: ' + c);

const baseDir = path.join(ROOT, cfg.base_dir);
if (!fs.existsSync(baseDir)) die('nicho base não encontrado: ' + baseDir);
const outRoot = path.join(ROOT, 'site-dfy', cfg.nicho);

// tiers: standard = index.html da raiz do nicho base; plus e premium = subpastas
const TIERS = [
  { nome: 'standard', srcHtml: path.join(baseDir, 'index.html'), srcAssets: path.join(baseDir, 'assets') },
  { nome: 'plus',     srcHtml: path.join(baseDir, 'plus', 'index.html'), srcAssets: path.join(baseDir, 'plus', 'assets') },
  { nome: 'premium',  srcHtml: path.join(baseDir, 'premium', 'index.html'), srcAssets: path.join(baseDir, 'premium', 'assets') },
];

function copiaAssets(src, dst) {
  if (!fs.existsSync(src)) return 0;
  fs.mkdirSync(dst, { recursive: true });
  let n = 0;
  for (const f of fs.readdirSync(src)) {
    const p = path.join(src, f);
    if (fs.statSync(p).isFile()) { fs.copyFileSync(p, path.join(dst, f)); n++; }
  }
  return n;
}

for (const tier of TIERS) {
  if (!fs.existsSync(tier.srcHtml)) die('template do tier ausente: ' + tier.srcHtml);
  const outDir = path.join(outRoot, tier.nome);
  fs.mkdirSync(outDir, { recursive: true });

  let html = fs.readFileSync(tier.srcHtml, 'utf8');
  const mud = [];

  // 1. WhatsApp (mesma regra do gera-site.js)
  const waAntes = (html.match(/wa\.me\/\d+/g) || []).length;
  html = html.replace(/wa\.me\/\d+/g, 'wa.me/' + String(cfg.whatsapp).replace(/\D/g, ''));
  mud.push('whatsapp: ' + waAntes + ' link(s)');

  // 2. Title + h1
  html = html.replace(/<title>[^<]*<\/title>/i,
    '<title>' + cfg.titulo + (cfg.cidade ? ' — ' + cfg.cidade : '') + '</title>');
  html = html.replace(/(<h1[^>]*>)[\s\S]*?(<\/h1>)/i,
    '$1' + cfg.titulo + (cfg.cidade ? ' <em>· ' + cfg.cidade + '</em>' : '') + '$2');
  mud.push('title + h1');

  // 3. Cores override
  if (cfg.cores && (cfg.cores.primary || cfg.cores.accent)) {
    const extra = '\n<style>/* gera-nicho.js override */:root{' +
      (cfg.cores.primary ? '--primary:' + cfg.cores.primary + ';--p:' + cfg.cores.primary + ';' : '') +
      (cfg.cores.accent ? '--accent:' + cfg.cores.accent + ';--ac:' + cfg.cores.accent + ';' : '') +
      '}</style>\n';
    html = html.replace(/<\/head>/i, extra + '</head>');
    mud.push('cores override');
  }

  // 4. Termos de copy (determinístico, ordem do JSON)
  let trocas = 0;
  for (const [de, para] of (cfg.termos || [])) {
    const re = new RegExp(de.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    trocas += (html.match(re) || []).length;
    html = html.replace(re, para);
  }
  if (trocas) mud.push('termos: ' + trocas + ' troca(s)');

  fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf8');
  const nAssets = copiaAssets(tier.srcAssets, path.join(outDir, 'assets'));

  console.log('OK tier ' + tier.nome + ' → ' + path.relative(ROOT, outDir) +
    ' (' + fs.statSync(path.join(outDir, 'index.html')).size + ' bytes, ' + nAssets + ' assets) [' + mud.join('; ') + ']');
}
console.log('NICHO_OK ' + cfg.nicho + ' (3 tiers). Rodar: node references/verify-syntax.js');
