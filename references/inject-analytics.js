// inject-analytics.js — injeta Clarity (Microsoft) + meta de verificação do
// Google Search Console em todos os index.html. Idempotente.
// Lê os IDs de ~/.secrets/vc-clarity-id e ~/.secrets/vc-sc-verification.
// Se não existirem, injeta um comentário placeholder (sem quebrar nada) para o
// CEO colar os IDs depois de criar a conta.
// Uso: node references/inject-analytics.js
const fs = require('fs');
const path = require('path');
const homedir = process.env.USERPROFILE || process.env.HOME;
const secretsDir = path.join(homedir, '.secrets');
const clarityId = readSecret('vc-clarity-id');
const scId = readSecret('vc-sc-verification');

function readSecret(name) {
  try { return fs.readFileSync(path.join(secretsDir, name), 'utf8').trim(); }
  catch (e) { return ''; }
}

function buildBlock() {
  if (clarityId && scId) {
    return `<!-- Vitrine Certa Analytics -->
<meta name="google-site-verification" content="${scId}">
<script type="text/javascript">
(function(c,l,a,r,i,t,y){
  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window,document,"clarity","script","${clarityId}");
</script>`;
  }
  return `<!-- Vitrine Certa Analytics: crie o projeto em clarity.ms e a propriedade no Search Console,
     salve os IDs em ~/.secrets/vc-clarity-id e ~/.secrets/vc-sc-verification, depois rode node references/inject-analytics.js -->`;
}

function walk(dir, out) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name === 'index.html') out.push(p);
  }
}
const files = [];
walk('site-dfy', files);
// landing principal (receita-zero/index.html) + raiz (redirect)
if (fs.existsSync('receita-zero/index.html')) files.push('receita-zero/index.html');
if (fs.existsSync('index.html')) files.push('index.html');

const block = buildBlock();
let count = 0;
for (const f of files) {
  let html = fs.readFileSync(f, 'utf8');
  html = html.replace(/<!-- Vitrine Certa Analytics[\s\S]*?-->/g, '');
  html = html.replace(/<meta name="google-site-verification"[^>]*>/g, '');
  html = html.replace(/<script type="text\/javascript">\s*\(function\(c,l,a,r,i,t,y\)\{[\s\S]*?<\/script>/g, '');
  const i = html.indexOf('</title>');
  if (i >= 0) { html = html.slice(0, i + 8) + '\n  ' + block + html.slice(i + 8); fs.writeFileSync(f, html); count++; }
}
console.log(`✅ Analytics ${clarityId && scId ? 'REAL' : 'PLACEHOLDER'} injetado em ${count} arquivos`);
