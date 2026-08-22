// Visual regression baseline — Vitrine Certa (Mês 8)
// Tira screenshots de todos os sites DFY + landing como baseline.
// Uso: node references/visual-baseline.js  (gera references/baseline/*.png)
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = 'http://127.0.0.1:8736';
const NICHOS = ['barbearia','clínica','imobiliária','lavanderia','oficina','padaria','pet','pizzaria','restaurante','salão'];
const PAGS = ['/receita-zero/index.html', '/receita-zero/checkout.html', '/receita-zero/templates.html', ...NICHOS.map(n => `/site-dfy/${n}/index.html`)];

(async () => {
  const browser = await chromium.launch();
  const out = path.join(__dirname, 'baseline');
  fs.mkdirSync(out, { recursive: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  for (const p of PAGS) {
    const name = p.replace(/\//g, '_').replace(/^_/, '') || 'root';
    try {
      await page.goto(BASE + p, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(400);
      await page.screenshot({ path: path.join(out, name + '.png'), fullPage: false });
      console.log('OK', p);
    } catch (e) {
      console.warn('FALHOU', p, e.message);
    }
  }
  await browser.close();
  console.log('Baseline em', out);
})().catch(e => { console.error(e); process.exit(1); });
