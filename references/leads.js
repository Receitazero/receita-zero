// leads.js — captura de leads da Vitrine Certa para Google Sheets (via Apps Script)
// Inclua em cada site: <script src="../../references/leads.js"></script> antes do </body>
// Configure a URL do Apps Script (deploy como Web App) abaixo:
window.VC_LEADS_URL = 'COLE_A_URL_DO_APPS_SCRIPT_AQUI';

window.captureLead = function (data) {
  var url = window.VC_LEADS_URL;
  if (!url || url.indexOf('COLE_A') === 0) return; // silencioso se não configurado
  try {
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).catch(function () {});
  } catch (e) {}
};
