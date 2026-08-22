const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },  // iPhone 12 viewport
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });
  const page = await ctx.newPage();

  const reqs = [];
  ctx.on('response', (res) => {
    const r = res.request();
    const headers = res.headers;
    reqs.push({
      url: res.url(),
      status: res.status,
      size: +(headers['content-length'] || 0),
      ttl: headers['cache-control'] || headers['expires'] || '(none)',
      type: headers['content-type'] || '',
    });
  });

  const start = Date.now();
  await page.goto('https://vitrinecerta.app.br/receita-zero/index.html', { waitUntil: 'load' });

  // Coleta Core Web Vitals via PerformanceObserver (injeta antes do load seria ideal, mas usamos API já registrada)
  const cwv = await page.evaluate(() => new Promise((resolve) => {
    const out = { lcp: null, fcp: null, cls: 0, tbt: null };
    try {
      const po = new PerformanceObserver((list) => {
        for (const e of list.getEntries()) {
          if (e.name === 'LCP' || e.entryType === 'largest-contentful-paint') out.lcp = Math.round(e.startTime);
          if (e.name === 'FCP' || e.entryType === 'first-contentful-paint') out.fcp = Math.round(e.startTime);
        }
      });
      po.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
    } catch (e) {}
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) if (!e.hadRecentInput) out.cls += e.value;
    }).observe({ entryTypes: ['layout-shift'] });
    setTimeout(() => {
      // TBT aproximado a partir do long tasks
      resolve(out);
    }, 2500);
  }));

  // TBT via longtasks
  const tbt = await page.evaluate(() => new Promise((resolve) => {
    let tbt = 0;
    try {
      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) {
          const blocking = e.duration - 50;
          if (blocking > 0) tbt += blocking;
        }
      }).observe({ entryTypes: ['longtask'] });
    } catch (e) {}
    setTimeout(() => resolve(Math.round(tbt)), 2500);
  }));

  const domContent = await page.evaluate(() => Math.round(performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart));
  const loadEvt = await page.evaluate(() => Math.round(performance.timing.loadEventEnd - performance.timing.navigationStart));

  console.log('=== Core Web Vitals (mobile, ar) ===');
  console.log('FCP:', cwv.fcp, 'ms');
  console.log('LCP:', cwv.lcp, 'ms');
  console.log('TBT (aprox):', tbt, 'ms');
  console.log('CLS:', cwv.cls.toFixed(3));
  console.log('DOMContentLoaded:', domContent, 'ms');
  console.log('Load:', loadEvt, 'ms');
  console.log('Total requests:', reqs.length);
  const third = reqs.filter(r => !r.url.includes('vitrinecerta.app.br'));
  console.log('3rd-party requests:', third.length, third.map(r => r.url.split('/')[2]).join(', '));
  const clarity = reqs.find(r => r.url.includes('clarity.ms'));
  if (clarity) console.log('Clarity:', clarity.size, 'bytes | cache:', clarity.ttl);
  const leads = reqs.find(r => r.url.includes('leads.js'));
  if (leads) console.log('leads.js:', leads.size, 'bytes | cache:', leads.ttl);
  console.log('=== requests (top por tamanho) ===');
  reqs.sort((a, b) => b.size - a.size).slice(0, 8).forEach(r => console.log(' ', (r.size/1024).toFixed(1)+'KiB', r.ttl.slice(0,30), r.url.slice(0,70)));

  await browser.close();
})().catch(e => { console.error('ERR', e); process.exit(1); });
