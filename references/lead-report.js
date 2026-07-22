// lead-report.js — lê planilha de leads do Google Sheets e reporta no Telegram
// GATE do usuário: preencher SHEET_ID, BOT_TOKEN, CHAT_ID abaixo.
// Como ler a planilha sem servidor: usar a CSV export pública ou Sheets API.
// Abordagem R$0: tornar a planilha "Qualquer pessoa com o link pode visualizar"
// e ler via /export?format=csv.

const SHEET_ID = 'COLE_ID_DA_PLANILHA';         // do URL docs.google.com/spreadsheets/d/ID/edit
const BOT_TOKEN = 'COLE_TOKEN_BOT_TELEGRAM';
const CHAT_ID = 'COLE_SEU_CHAT_ID';

const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`;

async function fetchCsv() {
  const res = await fetch(CSV_URL);
  const text = await res.text();
  const lines = text.trim().split('\n').map(l => l.split(','));
  const header = lines[0];
  return lines.slice(1).map(r => Object.fromEntries(header.map((h, i) => [h, r[i] || ''])));
}

async function sendTelegram(msg) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: CHAT_ID, text: msg, parse_mode: 'Markdown' })
  });
}

(async () => {
  if (SHEET_ID.indexOf('COLE_') === 0) {
    console.log('⚠️ Configurar SHEET_ID / BOT_TOKEN / CHAT_ID em lead-report.js');
    return;
  }
  const rows = await fetchCsv();
  const novos = rows.filter(r => (r.status || '').trim() === 'novo');
  if (novos.length === 0) {
    console.log('Nenhum lead novo hoje.');
    return;
  }
  let msg = `📊 *Vitrine Certa — ${novos.length} lead(s) novo(s)*\n\n`;
  novos.forEach((r, i) => {
    msg += `${i + 1}. *${r.nome}* (${r.cidade})\n   ${r.nicho} · ${r.whatsapp}\n`;
  });
  await sendTelegram(msg);
  console.log(`✅ Report de ${novos.length} lead(s) enviado ao Telegram.`);
})();
