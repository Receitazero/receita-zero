// playwright-check.js — valida runtime via Playwright
const { chromium } = require('playwright');

(async () => {
  const b = await chromium.launch({ headless: true });
  const p = await b.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push(String(e)));

  const pages = [
    { url: 'http://127.0.0.1:8736/site-dfy/pizzaria/premium/_paralelo/index.html', name: 'pizzaria (paralelo/Hermes)' },
    { url: 'http://127.0.0.1:8736/receita-zero/index.html', name: 'landing (Vitrine Certa)' },
  ];

  let allOk = true;
  for (const page of pages) {
    try {
      await p.goto(page.url, { waitUntil: 'networkidle' });
      await p.waitForTimeout(1200);

      const hiddenParalelo = await p.$$eval('.reveal:not(.on)', el => el.length).catch(() => 0);
      const hiddenLanding = await p.$$eval('.reveal:not(.in)', el => el.length).catch(() => 0);
      const hidden = page.name.includes('paralelo') ? hiddenParalelo : hiddenLanding;

      console.log(`\n📄 ${page.name}:`);
      console.log(`  pageerrors: ${errs.length}`);
      console.log(`  reveals invisíveis: ${hidden}`);

      if (errs.length > 0 || hidden > 0) {
        allOk = false;
        errs.forEach(e => console.log(`  ERR: ${e}`));
      }
    } catch (e) {
      console.log(`\n❌ ${page.name}: ${e.message}`);
      allOk = false;
    }
  }

  console.log(`\n${allOk ? '✅ PLAYWRIGHT_ALL_PASS' : '❌ PLAYWRIGHT_FAIL'}`);
  await b.close();
  process.exit(allOk ? 0 : 1);
})();
