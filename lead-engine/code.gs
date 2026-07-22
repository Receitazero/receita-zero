// Motor de lead Vitrine Certa — Google Apps Script (isolado, R$0)
// Nos moldes do motor da AAPSON, mas 100% a parte (planilha sua).
// 1) Crie uma planilha Google; abra Extensões > Apps Script; cole este código.
// 2) Troque NOME_DA_ABA se quiser; publique como Web App (Execute as: Eu,
//    Quem tem acesso: Qualquer um). Copie a URL e cole nos formulários
//    (action=URL, method=POST, com campo hidden "origem").
// 3) Cada lead vira uma linha: data | nicho | nome | whatsapp | msg | status
function doPost(e){
  var p = e.parameter;
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Leads') ||
              SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  sheet.appendRow([
    new Date().toLocaleString('pt-BR'),
    p.origem || '',
    p.nome || '',
    p.whatsapp || '',
    p.mensagem || p.carro || p.data || p.tipo || '',
    'novo'
  ]);
  // aviso no seu e-mail (opcional)
  // MailApp.sendEmail('SEU_EMAIL','Novo lead Vitrine Certa', JSON.stringify(p));
  return ContentService.createTextOutput(JSON.stringify({ok:true}))
    .setMimeType(ContentService.MimeType.JSON);
}
function doGet(e){ return doPost(e); }
