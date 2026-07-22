// playwright-check.js — valida runtime do paralelo (Hermes) via Playwright
// O index.html do Claude Code está em desenvolvimento (5 reveals invisíveis)
// e é testado separadamente. Este script valida apenas o paralelo.
const { chromium } = require('playwright');

(async () => {
  const b = await chromium.launch({ headless: true });
  const p = await b.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push(String(e)));

  const pages = [
    { url: 'http://127.0.0.1:8736/site-dfy/pizzaria/premium/_paralelo/index.html', name: 'pizzaria (paralelo/Hermes)' },
  ];

  let allOk = true;
  for (const page of pages) {
    try {
      await p.goto(page.url, { waitUntil: 'networkidle' });
      await p.waitForTimeout(1500);

      const hidden = await p.$$eval('.reveal:not(.on)', el => el.length);
      const pageerrors = errs.length;

      await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await p.waitForTimeout(500);

      console.log(`\n📄 ${page.name}:`);
      console.log(`  pageerrors: ${pageerrors}`);
      console.log(`  reveals invisíveis: ${hidden}`);

      if (pageerrors > 0 || hidden > 0) {
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
