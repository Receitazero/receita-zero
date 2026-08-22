// i18n — Vitrine Certa (Mês 6 / Mês 15)
// Toggle PT/EN determinístico (sem IA). Dois modos:
//   1) Atributos [data-en]/[data-pt] no próprio elemento (usado em trechos curtos).
//   2) Dicionário JSON (/i18n-dict.json) para blocos maiores (fallback do modo 1).
// Estado gravado em localStorage. Botão chama window.vcTrocaIdioma('en'|'pt').
(function () {
  var DICT_URL = '/i18n-dict.json';

  function aplica(lang) {
    document.documentElement.lang = lang;
    // modo 1: atributos no elemento
    document.querySelectorAll('[data-en]').forEach(function (el) {
      if (lang === 'en') el.textContent = el.getAttribute('data-en');
      else if (el.hasAttribute('data-pt')) el.textContent = el.getAttribute('data-pt');
      else el.textContent = el.getAttribute('data-pt-default') || el.textContent;
    });
    // modo 2: dicionário por id
    if (window.__vcI18nDict) {
      document.querySelectorAll('[data-i18n]').forEach(function (el) {
        var key = el.getAttribute('data-i18n');
        var txt = window.__vcI18nDict[key] && window.__vcI18nDict[key][lang];
        if (txt) el.innerHTML = txt;
      });
    }
    document.querySelectorAll('[data-i18n-label]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-label');
      var txt = window.__vcI18nDict && window.__vcI18nDict[key] && window.__vcI18nDict[key][lang];
      if (txt) el.setAttribute('aria-label', txt);
    });
  }

  function carregaDict(cb) {
    if (window.__vcI18nDict) return cb();
    try {
      var x = new XMLHttpRequest();
      x.open('GET', DICT_URL, true);
      x.onload = function () {
        try { window.__vcI18nDict = JSON.parse(x.responseText); } catch (e) {}
        cb();
      };
      x.onerror = function () { cb(); };
      x.send();
    } catch (e) { cb(); }
  }

  window.vcTrocaIdioma = function (lang) {
    localStorage.setItem('vc_lang', lang);
    carregaDict(function () { aplica(lang); });
  };

  // salva o PT original uma vez (modo 1)
  document.querySelectorAll('[data-en]').forEach(function (el) {
    if (!el.hasAttribute('data-pt')) el.setAttribute('data-pt', el.textContent);
    el.setAttribute('data-pt-default', el.getAttribute('data-pt') || el.textContent);
  });

  var salvo = localStorage.getItem('vc_lang') || 'pt';
  carregaDict(function () { aplica(salvo); });
})();
