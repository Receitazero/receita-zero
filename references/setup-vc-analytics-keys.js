// setup-vc-analytics-keys.js — helper do CEO.
// Uso: node references/setup-vc-analytics-keys.js <CLARITY_ID> <SC_VERIFICATION>
// Exemplo:
//   node references/setup-vc-analytics-keys.js "abc123xyz" "abcDEF123ghiJKL456mnoPQR789"
// O que faz:
//   1. salva os 2 IDs em ~/.secrets/vc-clarity-id e ~/.secrets/vc-sc-verification
//      (ACL: so o usuario kauea le, igual padrao do Mercado Pago)
//   2. roda a injecao real (ativa a tag em todos os 32 index.html)
// PRE-REQUISITO: voce ja criou o projeto no clarity.ms e a propriedade no
// Google Search Console (veja docs/DASHBOARD-INSIGHTS.md §0/§2).
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

let clarityId = process.argv[2];
let scId = process.argv[3];
const home = process.env.USERPROFILE || process.env.HOME;
const secrets = path.join(home, '.secrets');
fs.mkdirSync(secrets, { recursive: true });
const f1 = path.join(secrets, 'vc-clarity-id');
const f2 = path.join(secrets, 'vc-sc-verification');
// Se vier vazio na CLI, reusa o que ja existe no cofre (arquivos sao read-only por ACL)
if (!clarityId && fs.existsSync(f1)) clarityId = fs.readFileSync(f1, 'utf8').trim();
if (!scId && fs.existsSync(f2)) scId = fs.readFileSync(f2, 'utf8').trim();
if (!clarityId || !scId) {
  console.log('USO: node references/setup-vc-analytics-keys.js <CLARITY_ID> <SC_VERIFICATION>');
  console.log('   (ou omita um dos dois se ja estiver no cofre)');
  process.exit(1);
}
// So escreve se o arquivo nao existir (cofre e read-only por ACL)
if (!fs.existsSync(f1)) {
  fs.writeFileSync(f1, clarityId.trim());
  try { execSync(`icacls "${f1}" /grant KAUE\\kauea:(R)`); } catch (e) {}
}
if (!fs.existsSync(f2)) {
  fs.writeFileSync(f2, scId.trim());
  try { execSync(`icacls "${f2}" /grant KAUE\\kauea:(R)`); } catch (e) {}
}
console.log('✅ IDs no cofre:', f1, f2);
// ativar tag real
execSync('node references/inject-analytics.js', { stdio: 'inherit' });
