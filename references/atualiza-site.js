#!/usr/bin/env node
/**
 * atualiza-site.js — Vitrine Certa · Semana 5, Mês 2 (autônomo).
 *
 * AUTOMAÇÃO DE ATUALIZAÇÃO PONTUAL (pacote cobrado R$29/un — GATE 2=C híbrido).
 * Aplica uma edição CIRÚRGICA num site de cliente JÁ publicado, sem regerar
 * tudo (preserva fotos, layout, demais cards). Cobre os casos reais de
 * manutenção: trocar preço de 1 item, mudar descrição, remarcar WhatsApp,
 * rebrand (nome/cidade), ajustar cor de marca.
 *
 * Uso:  node references/atualiza-site.js <edicao.json>
 *
 * edicao.json:
 * {
 *   "site": "site-dfy/pizzaria/cliente-forno-dourado/index.html",
 *   "whatsapp"?: "5513999990000",          // troca todos os wa.me
 *   "cores"?: { "primary":"#C0392B" },       // override :root
 *   "cardapio"?: [                           // edita cards por nome (match exato no h4)
 *     { "nome": "Marguerita da Casa", "preco": "45", "desc": "NOVA desc" }
 *   ],
 *   "rebanner"?: { "nome":"Forno Dourado","cidade":"Santos" }  // troca title+h1+eyebrow
 * }
 *
 * - Backup .bak antes de escrever. NÃO toca no template do nicho.
 * - Idempotente: rodar de novo com os mesmos valores não duplica.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
function die(m) { console.error('ERRO: ' + m); process.exit(1); }

const arg = process.argv[2];
if (!arg) die('uso: node references/atualiza-site.js <edicao.json>');
const edPath = path.resolve(arg);
if (!fs.existsSync(edPath)) die('arquivo não encontrado: ' + edPath);
const ed = JSON.parse(fs.readFileSync(edPath, 'utf8'));
if (!ed.site) die('campo "site" ausente');

const sitePath = path.isAbsolute(ed.site) ? ed.site : path.join(ROOT, ed.site);
if (!fs.existsSync(sitePath)) die('site não encontrado: ' + sitePath);

let html = fs.readFileSync(sitePath, 'utf8');
const log = [];

// 1) WhatsApp
if (ed.whatsapp) {
  const wa = String(ed.whatsapp).replace(/\D/g, '');
  const n = (html.match(/wa\.me\/\d+/g) || []).length;
  html = html.replace(/wa\.me\/\d+/g, 'wa.me/' + wa);
  log.push('whatsapp: ' + n + ' link(s) → ' + wa);
}

// 2) Cores (override :root)
if (ed.cores && (ed.cores.primary || ed.cores.accent)) {
  const extra = '\n<style>/* atualiza-site.js override */:root{' +
    (ed.cores.primary ? '--a1:' + ed.cores.primary + ';--a2:' + ed.cores.primary + ';' : '') +
    (ed.cores.accent ? '--a3:' + ed.cores.accent + ';' : '') + '}</style>\n';
  html = html.replace(/<\/head>/i, extra + '</head>');
  log.push('cores: override injetado');
}

// 3) Cardápio: edita cards por nome (h4)
if (Array.isArray(ed.cardapio) && ed.cardapio.length) {
  let feitos = 0;
  for (const item of ed.cardapio) {
    if (!item.nome) continue;
    // casa o card cujo <h4>NOME</h4> bate (case-insensitive, trim)
    const re = new RegExp(
      '(class="pizza reveal"[^>]*>[\\s\\S]*?<h4>\\s*' +
      item.nome.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') +
      '\\s*</h4>)([\\s\\S]*?)(</div></div></div>)', 'i');
    if (!re.test(html)) { log.push('cardapio: "' + item.nome + '" NÃO encontrado (skip)'); continue; }
    html = html.replace(re, (m, head, mid, close) => {
      let bloco = mid;
      if (item.preco !== undefined) bloco = bloco.replace(/<span class="price">R\$ [\d.,]+<\/span>/, '<span class="price">R$ ' + item.preco + '</span>');
      if (item.desc !== undefined) bloco = bloco.replace(/<p class="desc">[\s\S]*?<\/p>/, '<p class="desc">' + item.desc + '</p>');
      if (item.tam !== undefined) bloco = bloco.replace(/<span class="sz">[^<]*<\/span>/, '<span class="sz">' + item.tam + '</span>');
      return head + bloco + close;
    });
    feitos++;
  }
  log.push('cardapio: ' + feitos + '/' + ed.cardapio.length + ' card(s) editado(s)');
}

// 4) Rebrand (title + h1 + eyebrow)
if (ed.rebanner && ed.rebanner.nome) {
  const nome = ed.rebanner.nome, cid = ed.rebanner.cidade || '';
  html = html.replace(/<title>[^<]*<\/title>/i, '<title>' + nome + (cid ? ' — ' + cid : '') + '</title>');
  html = html.replace(/(<h1[^>]*>)[\s\S]*?(<\/h1>)/i, '$1' + nome + (cid ? ' <em>· ' + cid + '</em>' : '') + '$2');
  log.push('rebanner: → "' + nome + (cid ? ' · ' + cid : '') + '"');
}

fs.copyFileSync(sitePath, sitePath + '.bak');
fs.writeFileSync(sitePath, html, 'utf8');
console.log('OK — atualização pontual aplicada');
console.log('  site : ' + path.relative(ROOT, sitePath));
for (const l of log) console.log('  - ' + l);
console.log('  backup: ' + path.relative(ROOT, sitePath + '.bak'));
console.log('Próximo: node references/verify-syntax.js');
