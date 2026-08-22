// compare-shots.js — screenshots lado-a-lado de Claude vs Hermes (pizzaria)
// Uso: node references/compare-shots.js
const { chromium } = require('playwright');

(async () => {
  const b = await chromium.launch({ headless: true });
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });

  const nichos = ['pizzaria'];
  for (const n of nichos) {
    const claude = `http://127.0.0.1:8736/site-dfy/${n}/premium/index.html`;
    const hermes = `http://127.0.0.1:8736/site-dfy/${n}/premium/_paralelo/index.html`;
    for (const h of ['14', '21']) {
      // Claude
      await p.goto(`${claude}?h=${h}`, { waitUntil: 'load' });
      await p.waitForTimeout(1500);
      await p.evaluate(() => window.scrollTo(0, 250));
      await p.waitForTimeout(400);
      await p.screenshot({ path: `site-dfy/${n}/premium/_ref/claude-${h}.png` });
      // Hermes
      await p.goto(`${hermes}?h=${h}`, { waitUntil: 'load' });
      await p.waitForTimeout(1500);
      await p.evaluate(() => window.scrollTo(0, 250));
      await p.waitForTimeout(400);
      await p.screenshot({ path: `site-dfy/${n}/premium/_ref/hermes-${h}.png` });
      console.log(`✅ ${n} ?h=${h}: claude + hermes`);
    }
  }
  await b.close();
  console.log('Pronto. Comparar em site-dfy/pizzaria/premium/_ref/');
})();
