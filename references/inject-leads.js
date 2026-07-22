// inject-leads.js — adiciona captureLead() nos formulários de contato dos 8 simples
// Uso: node references/inject-leads.js
const fs = require('fs');
const path = require('path');

function inject(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');
  if (html.includes('captureLead(')) return false; // já injetado
  // incluir leads.js
  if (!html.includes('references/leads.js')) {
    html = html.replace('</body>', '  <script src="../../references/leads.js"></script>\n</body>');
  }
  // dentro de vcLead, capturar o lead
  html = html.replace(
    /function vcLead\(f\)\{/,
    `function vcLead(f){var d={};new FormData(f).forEach(function(v,k){d[k]=v});if(d.nome||d.whatsapp){captureLead({nome:d.nome,whatsapp:d.whatsapp,cidade:(d.endereco||''),nicho:location.pathname.split('/')[2],origem:'contato',mensagem:(d.mensagem||'')});}`
  );
  fs.writeFileSync(filePath, html);
  return true;
}

let count = 0;
for (const nicho of ['pizzaria','pet','padaria','oficina','salão','clínica','lavanderia','imobiliária']) {
  const f = path.join('site-dfy', nicho, 'index.html');
  if (fs.existsSync(f) && inject(f)) count++;
}
console.log(`✅ Lead capture injetado em ${count} sites simples`);
