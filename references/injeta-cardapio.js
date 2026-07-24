#!/usr/bin/env node
/**
 * injeta-cardapio.js — Vitrine Certa · Semana 5, Mês 2 (autônomo).
 *
 * INJESTÃO DE CARDÁPIO VIA BRIEF (GATE 2=C: cardápio híbrido).
 * NÃO é um novo "empregado" — é um script Hermes-on-demand que reusa a mesma
 * estratégia de injeção do gera-site.js, mas focado APENAS no cardápio de um
 * site JÁ existente (cliente scaffoldado). Substitui os cards dentro de
 * <section id="cardapio"> pelos itens do brief, preservando o markup rico do
 * template (imagem + descrição + preço + tamanho).
 *
 * Uso:  node references/injeta-cardapio.js <brief.json>
 *
 * brief.json:
 * {
 *   "site":  "site-dfy/pizzaria/cliente-forno-dourado/index.html",
 *   "itens": [ { "nome", "desc", "preco", "tam"?, "img"? }, ... ]
 * }
 *
 * - Faz backup .bak antes de escrever (rollback simples).
 * - NÃO altera o template original do nicho, só o index.html do cliente.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
function die(m) { console.error('ERRO: ' + m); process.exit(1); }
function esc(s) { return String(s == null ? '' : s).replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

const arg = process.argv[2];
if (!arg) die('uso: node references/injeta-cardapio.js <brief.json>');
const briefPath = path.resolve(arg);
if (!fs.existsSync(briefPath)) die('brief não encontrado: ' + briefPath);
const brief = JSON.parse(fs.readFileSync(briefPath, 'utf8'));

if (!brief.site) die('campo "site" ausente no brief');
if (!Array.isArray(brief.itens) || !brief.itens.length) die('campo "itens" ausente/vazio');

const sitePath = path.isAbsolute(brief.site) ? brief.site : path.join(ROOT, brief.site);
if (!fs.existsSync(sitePath)) die('site não encontrado: ' + sitePath + ' (rode gera-site.js primeiro)');

let html = fs.readFileSync(sitePath, 'utf8');

// monta os cards no mesmo formato do template (.pizza reveal com img + row/price/sz)
const cards = brief.itens.map(it => {
  const img = it.img ? '<img src="' + esc(it.img) + '" alt="' + esc(it.nome) + '">' : '';
  const sz = it.tam ? '<span class="sz">' + esc(it.tam) + '</span>' : '';
  return '      <div class="pizza reveal">' + img +
    '<div class="body"><h4>' + esc(it.nome) + '</h4>' +
    '<p class="desc">' + esc(it.desc || '') + '</p>' +
    '<div class="row"><span class="price">R$ ' + esc(it.preco) + '</span>' + sz + '</div></div></div>';
}).join('\n');

// localiza o grid de cards dentro de #cardapio e substitui TODO o conteúdo do grid
const gridRe = /(<div class="pizza-grid">)([\s\S]*?)(<\/div>\s*<\/div>\s*<\/section>)/;
if (!gridRe.test(html)) die('grid de cardápio (.pizza-grid) não encontrado neste site — layout diferente do template padrão');

const antes = (html.match(/<div class="pizza reveal">/g) || []).length;
html = html.replace(gridRe, (m, open, _mid, close) => open + '\n' + cards + '\n    ' + close);
const depois = brief.itens.length;

// backup + escreve
fs.copyFileSync(sitePath, sitePath + '.bak');
fs.writeFileSync(sitePath, html, 'utf8');

console.log('OK — cardápio injetado');
console.log('  site   : ' + path.relative(ROOT, sitePath));
console.log('  cards  : ' + antes + ' → ' + depois);
console.log('  backup : ' + path.relative(ROOT, sitePath + '.bak'));
console.log('Próximo: node references/verify-syntax.js');
