const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext();
  const p = await ctx.newPage();
  // simula beforeinstallprompt disparando
  await p.addInitScript(() => {
    window.addEventListener('DOMContentLoaded', () => {
      const e = new Event('beforeinstallprompt');
      e.preventDefault = () => {};
      e.prompt = () => Promise.resolve({ userChoice: Promise.resolve({ outcome: 'accepted' }) });
      e.userChoice = Promise.resolve({ outcome: 'accepted' });
      window.dispatchEvent(e);
    });
  });
  await p.goto('http://127.0.0.1:8736/receita-zero/index.html', { waitUntil: 'load' });
  await p.waitForTimeout(500);
  const visivel = await p.evaluate(() => { const e=document.getElementById('vc-instalar'); return e && getComputedStyle(e).display !== 'none'; });
  const temFunc = await p.evaluate(() => typeof window.vcInstalarPwa === 'function');
  console.log('botao instalar visivel (apos beforeinstallprompt):', visivel);
  console.log('vcInstalarPwa existe:', temFunc);
  console.log('PWA INSTALAVEL + BOTAO:', (visivel && temFunc) ? 'SIM' : 'NAO');
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
