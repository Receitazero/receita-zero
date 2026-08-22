const { chromium } = require('playwright');
const fs = require('fs');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
<rect width="512" height="512" rx="96" fill="#EDEFF4"/>
<rect x="96" y="140" width="320" height="232" rx="36" fill="none" stroke="#14161D" stroke-width="26"/>
<rect x="96" y="232" width="320" height="14" fill="#14161D"/>
<path d="M150 320 l60 60 96 -120" fill="none" stroke="#E8873A" stroke-width="40" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 512, height: 512 }, deviceScaleFactor: 1 });
  await page.setContent(`<body style="margin:0">${svg}</body>`);
  const el = await page.$('svg');
  const buf192 = await el.screenshot({ path: 'receita-zero/icon-192.png' });
  await page.setViewportSize({ width: 512, height: 512 });
  const buf512 = await el.screenshot({ path: 'receita-zero/icon-512.png' });
  console.log('icons gerados:', fs.statSync('receita-zero/icon-192.png').size, fs.statSync('receita-zero/icon-512.png').size, 'bytes');
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
