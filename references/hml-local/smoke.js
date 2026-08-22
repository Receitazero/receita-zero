#!/usr/bin/env node
/**
 * Smoke test do HML local. Sobe o servidor numa porta efemera, exercita o fluxo
 * inteiro + bordas, derruba e devolve exit code. Sem dependencia externa.
 *
 *   node references/hml-local/smoke.js
 */
'use strict';

const { spawn } = require('child_process');
const path = require('path');

const PORTA = 8799;
const BASE = `http://127.0.0.1:${PORTA}`;
const SRV = path.join(__dirname, 'hml-local-server.js');

let falhas = 0;
const ok = (n, c, extra) => {
  console.log(`${c ? '  ok  ' : 'FALHA '} ${n}${!c && extra ? ' -> ' + extra : ''}`);
  if (!c) falhas++;
};

const j = async (rota, opts) => {
  const r = await fetch(BASE + rota, opts);
  let b = null;
  try { b = await r.json(); } catch (e) { /* html */ }
  return { status: r.status, body: b };
};
const t = async (rota) => (await fetch(BASE + rota)).text();

async function main() {
  const srv = spawn(process.execPath, [SRV, '--porta', String(PORTA)], { stdio: 'ignore' });
  const encerrar = () => { try { srv.kill(); } catch (e) {} };
  process.on('exit', encerrar);

  // espera subir
  for (let i = 0; i < 40; i++) {
    try { await fetch(BASE + '/__hml/estado'); break; } catch (e) { await new Promise((r) => setTimeout(r, 100)); }
  }

  // --- reescrita de HTML (o coracao do design: nao editar o repo)
  const login = await t('/hml/login.html');
  ok('login.html sem CDN jsdelivr', !login.includes('jsdelivr'));
  ok('login.html sem supabase-config.js', !login.includes('supabase-config.js'));
  ok('login.html com shim local', login.includes('/__hml/vc-auth-local.js'));

  const checkout = await t('/hml/checkout.html');
  ok('checkout aponta API local', checkout.includes('data-api-url="/api/v1/vc-checkout"'));
  ok('checkout sem URL de PRD', !checkout.includes('saas-confianca-cobranca'));

  // --- contrato do shim
  const shim = await t('/__hml/vc-auth-local.js');
  for (const m of ['login', 'signup', 'loginWithGoogle', 'getSession', 'logout', 'resetPassword', 'syncProfile']) {
    ok(`shim expoe ${m}()`, new RegExp(`(async )?${m}\\s*\\(`).test(shim));
  }

  // --- fluxo feliz, os 3 planos
  for (const [plano, valor] of [['basico', 49], ['plus', 99], ['premium', 149]]) {
    const c = await j('/api/v1/vc-checkout', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plano, pme_email: `${plano}@teste.local`, pme_nome: 'Teste' })
    });
    ok(`checkout ${plano} = 200`, c.status === 200, String(c.status));
    ok(`checkout ${plano} tem redirect`, !!(c.body && c.body.redirect_url));
    ok(`checkout ${plano} valor R$${valor}`, (c.body.redirect_url || '').includes(`valor=${valor}`));

    const p = await j('/__hml/pagar', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription_id: c.body.subscription_id, aprovar: true })
    });
    ok(`pagar ${plano} -> pago`, p.body && p.body.status === 'pago');
    ok(`pagar ${plano} -> activated`, p.body && p.body.evento === 'subscription.activated');
  }

  // --- caminho de falha
  const cf = await j('/api/v1/vc-checkout', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plano: 'basico', pme_email: 'falha@teste.local' })
  });
  const pf = await j('/__hml/pagar', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subscription_id: cf.body.subscription_id, aprovar: false })
  });
  ok('recusa -> falhou', pf.body && pf.body.status === 'falhou');
  ok('recusa -> subscription.failed', pf.body && pf.body.evento === 'subscription.failed');

  // --- bordas
  ok('plano invalido = 400', (await j('/api/v1/vc-checkout', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plano: 'pirata', pme_email: 'a@b.local' })
  })).status === 400);

  ok('sem pme_email = 400', (await j('/api/v1/vc-checkout', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plano: 'basico' })
  })).status === 400);

  ok('corpo vazio = 400', (await j('/api/v1/vc-checkout', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: ''
  })).status === 400);

  ok('pagar assinatura inexistente = 404', (await j('/__hml/pagar', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subscription_id: 'nao-existe' })
  })).status === 404);

  ok('404 em rota inexistente', (await fetch(BASE + '/hml/nao-existe.html')).status === 404);

  // path traversal: nao pode servir fora da raiz do repo
  const tv = await fetch(BASE + '/../../../Windows/win.ini');
  ok('path traversal barrado', tv.status === 403 || tv.status === 404, String(tv.status));

  // --- estado consistente
  const est = await j('/__hml/estado');
  ok('estado: 4 cobrancas', est.body.cobrancas.length === 4, String(est.body.cobrancas.length));
  ok('estado: 4 eventos', est.body.eventos.length === 4, String(est.body.eventos.length));
  ok('estado: 3 pagas + 1 falhou',
    est.body.cobrancas.filter((c) => c.status === 'pago').length === 3 &&
    est.body.cobrancas.filter((c) => c.status === 'falhou').length === 1);

  encerrar();
  console.log(falhas ? `\n${falhas} FALHA(S)` : '\nHML_LOCAL_ALL_PASS');
  process.exit(falhas ? 1 : 0);
}

main().catch((e) => { console.error('erro:', e.message); process.exit(1); });
