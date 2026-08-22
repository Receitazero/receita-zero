#!/usr/bin/env node
/**
 * qa-site.js — checklist automatico de QA de um site gerado (Vitrine Certa).
 *
 * O `npm test` do repo cobre sintaxe e pageerror dos sites JA publicados.
 * Este script cobre o que aquele nao ve: defeito de CONTEUDO que passa no
 * parser mas envergonha na frente do cliente — link morto, wa.me com numero
 * do template, foto sem alt, placeholder esquecido, title generico.
 *
 * Uso:
 *   node references/qa-site.js <dir-do-site>            # 1 site
 *   node references/qa-site.js <dir-pai> --recursivo    # todos os index.html abaixo
 *
 * Exit code 1 se QUALQUER site tiver falha. Aviso nao reprova.
 */
'use strict';
const fs = require('fs');
const path = require('path');

// Numeros de telefone que aparecem nos templates. Se sobrarem no site do
// cliente, o lead do PME cai no WhatsApp errado — falha grave, nao aviso.
const WA_TEMPLATE = ['5511999999999', '5511988888888', '551199999999', '5500000000000'];
// Placeholders reais de template. Cada um e' um REGEX com fronteira de
// palavra: buscar substring solta em portugues gera falso positivo absurdo
// ("TODO" casa dentro de "todos os tipos de cabelo") e um QA que grita
// errado e' desligado na primeira semana.
//
// `}}` foi deliberadamente REMOVIDO da lista: aparece em todo JS/CSS
// minificado como fim de bloco. Handlebars/Jinja de verdade sao pegos pelo
// padrao {{ ... }} com conteudo, abaixo.
const PLACEHOLDERS = [
  { nome: 'mustache/jinja nao renderizado', re: /\{\{\s*[\w.$-]+\s*\}\}/ },
  { nome: 'LOREM IPSUM', re: /\blorem\s+ipsum\b/i },
  { nome: 'TODO', re: /\bTODO\b/ },       // maiuscula + fronteira: nao pega "todos"
  { nome: 'FIXME', re: /\bFIXME\b/ },
  { nome: 'XXX', re: /\bXXX\b/ },
  { nome: 'PLACEHOLDER', re: /\bPLACEHOLDER\b/ },  // so CAIXA ALTA: o atributo html placeholder="..." e' legitimo
  { nome: 'SEU NOME', re: /\bseu\s+nome\s+aqui\b/i },
  { nome: 'texto de exemplo', re: /\bseu\s+texto\s+aqui\b/i },
];
const TITLES_GENERICOS = ['document', 'index', 'home', 'title', 'site', 'untitled', 'página inicial', 'pagina inicial'];

function acharSites(alvo, recursivo) {
  const st = fs.statSync(alvo);
  if (st.isFile()) return [alvo];
  if (!recursivo) {
    const idx = path.join(alvo, 'index.html');
    if (!fs.existsSync(idx)) throw new Error('sem index.html em ' + alvo);
    return [idx];
  }
  const out = [];
  (function anda(dir) {
    for (const nome of fs.readdirSync(dir)) {
      if (nome === 'node_modules' || nome === '.git') continue;
      const p = path.join(dir, nome);
      const s = fs.statSync(p);
      if (s.isDirectory()) anda(p);
      else if (nome.endsWith('.html')) out.push(p);
    }
  })(alvo);
  return out;
}

// Regex e' suficiente aqui: nao precisamos de arvore DOM, so localizar
// atributos. Menos dependencia = roda em qualquer maquina sem npm install.
function analisar(html, arquivo) {
  const falhas = [];
  const avisos = [];
  const F = (m) => falhas.push(m);
  const A = (m) => avisos.push(m);

  // --- links
  const hrefs = [...html.matchAll(/<a\b[^>]*href\s*=\s*["']([^"']*)["']/gi)].map((m) => m[1].trim());
  const semDestino = hrefs.filter((h) => h === '' || h === '#');
  if (semDestino.length) F(`${semDestino.length} link(s) <a> sem destino (href vazio ou "#")`);

  const anchorsSemHref = (html.match(/<a\b(?![^>]*href)[^>]*>/gi) || []).length;
  if (anchorsSemHref) A(`${anchorsSemHref} <a> sem atributo href`);

  // --- whatsapp
  const was = [...html.matchAll(/wa\.me\/(\d*)/gi)].map((m) => m[1]);
  if (was.length === 0) {
    A('nenhum link wa.me encontrado (site sem canal de contato?)');
  } else {
    for (const num of new Set(was)) {
      if (!num) F('link wa.me sem numero');
      else if (num.length < 12 || num.length > 13) F(`wa.me com numero improvavel: ${num} (esperado 12-13 digitos com DDI+DDD)`);
      else if (WA_TEMPLATE.includes(num)) F(`wa.me ainda com numero do TEMPLATE: ${num} — lead cairia no lugar errado`);
    }
  }

  // --- imagens
  const imgs = [...html.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]);
  imgs.forEach((tag, i) => {
    const src = /src\s*=\s*["']([^"']*)["']/i.exec(tag);
    const alt = /alt\s*=\s*["']([^"']*)["']/i.exec(tag);
    if (!src || !src[1].trim()) F(`<img> #${i + 1} sem src`);
    if (!alt) F(`<img> #${i + 1} sem atributo alt (acessibilidade + SEO)`);
    else if (!alt[1].trim()) A(`<img> #${i + 1} com alt vazio (ok so se for decorativa)`);
  });

  // --- placeholders. Ignora comentario HTML (nota interna do template nao e'
  // defeito visivel) e conteudo de <script>/<style> (codigo minificado dispara
  // falso positivo, e o que importa aqui e' o texto que o cliente ve).
  const visivel = html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[\s\S]*?<\/style>/gi, '');
  for (const ph of PLACEHOLDERS) {
    if (ph.re.test(visivel)) F(`placeholder esquecido no conteudo: ${ph.nome}`);
  }

  // --- title
  const t = /<title>([\s\S]*?)<\/title>/i.exec(html);
  if (!t) F('sem <title>');
  else {
    const titulo = t[1].trim();
    if (!titulo) F('<title> vazio');
    else if (TITLES_GENERICOS.includes(titulo.toLowerCase())) F(`<title> generico: "${titulo}"`);
    else if (titulo.length < 10) A(`<title> muito curto (${titulo.length} chars): "${titulo}"`);
  }

  // --- meta description
  const d = /<meta[^>]*name\s*=\s*["']description["'][^>]*>/i.exec(html);
  if (!d) F('sem <meta name="description"> (SEO)');
  else {
    const c = /content\s*=\s*["']([^"']*)["']/i.exec(d[0]);
    const desc = c ? c[1].trim() : '';
    if (!desc) F('meta description vazia');
    else if (desc.length < 50) A(`meta description curta (${desc.length} chars, ideal 50-160)`);
    else if (desc.length > 160) A(`meta description longa (${desc.length} chars, ideal 50-160)`);
  }

  // --- lang (o site e' pt-BR; sem lang o leitor de tela le em ingles)
  if (!/<html[^>]*\blang\s*=/i.test(html)) A('<html> sem atributo lang');

  return { arquivo, falhas, avisos };
}

function main() {
  const args = process.argv.slice(2);
  const recursivo = args.includes('--recursivo');
  const alvo = args.find((a) => !a.startsWith('--'));

  if (!alvo) {
    console.error('uso: node references/qa-site.js <dir-do-site> [--recursivo]');
    process.exit(2);
  }
  if (!fs.existsSync(alvo)) {
    console.error('ERRO: caminho nao encontrado: ' + alvo);
    process.exit(2);
  }

  let sites;
  try {
    sites = acharSites(path.resolve(alvo), recursivo);
  } catch (e) {
    console.error('ERRO: ' + e.message);
    process.exit(2);
  }
  if (!sites.length) {
    console.error('ERRO: nenhum .html encontrado em ' + alvo);
    process.exit(2);
  }

  let totalFalhas = 0;
  let totalAvisos = 0;

  for (const arq of sites) {
    const r = analisar(fs.readFileSync(arq, 'utf8'), arq);
    totalFalhas += r.falhas.length;
    totalAvisos += r.avisos.length;

    const rel = path.relative(process.cwd(), arq) || arq;
    const selo = r.falhas.length ? 'FALHA' : '  ok ';
    console.log(`\n${selo} ${rel}`);
    for (const f of r.falhas) console.log('   x  ' + f);
    for (const a of r.avisos) console.log('   !  ' + a);
    if (!r.falhas.length && !r.avisos.length) console.log('      nada a apontar');
  }

  console.log('\n' + '-'.repeat(52));
  console.log(`sites: ${sites.length} · falhas: ${totalFalhas} · avisos: ${totalAvisos}`);
  console.log(totalFalhas ? 'QA_SITE_FALHOU' : 'QA_SITE_OK');
  process.exit(totalFalhas ? 1 : 0);
}

if (require.main === module) main();
module.exports = { analisar };
