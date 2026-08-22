// inject-seo.js — injeta JSON-LD LocalBusiness + OpenGraph em todos os sites
// Uso: node references/inject-seo.js
const fs = require('fs');
const path = require('path');

const NICHOS = {
  'pizzaria':      { nome:'Pizzaria', cidade:'São Vicente', desc:'Pizzaria com forno a lenha, cardápio online e pedido no WhatsApp.' },
  'pet':           { nome:'Pet Shop', cidade:'São Vicente', desc:'Pet shop com agendamento de banho e tosa e calculadora de preços no WhatsApp.' },
  'padaria':       { nome:'Padaria', cidade:'São Vicente', desc:'Padaria artesanal com encomendas e cardápio de produtos no WhatsApp.' },
  'oficina':       { nome:'Oficina', cidade:'São Vicente', desc:'Oficina mecânica com orçamento ao vivo e agendamento no WhatsApp.' },
  'salão':         { nome:'Salão de Beleza', cidade:'São Vicente', desc:'Salão de beleza com agenda online e agendamento no WhatsApp.' },
  'clínica':       { nome:'Clínica', cidade:'São Vicente', desc:'Clínica com agendamento online e tour virtual no WhatsApp.' },
  'lavanderia':    { nome:'Lavanderia', cidade:'São Vicente', desc:'Lavanderia com simulador de preços e agendamento no WhatsApp.' },
  'imobiliária':   { nome:'Imobiliária', cidade:'São Vicente', desc:'Imobiliária com filtro de imóveis e contato no WhatsApp.' },
};

const WHATS = '5511970776856';
const SITE_URL = 'https://receitazero.github.io/receita-zero';

function buildSEO(nicho, isPremium) {
  const n = NICHOS[nicho];
  const plano = isPremium ? 'Premium' : 'Essencial';
  const title = `${n.nome} em ${n.cidade} — site ${plano} | Vitrine Certa`;
  const desc = `${n.desc} Site ${plano} da Vitrine Certa, pronto em 48h. A partir de R$${isPremium ? '149' : '49'}/mês.`;
  const url = `${SITE_URL}/site-dfy/${nicho}${isPremium ? '/premium' : ''}/index.html`;
  const img = `${SITE_URL}/site-dfy/${nicho}${isPremium ? '/premium' : ''}/preview.png`;

  return `<!-- SEO Vitrine Certa -->
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:type" content="website">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${img}">
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "${n.nome} em ${n.cidade}",
  "description": "${desc}",
  "url": "${url}",
  "image": "${img}",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "${n.cidade}",
    "addressRegion": "SP",
    "addressCountry": "BR"
  },
  "telephone": "+55${WHATS}",
  "priceRange": "R$${isPremium ? '149' : '49'}-R$199",
  "provider": {
    "@type": "Organization",
    "name": "Vitrine Certa",
    "url": "${SITE_URL}/receita-zero/"
  }
}
</script>`;
}

function injectSEO(filePath, nicho, isPremium) {
  let html = fs.readFileSync(filePath, 'utf8');
  // remover SEO antigo se existir
  html = html.replace(/<!-- SEO Vitrine Certa -->[\s\S]*?<\/script>\s*/g, '');
  const seo = buildSEO(nicho, isPremium);
  // injetar após <meta name="viewport"...> ou após <title>
  if (html.includes('<meta name="viewport"')) {
    html = html.replace(/(<meta name="viewport"[^>]*>)/, `$1\n  ${seo}`);
  } else if (html.includes('</title>')) {
    html = html.replace(/(<\/title>)/, `$1\n  ${seo}`);
  } else {
    html = html.replace(/(<head>)/, `$1\n  ${seo}`);
  }
  fs.writeFileSync(filePath, html);
  return true;
}

let count = 0;
for (const nicho of Object.keys(NICHOS)) {
  const simples = path.join('site-dfy', nicho, 'index.html');
  const premium = path.join('site-dfy', nicho, 'premium', 'index.html');
  if (fs.existsSync(simples)) { injectSEO(simples, nicho, false); count++; }
  if (fs.existsSync(premium)) { injectSEO(premium, nicho, true); count++; }
}
console.log(`✅ SEO injetado em ${count} arquivos`);
