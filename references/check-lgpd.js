const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  // limpa consentimento
  await p.addInitScript(() => { try { localStorage.removeItem('vc_lgpd'); } catch(e){} });
  await p.goto('http://127.0.0.1:8736/receita-zero/index.html', { waitUntil: 'load' });
  await p.waitForTimeout(800);
  const clarityAntes = await p.evaluate(() => typeof window.clarity !== 'undefined');
  const bannerVisivel = await p.evaluate(() => { const e=document.getElementById('vc-lgpd'); return e && getComputedStyle(e).display !== 'none'; });
  // aceita
  await p.evaluate(() => window.vcLgpdAceitar());
  await p.waitForTimeout(800);
  const clarityApos = await p.evaluate(() => typeof window.clarity !== 'undefined');
  const consent = await p.evaluate(() => localStorage.getItem('vc_lgpd'));
  console.log('banner visivel (sem consent):', bannerVisivel);
  console.log('clarity ANTES:', clarityAntes, '| DEPOIS aceite:', clarityApos);
  console.log('localStorage vc_lgpd:', consent);
  console.log('LGPD OK (nao rastreia sem consent):', !clarityAntes && clarityApos && consent==='ok' ? 'SIM' : 'NAO');
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
