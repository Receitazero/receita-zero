// Vitrine Certa — shim de auth LOCAL (HML sem Supabase)
// Implementa o MESMO contrato de window.VC_AUTH usado por supabase-auth.js,
// mas 100% em localStorage. Nenhuma rede, nenhuma anon key, nenhum CDN.
// Injetado pelo hml-local-server.js no lugar dos 3 <script> de Supabase.
(function () {
  'use strict';

  var DB = 'vc_local_users';     // { email: {password, meta, confirmado} }
  var SESS = 'vc_local_session';

  function ler(k, def) {
    try { return JSON.parse(localStorage.getItem(k)) || def; } catch (e) { return def; }
  }
  function gravar(k, v) {
    try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {}
  }
  function erro(msg) { var e = new Error(msg); e.__local = true; return e; }

  function novaSessao(email, meta) {
    var s = {
      access_token: 'local-' + Math.random().toString(36).slice(2),
      user: { id: 'local-' + email, email: email, user_metadata: meta || {} }
    };
    gravar(SESS, s);
    return s;
  }

  window.VC_LOCAL_MODE = true;

  window.VC_AUTH = {
    client: { __local: true },
    init: function () { return this.client; },

    async login(email, password) {
      var users = ler(DB, {});
      var u = users[email];
      if (!u) throw erro('Invalid login credentials');
      if (u.password !== password) throw erro('Invalid login credentials');
      return { session: novaSessao(email, u.meta), user: { email: email } };
    },

    async signup(email, password, meta) {
      var users = ler(DB, {});
      if (users[email]) throw erro('User already registered');
      users[email] = { password: password, meta: meta || {}, confirmado: true };
      gravar(DB, users);
      // HML local NAO exige confirmacao por e-mail: ja devolve sessao
      return { session: novaSessao(email, meta), user: { email: email } };
    },

    async loginWithGoogle() {
      // Sem OAuth real no local: cria/entra com um usuario de demonstracao
      var email = 'google.demo@vitrinecerta.local';
      var users = ler(DB, {});
      if (!users[email]) { users[email] = { password: null, meta: { via: 'google' }, confirmado: true }; gravar(DB, users); }
      novaSessao(email, { via: 'google' });
      window.location.href = window.location.origin + '/hml/dashboard.html';
    },

    async getSession() { return ler(SESS, null); },

    async logout() { try { localStorage.removeItem(SESS); } catch (e) {} },

    async resetPassword(email) {
      var users = ler(DB, {});
      if (!users[email]) throw erro('User not found');
      console.info('[HML local] reset de senha simulado para', email);
      return true;
    },

    async syncProfile() {
      var s = await this.getSession();
      if (s && s.user) {
        try { localStorage.setItem('vc_email', s.user.email || ''); } catch (e) {}
      } else {
        try { localStorage.removeItem('vc_email'); } catch (e) {}
      }
      return s;
    }
  };

  // Marca visual para nao confundir HML local com PRD
  document.addEventListener('DOMContentLoaded', function () {
    var b = document.createElement('div');
    b.textContent = 'HML LOCAL — sem Supabase, sem cobranca real';
    b.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:99999;background:#D9F03A;color:#0B0714;' +
      'font:600 12px/1.6 system-ui,sans-serif;text-align:center;padding:4px;letter-spacing:.04em';
    document.body.appendChild(b);
  });
})();
