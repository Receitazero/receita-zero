// shot-v10c.js — screenshot Playwright do v10c.html (jornal quente)
// viewport 1280x1600, fullPage, document.fonts.ready, registra pageerror
// Uso: node references/shot-v10c.js  (da raiz do repo)
const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const dir = path.join('site-dfy', 'restaurante', '_funil');
  const file = 'v10c.html';
  const out = path.join(dir, 'shot-v10c.png');
  const url = 'file://' + path.resolve(path.join(dir, file));
  const b = await chromium.launch({ headless: true });
  const p = await b.newPage({ viewport: { width: 1280, height: 1600 } });
  const errs = [];
  p.on('pageerror', function(e) { errs.push(String(e)); });
  try {
    await p.goto(url, { waitUntil: 'networkidle' });
    await p.evaluate(function() { return document.fonts && document.fonts.ready; });
    await p.waitForTimeout(800);
    await p.screenshot({ path: out, fullPage: true });
    if (errs.length === 0) {
      console.log('OK shot-v10c.png  (' + file + ')  pageerrors: 0');
    } else {
      errs.forEach(function(e) { console.log('  ERR ' + file + ': ' + e); });
      console.log('ERR shot-v10c.png  pageerrors: ' + errs.length);
    }
  } catch (e) {
    console.log('EXC ' + file + ': ' + e.message);
  }
  await p.close();
  await b.close();
  process.exit(errs.length === 0 ? 0 : 1);
})();
