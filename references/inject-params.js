// inject-params.js — faz os 8 sites simples lerem ?nome=&cidade= e personalizarem
// Uso: node references/inject-params.js
const fs = require('fs');
const path = require('path');

const NICHOS = {
  'pizzaria':    'Pizzaria',
  'pet':         'Pet shop',
  'padaria':     'Padaria',
  'oficina':     'Oficina',
  'salão':  'Salão de Beleza',
  'clínica': 'Clínica',
  'lavanderia':  'Lavanderia',
  'imobiliária': 'Imobiliária',
};

const SVCITY = 'São Vicente';

function inject(filePath, nicho) {
  let html = fs.readFileSync(filePath, 'utf8');
  const nomeNicho = NICHOS[nicho];

  // remover script antigo se houver
  html = html.replace(/<!-- PARAMS VC -->[\s\S]*?<\/script>\s*/g, '');

  const script = `<!-- PARAMS VC -->
<script>
(function(){
  const p=new URLSearchParams(location.search);
  const nome=p.get('nome'), cid=p.get('cidade');
  if(!nome && !cid) return;
  const nn=nome||'${nomeNicho}', cc=cid||'${SVCITY}';
  const full=nn+' em '+cc;
  // troca ocorrências conhecidas
  const map={
    '${nomeNicho} em ${SVCITY}': full,
    '${nomeNicho} em São Vicente': full,
    'em ${SVCITY}': 'em '+cc,
    'Em ${SVCITY}': 'Em '+cc,
    '${SVCITY}': cc
  };
  document.querySelectorAll('.eyebrow,title,meta[name=description],.hero p.lede,.perk p,.faq p,footer').forEach(el=>{
    if(el.tagName==='META'){ el.setAttribute('content', el.getAttribute('content').replace(/${SVCITY}/g, cc)); }
    else { let t=el.textContent; for(const k in map){ if(t.includes(k)) t=t.replace(new RegExp(k,'g'),map[k]); } el.textContent=t; }
  });
  // h1 do hero vira o nome do lugar (preview personalizado)
  const h1=document.querySelector('.hero h1');
  if(h1){ h1.innerHTML=full.replace(/(\\w+)\\s+(\\w+)/, '$1 <em>$2</em>'); }
  document.title=full;
})();
<\/script>`;

  if (html.includes('</body>')) {
    html = html.replace('</body>', script + '\n</body>');
  } else {
    html += script;
  }
  fs.writeFileSync(filePath, html);
}

let count = 0;
for (const nicho of Object.keys(NICHOS)) {
  const f = path.join('site-dfy', nicho, 'index.html');
  if (fs.existsSync(f)) { inject(f, nicho); count++; }
}
console.log(`✅ Params injetados em ${count} sites simples`);
