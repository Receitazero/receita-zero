// verify-syntax.js — node --check em CADA <script> de CADA .html do repo
// CORREÇÃO: só inspeciona <script>, NÃO <style> (falso positivo no CSS).
// Uso: node references/verify-syntax.js  (da raiz do repo)
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = process.cwd();
let htmlFiles = [];
function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.name === '.git') continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.html')) htmlFiles.push(p);
  }
}
walk(root);

let problems = 0;
let scripts = 0;
for (const hf of htmlFiles) {
  const h = fs.readFileSync(hf, 'utf8');
  // SÓ <script>, nunca <style>
  const re = /<script>([\s\S]*?)<\/script>/g;
  let m;
  while ((m = re.exec(h)) !== null) {
    scripts++;
    const js = m[1];
    const tmp = path.join(require('os').tmpdir(), `_chk_${scripts}.js`);
    fs.writeFileSync(tmp, js, 'utf8');
    try {
      execFileSync('node', ['--check', tmp], { stdio: 'pipe' });
      fs.unlinkSync(tmp);
    } catch (e) {
      problems++;
      const rel = path.relative(root, hf);
      const err = (e.stderr || e.message || '').toString().trim().split('\n').pop();
      console.error(`\n❌ ${rel}`);
      console.error(`   script #${scripts}: ${err || 'SyntaxError'}`);
      fs.unlinkSync(tmp);
    }
  }
}
console.log(`\n📄 ${htmlFiles.length} arquivos HTML | ${scripts} <script> checados | ${problems} problema(s)`);
if (problems === 0) console.log('✅ SYNTAX_ALL_OK');
process.exit(problems === 0 ? 0 : 1);
