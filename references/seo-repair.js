// seo-repair.js — conserta JSON-LD LocalBusiness corrompido em todos os index.html
// Idempotente: remove tags HTML vazadas dentro do JSON e re-serializa limpo.
// NÃO regenera telephone/name/description (preserva dados por-cliente).
// Uso: node references/seo-repair.js
const fs = require('fs');
const path = require('path');

function walk(dir, out) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name === 'index.html') out.push(p);
  }
}
const files = [];
walk('site-dfy', files);

let ok = 0, fixed = 0, added = 0, fail = 0;
for (const f of files) {
  let html = fs.readFileSync(f, 'utf8');
  const m = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  if (!m) {
    // sem JSON-LD: construir mínimo a partir de title/og:description
    const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || 'Negócio';
    const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';
    const url = (html.match(/<meta property="og:url" content="([^"]*)"/) || [])[1] || '';
    const data = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: title,
      description: desc,
      url: url
    };
    const block = `\n<script type="application/ld+json">\n${JSON.stringify(data, null, 2)}\n</script>`;
    const i = html.indexOf('</title>');
    if (i >= 0) { html = html.slice(0, i + 8) + block + html.slice(i + 8); fs.writeFileSync(f, html); added++; }
    continue;
  }
  let body = m[1];
  // remover qualquer tag HTML que vazou para dentro do JSON (causa da corrupção)
  const clean = body.replace(/<[^>]*>/g, '');
  let obj;
  try { obj = JSON.parse(clean); }
  catch (e) {
    // fallback: sanitiza priceRange e tenta de novo
    const clean2 = clean.replace(/"priceRange"\s*:\s*"[^"]*"/, '"priceRange":"R$49-R$199"');
    try { obj = JSON.parse(clean2); }
    catch (e2) { console.log('UNPARSEABLE', f); fail++; continue; }
  }
  const block = `\n<script type="application/ld+json">\n${JSON.stringify(obj, null, 2)}\n</script>`;
  const before = html;
  html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, block);
  fs.writeFileSync(f, html);
  if (before !== html) fixed++; else ok++;
}
console.log(JSON.stringify({ total: files.length, ok, fixed, added, fail }));
