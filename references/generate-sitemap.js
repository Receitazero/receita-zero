// generate-sitemap.js — gera sitemap.xml (todas as index.html + landing) e
// robots.txt apontando pra ele. Idempotente. Lista só arquivos públicos.
// Uso: node references/generate-sitemap.js
const fs = require('fs');
const path = require('path');

const BASE = 'https://receitazero.github.io/receita-zero';
function walk(dir, out) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name === 'index.html') out.push(p.replace(/\\/g, '/'));
  }
}
const files = [];
walk('site-dfy', files);
// inclui landing raiz
if (fs.existsSync('index.html')) files.unshift('index.html');

const urls = files.map(f => {
  // index.html -> dir raiz daquela pasta
  const dir = f.replace(/\/index\.html$/, '').replace(/^site-dfy\//, 'site-dfy/');
  const url = f === 'index.html' ? `${BASE}/` : `${BASE}/${f.replace(/\/index\.html$/, '')}/`;
  return `  <url>\n    <loc>${url}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`;
}).join('\n');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
fs.writeFileSync('sitemap.xml', sitemap);
fs.writeFileSync('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${BASE}/sitemap.xml\n`);
console.log(`✅ sitemap.xml (${files.length} URLs) + robots.txt gerados`);
