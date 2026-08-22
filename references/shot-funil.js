// shot-funil.js — screenshots do funil barbearia v1..v5 com Playwright
// viewport 1280x1600, fullPage, registra pageerror por pagina
// Uso: node references/shot-funil.js  (da raiz do repo)
const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const dir = path.join('site-dfy', 'barbearia', '_funil');
  const b = await chromium.launch({ headless: true });
  const results = [];
  let allOk = true;

  for (let i = 1; i <= 5; i++) {
    const file = `v${i}.html`;
    const out = path.join(dir, `shot-v${i}.png`);
    const url = 'file://' + path.resolve(path.join(dir, file));
    const p = await b.newPage({ viewport: { width: 1280, height: 1600 } });
    const errs = [];
    p.on('pageerror', e => errs.push(String(e)));
    try {
      await p.goto(url, { waitUntil: 'networkidle' });
      // garante fontes (Google Fonts CDN)
      await p.evaluate(() => document.fonts && document.fonts.ready);
      await p.waitForTimeout(600);
      await p.screenshot({ path: out, fullPage: true });
      const status = errs.length === 0 ? 'OK' : 'ERR';
      if (errs.length > 0) allOk = false;
      results.push({ file, pageerrors: errs.length, status });
      if (errs.length) errs.forEach(e => console.log(`  ERR ${file}: ${e}`));
    } catch (e) {
      allOk = false;
      results.push({ file, pageerrors: 'EXC', status: 'ERR' });
      console.log(`❌ ${file}: ${e.message}`);
    }
    await p.close();
  }

  console.log('\n📄 Funil barbearia — shots 1280x1600:');
  for (const r of results) {
    console.log(`  ${r.status === 'OK' ? '✅' : '❌'} shot-v${r.file.split('.')[0].slice(1)}.png  (${r.file})  pageerrors: ${r.pageerrors}`);
  }
  console.log(`\n${allOk ? '✅ FUNIL_SHOTS_ALL_OK' : '❌ FUNIL_SHOTS_FAIL'}`);
  await b.close();
  process.exit(allOk ? 0 : 1);
})();
