/**
 * Vitrine Certa — Lead Capture (Google Apps Script)
 * Deploy: Script.google.com → Novo projeto → colar este código →
 *   Publicar → Implementar como app da web →
 *   "Executar como: Eu" / "Quem tem acesso: Qualquer pessoa, mesmo anônima"
 * Copiar a URL gerada e colar em references/leads.js (window.VC_LEADS_URL).
 */
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('leads') ||
                SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    // cabeçalho se vazio
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['timestamp', 'nome', 'cidade', 'nicho', 'origem', 'whatsapp', 'mensagem', 'status']);
    }
    sheet.appendRow([
      new Date().toISOString(),
      data.nome || '',
      data.cidade || '',
      data.nicho || '',
      data.origem || 'site',
      data.whatsapp || '',
      data.mensagem || '',
      'novo'
    ]);
    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput('Vitrine Certa lead endpoint OK')
    .setMimeType(ContentService.MimeType.TEXT);
}
