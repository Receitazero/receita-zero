// playwright-check.js — valida runtime de todos os premiums via Playwright
// Uso: node references/playwright-check.js (precisa do servidor HTTP rodando)
const { chromium } = require('playwright');

(async () => {
  const b = await chromium.launch({ headless: true });
  const p = await b.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push(String(e)));

  const pages = [
    { url: 'http://127.0.0.1:8736/site-dfy/pizzaria/premium/index.html', name: 'pizzaria' },
  ];

  let allOk = true;
  for (const page of pages) {
    try {
      await p.goto(page.url, { waitUntil: 'networkidle' });
      await p.waitForTimeout(1500);

      const hidden = await p.$$eval('.reveal:not(.in)', el => el.length);
      const pageerrors = errs.length;

      // scroll pro final pra ativar timelines
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
