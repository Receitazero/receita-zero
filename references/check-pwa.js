const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  const swOk = await page.evaluate(() => 'serviceWorker' in navigator);
  await page.goto('https://vitrinecerta.app.br/receita-zero/index.html', { waitUntil: 'load' });
  await page.waitForTimeout(1500);
  const manifest = await page.evaluate(async () => {
    const l = document.querySelector('link[rel=manifest]');
    if (!l) return { ok: false, why: 'sem link manifest' };
    try {
      const res = await fetch(l.href, { cache: 'no-store' });
      const j = await res.json();
      return { ok: true, name: j.name, has512: j.icons.some(i => i.sizes.includes('512')), start: j.start_url };
    } catch (e) { return { ok: false, why: 'fetch falhou: ' + e.message }; }
  });
  const reg = await page.evaluate(() => navigator.serviceWorker ? navigator.serviceWorker.getRegistration().then(r => !!r) : false);
  const icon = await page.evaluate(async () => {
    const res = await fetch('/icon-512.png');
    return res.ok ? (await res.blob()).size : 0;
  });
  console.log('SW suportado:', swOk);
  console.log('manifest:', JSON.stringify(manifest));
  console.log('SW registrado:', reg);
  console.log('icon-512 bytes:', icon);
  console.log('pageerrors:', errors.length ? errors : 'none');
  console.log('INSTALAVEL (manifest+512+SW):', manifest.ok && manifest.has512 && reg && icon > 0 ? 'SIM' : 'NAO');
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
